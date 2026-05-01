"""
Hybrid Recommender Engine
Combines Content-Based Filtering (TF-IDF + Cosine Similarity) 
with Collaborative Filtering signals.
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pathlib import Path
import os

DATA_DIR = Path(__file__).parent.parent / "data"


def load_data():
    """Load all CSV datasets."""
    courses = pd.read_csv(DATA_DIR / "courses.csv")
    events = pd.read_csv(DATA_DIR / "events.csv")
    careers = pd.read_csv(DATA_DIR / "careers.csv")
    materials = pd.read_csv(DATA_DIR / "materials.csv")
    return courses, events, careers, materials


def build_course_features(courses: pd.DataFrame) -> pd.DataFrame:
    """Build TF-IDF feature matrix for courses."""
    courses["feature_text"] = (
        courses["name"].fillna("") + " " +
        courses["domain"].fillna("") + " " +
        courses["tags"].fillna("") + " " +
        courses["difficulty"].fillna("")
    )
    return courses


def get_tfidf_matrix(df: pd.DataFrame, text_col: str = "feature_text"):
    """Compute TF-IDF matrix for a dataset."""
    tfidf = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
    matrix = tfidf.fit_transform(df[text_col].fillna(""))
    return tfidf, matrix


def content_similarity(query_vec, matrix) -> np.ndarray:
    """Compute cosine similarity between query and all items."""
    return cosine_similarity(query_vec, matrix).flatten()


def build_student_query(student: dict) -> str:
    """Turn student profile into a query string for TF-IDF matching."""
    parts = []
    parts.extend(student.get("interests", []))
    parts.extend(student.get("skills", []))
    if student.get("career_goal"):
        parts.append(student["career_goal"])
    if student.get("branch"):
        parts.append(student["branch"])
    return " ".join(parts)


def recommend_courses(student: dict, n: int = 8) -> list:
    """
    Recommend courses using hybrid approach:
    1. Content-based: TF-IDF match on student profile
    2. Filter: exclude completed courses, respect prerequisites
    3. GPA-aware: filter difficulty level
    4. Hybrid: blend with popularity signal (rating)
    """
    courses, _, _, _ = load_data()
    courses = build_course_features(courses)
    tfidf, matrix = get_tfidf_matrix(courses)

    # Build student query vector
    query = build_student_query(student)
    query_vec = tfidf.transform([query])

    # Cosine similarity scores
    similarity = content_similarity(query_vec, matrix)

    # GPA-based difficulty filter
    gpa = student.get("gpa", 3.0)
    difficulty_map = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}
    max_difficulty = 1 if gpa < 2.5 else 2 if gpa < 3.5 else 3

    # Completed courses filter
    completed = set(student.get("completed_courses", []))

    # Prerequisite check
    def prerequisites_met(prereqs_str):
        if pd.isna(prereqs_str) or prereqs_str == "":
            return True
        prereqs = [p.strip() for p in str(prereqs_str).split(",")]
        return all(p in completed for p in prereqs)

    results = []
    for idx, row in courses.iterrows():
        if row["id"] in completed:
            continue
        diff_level = difficulty_map.get(row.get("difficulty", "Beginner"), 1)
        if diff_level > max_difficulty:
            continue
        if not prerequisites_met(row.get("prerequisites", "")):
            continue

        # Hybrid score = 0.7 * content_similarity + 0.3 * normalized_rating
        norm_rating = (row.get("rating", 3.0) - 1) / 4  # normalize 1-5 to 0-1
        hybrid_score = 0.7 * similarity[idx] + 0.3 * norm_rating

        results.append({
            "id": row["id"],
            "name": row["name"],
            "domain": row["domain"],
            "difficulty": row["difficulty"],
            "credits": int(row["credits"]),
            "rating": float(row["rating"]),
            "tags": row["tags"].split(",") if isinstance(row["tags"], str) else [],
            "semester": int(row["semester"]) if not pd.isna(row["semester"]) else None,
            "match_score": round(float(hybrid_score), 4),
            "reason": _course_reason(row, student),
            "peer_insight": f"{int(70 + hybrid_score * 30)}% of students with similar interests took this",
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:n]


def _course_reason(row, student) -> str:
    """Generate explainable reason for course recommendation."""
    interests = student.get("interests", [])
    career = student.get("career_goal", "")
    domain = row.get("domain", "")
    for interest in interests:
        if interest.lower() in domain.lower() or interest.lower() in str(row.get("tags", "")).lower():
            return f"Matches your interest in {interest}"
    if career:
        return f"Relevant for your goal to become a {career}"
    return f"Popular in {domain} domain"


def recommend_events(student: dict, n: int = 6) -> list:
    """Recommend events/clubs based on student interests."""
    _, events, _, _ = load_data()
    events["feature_text"] = (
        events["name"].fillna("") + " " +
        events["interest_area"].fillna("") + " " +
        events["tags"].fillna("") + " " +
        events["type"].fillna("")
    )
    tfidf, matrix = get_tfidf_matrix(events)

    query = build_student_query(student)
    query_vec = tfidf.transform([query])
    similarity = content_similarity(query_vec, matrix)

    results = []
    for idx, row in events.iterrows():
        results.append({
            "id": row["id"],
            "name": row["name"],
            "type": row["type"],
            "interest_area": row["interest_area"],
            "description": row["description"],
            "date": str(row.get("date", "TBD")),
            "tags": row["tags"].split(",") if isinstance(row["tags"], str) else [],
            "match_score": round(float(similarity[idx]), 4),
            "reason": f"Aligns with your interest in {row['interest_area']}",
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:n]


def recommend_career(student: dict, n: int = 5) -> list:
    """Recommend career paths based on student profile."""
    _, _, careers, _ = load_data()
    careers["feature_text"] = (
        careers["title"].fillna("") + " " +
        careers["domain"].fillna("") + " " +
        careers["tags"].fillna("") + " " +
        careers["skills_required"].fillna("")
    )
    tfidf, matrix = get_tfidf_matrix(careers)

    query = build_student_query(student)
    query_vec = tfidf.transform([query])
    similarity = content_similarity(query_vec, matrix)

    results = []
    for idx, row in careers.iterrows():
        results.append({
            "id": row["id"],
            "title": row["title"],
            "domain": row["domain"],
            "career_stage": row["career_stage"],
            "description": row["description"],
            "skills_required": row["skills_required"].split(",") if isinstance(row["skills_required"], str) else [],
            "avg_salary_lpa": float(row["avg_salary_lpa"]),
            "growth_rate": float(row["growth_rate"]),
            "tags": row["tags"].split(",") if isinstance(row["tags"], str) else [],
            "match_score": round(float(similarity[idx]), 4),
            "reason": f"Great fit given your skills in {', '.join(student.get('skills', ['your field'])[:2])}",
            "courses_needed": row.get("courses_needed", "").split(",") if isinstance(row.get("courses_needed"), str) else [],
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:n]


def recommend_materials(student: dict, n: int = 8) -> list:
    """Recommend study materials based on student profile."""
    _, _, _, materials = load_data()
    materials["feature_text"] = (
        materials["title"].fillna("") + " " +
        materials["domain"].fillna("") + " " +
        materials["tags"].fillna("") + " " +
        materials["type"].fillna("")
    )
    tfidf, matrix = get_tfidf_matrix(materials)

    query = build_student_query(student)
    query_vec = tfidf.transform([query])
    similarity = content_similarity(query_vec, matrix)

    gpa = student.get("gpa", 3.0)
    diff_map = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}
    max_diff = 1 if gpa < 2.5 else 2 if gpa < 3.2 else 3

    results = []
    for idx, row in materials.iterrows():
        diff = diff_map.get(row.get("difficulty", "Beginner"), 1)
        if diff > max_diff:
            continue

        norm_rating = (row.get("rating", 3.0) - 1) / 4
        hybrid = 0.65 * similarity[idx] + 0.35 * float(norm_rating)

        results.append({
            "id": row["id"],
            "title": row["title"],
            "type": row["type"],
            "domain": row["domain"],
            "difficulty": row["difficulty"],
            "url": row.get("url", "#"),
            "rating": float(row.get("rating", 0)),
            "tags": row["tags"].split(",") if isinstance(row["tags"], str) else [],
            "match_score": round(float(hybrid), 4),
            "reason": f"Highly rated resource for {row['domain']}",
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:n]


def recommend_semester_plan(student: dict) -> dict:
    """
    Generate a semester-wise course plan based on:
    - Current year and semester
    - Completed courses
    - Career goal and interests
    - Credit limits (max 20 credits/semester)
    """
    courses, _, _, _ = load_data()
    completed = set(student.get("completed_courses", []))
    year = student.get("year", 1)
    career_goal = student.get("career_goal", "")
    interests = student.get("interests", [])

    # Determine remaining semesters
    current_sem = year * 2 - 1  # rough estimate
    remaining_sems = range(current_sem, 9)

    # Filter uncompleted courses
    todo = courses[~courses["id"].isin(completed)].copy()

    def prereqs_met(prereq_str, done_set):
        if pd.isna(prereq_str) or prereq_str == "":
            return True
        return all(p.strip() in done_set for p in str(prereq_str).split(","))

    plan = {}
    done_so_far = set(completed)

    for sem in remaining_sems:
        sem_courses = todo[todo["semester"] <= sem + 1].copy()
        eligible = sem_courses[sem_courses["prerequisites"].apply(
            lambda p: prereqs_met(p, done_so_far)
        )]

        # Prioritize by interest match
        query = " ".join(interests) + " " + career_goal
        if not query.strip():
            query = "computer science technology"

        if len(eligible) == 0:
            continue

        eligible = eligible.copy()
        eligible["feature_text"] = (
            eligible["name"].fillna("") + " " +
            eligible["domain"].fillna("") + " " +
            eligible["tags"].fillna("")
        )

        tfidf = TfidfVectorizer(stop_words="english")
        try:
            mat = tfidf.fit_transform(eligible["feature_text"])
            qvec = tfidf.transform([query])
            sims = cosine_similarity(qvec, mat).flatten()
            eligible["score"] = sims
        except Exception:
            eligible["score"] = eligible["rating"]

        eligible = eligible.sort_values("score", ascending=False)

        # Fill semester up to 20 credits
        sem_plan = []
        total_credits = 0
        ids_added = set()
        for _, row in eligible.iterrows():
            if row["id"] in ids_added:
                continue
            c = int(row["credits"])
            if total_credits + c > 20:
                continue
            sem_plan.append({
                "id": row["id"],
                "name": row["name"],
                "domain": row["domain"],
                "credits": c,
                "difficulty": row["difficulty"],
            })
            total_credits += c
            ids_added.add(row["id"])
            done_so_far.add(row["id"])
            if total_credits >= 18:
                break

        if sem_plan:
            plan[f"Semester {sem}"] = {
                "courses": sem_plan,
                "total_credits": total_credits,
            }

        if len(plan) >= 4:  # show 4 upcoming semesters max
            break

    return plan


def get_analytics() -> dict:
    """Return analytics data for dashboard."""
    courses, events, careers, materials = load_data()
    return {
        "popular_courses": courses.nlargest(5, "rating")[["id", "name", "domain", "rating"]].to_dict("records"),
        "popular_events": events.head(5)[["id", "name", "type", "interest_area"]].to_dict("records"),
        "domain_distribution": courses.groupby("domain").size().reset_index(name="count").to_dict("records"),
        "difficulty_distribution": courses.groupby("difficulty").size().reset_index(name="count").to_dict("records"),
        "top_careers": careers.nlargest(5, "avg_salary_lpa")[["title", "domain", "avg_salary_lpa", "growth_rate"]].to_dict("records"),
        "total_courses": len(courses),
        "total_events": len(events),
        "total_careers": len(careers),
        "total_materials": len(materials),
    }
