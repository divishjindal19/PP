"""
Model Training Pipeline
Trains and saves ML models for the recommendation system.

Usage:
    python train_models.py

Outputs:
    models/tfidf_courses.pkl
    models/tfidf_events.pkl
    models/tfidf_careers.pkl
    models/tfidf_materials.pkl
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import os
from pathlib import Path

DATA_DIR = Path("data")
MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)


def build_feature_text(df: pd.DataFrame, cols: list) -> pd.Series:
    """Concatenate multiple columns into a single feature string."""
    return df[cols].fillna("").agg(" ".join, axis=1)


def train_tfidf(df: pd.DataFrame, feature_cols: list, name: str):
    """Train a TF-IDF vectorizer and save it with the matrix."""
    df = df.copy()
    df["__feature__"] = build_feature_text(df, feature_cols)

    tfidf = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=5000,
        min_df=1,
    )
    matrix = tfidf.fit_transform(df["__feature__"])

    # Save vectorizer + matrix + item IDs
    artifact = {
        "vectorizer": tfidf,
        "matrix": matrix,
        "ids": df.iloc[:, 0].tolist(),  # first column is always the ID
    }
    path = MODEL_DIR / f"{name}.pkl"
    joblib.dump(artifact, path)
    print(f"  ✅ {name}.pkl — {matrix.shape[0]} items, {matrix.shape[1]} features")
    return artifact


def evaluate_recommendations(artifact: dict, query: str, top_n: int = 5):
    """Quick eval: show top-N results for a query."""
    tfidf = artifact["vectorizer"]
    matrix = artifact["matrix"]
    ids = artifact["ids"]

    qvec = tfidf.transform([query])
    sims = cosine_similarity(qvec, matrix).flatten()
    top_idx = np.argsort(sims)[::-1][:top_n]

    return [(ids[i], round(float(sims[i]), 4)) for i in top_idx]


def main():
    print("\n🚀 UniAdvisor Model Training Pipeline\n" + "="*45)

    # Load data
    print("\n📂 Loading datasets...")
    courses = pd.read_csv(DATA_DIR / "courses.csv")
    events = pd.read_csv(DATA_DIR / "events.csv")
    careers = pd.read_csv(DATA_DIR / "careers.csv")
    materials = pd.read_csv(DATA_DIR / "materials.csv")

    print(f"  Courses: {len(courses)}, Events: {len(events)}, "
          f"Careers: {len(careers)}, Materials: {len(materials)}")

    # Train TF-IDF models
    print("\n🧠 Training TF-IDF models...")
    course_art = train_tfidf(courses, ["name", "domain", "tags", "difficulty"], "tfidf_courses")
    event_art = train_tfidf(events, ["name", "interest_area", "tags", "type"], "tfidf_events")
    career_art = train_tfidf(careers, ["title", "domain", "tags", "skills_required"], "tfidf_careers")
    material_art = train_tfidf(materials, ["title", "domain", "tags", "type"], "tfidf_materials")

    # Evaluation
    print("\n📊 Evaluation (sample queries)...")

    test_queries = [
        ("ML Engineer student interested in Python", course_art, "Courses"),
        ("AI machine learning competition hackathon", event_art, "Events"),
        ("data scientist python statistics career", career_art, "Careers"),
        ("deep learning neural networks pytorch video", material_art, "Materials"),
    ]

    for query, artifact, label in test_queries:
        results = evaluate_recommendations(artifact, query)
        print(f"\n  [{label}] Query: '{query[:50]}...'")
        for item_id, score in results[:3]:
            print(f"    → {item_id}: {score:.4f}")

    print("\n✅ All models trained and saved to ./models/")
    print("   Models will be loaded by the recommender on startup.\n")


if __name__ == "__main__":
    main()
