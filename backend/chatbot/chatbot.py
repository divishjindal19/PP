"""
RAG-Based Chatbot using Groq API
Retrieval-Augmented Generation for university-specific queries.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import os
import httpx
import json

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
<<<<<<< HEAD
GROQ_MODEL = "llama-3.1-8b-instant"  # Fast, free tier Groq model
=======
GROQ_MODEL = "llama3-8b-8192"  # Fast, free tier Groq model
>>>>>>> 47cf9c9240eb2cbc2630e763a4af4e00df3d0a75

# University knowledge base (simulated RAG context)
UNIVERSITY_KNOWLEDGE = """
=== UNIVERSITY ACADEMIC GUIDE ===

COMPUTER SCIENCE PROGRAM:
- Year 1: CS101 (Programming), MATH101 (Calculus), COMM101, MATH301 (Linear Algebra)
- Year 2: CS102 (Data Structures), WEB101, DATA101, MATH201 (Statistics)
- Year 3: CS201 (Algorithms), CS202 (Databases), WEB201, DATA201
- Year 4: Electives + Final Project
- Advanced: CS301 (ML), CS302 (Deep Learning), CS401 (Cloud), CS402 (Security)

GPA BOOST COURSES: COMM101, DS101, PM101, ENTR101 (easier courses, typically 3.8+ avg GPA)

AI/ML ROADMAP:
1. MATH201 (Statistics) + MATH301 (Linear Algebra) - Foundation
2. CS102 (Data Structures) + CS201 (Algorithms) - CS Core
3. DATA101 (Data Analysis) - Hands-on data work
4. CS301 (Machine Learning) - First ML course
5. CS302 (Deep Learning) - Neural networks
6. CS303/CS304 (CV or NLP) - Specialization
7. CS305 (RL) - Advanced topics

ML ENGINEER PATH: CS301, CS302, CS401, strong Python skills, MLOps knowledge
DATA SCIENTIST PATH: CS301, DATA301, MATH201, SQL proficiency
FULL STACK PATH: WEB101, WEB201, WEB202, WEB301
PRODUCT MANAGER PATH: PM101, PM201, PM301, DATA201, business courses

INTERNSHIP GUIDANCE:
- Apply 6 months in advance for top companies (Google, Microsoft, Amazon)
- Build 2-3 projects on GitHub showcasing relevant skills
- LeetCode 150 problems for coding interviews
- System Design knowledge for senior internships
- Kaggle competitions for ML internships

POPULAR STUDY RESOURCES:
- CS50 (Harvard) - Best intro programming course (free)
- fast.ai - Best practical deep learning course
- Andrew Ng ML Specialization - Theory + practice
- 3Blue1Brown - Visual math explanations
- LeetCode - Interview preparation
- Kaggle - Data science practice

CAMPUS OPPORTUNITIES:
- AI/ML Research Club - Weekly paper readings, research projects
- Competitive Programming Club - DSA practice, contests
- E-Cell (Entrepreneurship) - Startup mentorship, funding
- Career Fair (November) - 200+ companies recruiting

ELECTIVES FOR 3RD YEAR (AI focus):
Best: CS302 (Deep Learning), CS303 (Computer Vision), CS304 (NLP)
Also recommended: CS401 (Cloud), CS402 (Cybersecurity)

PREREQUISITES IMPORTANT:
- CS301 requires CS201 + MATH201
- CS302 requires CS301
- WEB301 requires WEB201 + WEB202
"""


class ChatMessage(BaseModel):
    role: str  # user | assistant
    content: str


class ChatRequest(BaseModel):
    student_id: str
    query: str
    student_context: Optional[dict] = None
    history: Optional[List[ChatMessage]] = []


def build_system_prompt(student_context: Optional[dict] = None) -> str:
    """Build personalized system prompt with student context."""
    base = f"""You are UniAdvisor, an intelligent AI academic advisor for university students. 
You have deep knowledge of the university curriculum, career paths, and study resources.

{UNIVERSITY_KNOWLEDGE}

PERSONALITY:
- Friendly, encouraging, and practical
- Give specific actionable advice
- Always relate recommendations to the student's goals
- Be concise but thorough

RESPONSE FORMAT:
- Use bullet points for lists
- Bold key terms with **term**
- Keep responses focused and under 300 words
- End with a practical next step
"""
    
    if student_context:
        student_info = f"""
CURRENT STUDENT PROFILE:
- Branch: {student_context.get('branch', 'Not specified')}
- Year: {student_context.get('year', 'Not specified')}  
- GPA: {student_context.get('gpa', 'Not specified')}
- Interests: {', '.join(student_context.get('interests', []))}
- Skills: {', '.join(student_context.get('skills', []))}
- Career Goal: {student_context.get('career_goal', 'Not specified')}
- Completed Courses: {', '.join(student_context.get('completed_courses', []))}

Always personalize your advice based on this student's specific profile.
"""
        base += student_info
    
    return base


async def query_groq(messages: list, system: str) -> str:
    """Call Groq API for chat completion."""
    if not GROQ_API_KEY:
        return generate_fallback_response(messages[-1]["content"])

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "system", "content": system}] + messages,
        "max_tokens": 600,
        "temperature": 0.7,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(GROQ_API_URL, json=payload, headers=headers)
        data = response.json()

    if "choices" in data:
        return data["choices"][0]["message"]["content"]
    else:
        return f"API Error: {data.get('error', {}).get('message', 'Unknown error')}"


def generate_fallback_response(query: str) -> str:
    """Rule-based fallback when Groq API key is not configured."""
    query_lower = query.lower()

    if any(kw in query_lower for kw in ["ml", "machine learning", "ai", "deep learning"]):
        return """**AI/ML Roadmap** 🤖

Here's the recommended path to become an ML Engineer:

1. **Foundation** - MATH201 (Statistics) + MATH301 (Linear Algebra)
2. **CS Core** - CS102, CS201 (Algorithms)
3. **First ML** - CS301 (Machine Learning) — Requires MATH201
4. **Deep Learning** - CS302 — Start building neural nets with PyTorch
5. **Specialization** - CS303 (Computer Vision) or CS304 (NLP)

**Best Resources:**
- fast.ai for practical deep learning
- Andrew Ng's ML Specialization on Coursera
- Kaggle competitions to build portfolio

**Next Step:** Enroll in MATH201 if not done, it's the gateway to ML! 📊"""

    elif any(kw in query_lower for kw in ["gpa", "easy", "boost", "improve grade"]):
        return """**GPA Boost Strategy** 📈

Easier courses with high avg GPA:
- **COMM101** (Technical Communication) - avg 3.8
- **DS101** (Design Thinking) - avg 3.9
- **PM101** (Product Management Basics) - avg 3.8
- **ENTR101** (Entrepreneurship) - avg 3.7
- **ETHICS101** (AI Ethics) - avg 3.8

**Tips:**
- Pair one hard course with 2-3 easier ones per semester
- Attend office hours — professors appreciate initiative
- Form study groups for harder subjects

**Next Step:** Check your credit requirements and add 1-2 of these next semester! ✨"""

    elif any(kw in query_lower for kw in ["internship", "job", "career", "placement"]):
        return """**Internship Guide** 💼

**Timeline:** Start applying 5-6 months early

**Preparation:**
- Solve **150+ LeetCode** problems (Easy → Medium → Hard)
- Build **3 projects** on GitHub with real-world applications
- Create a strong **LinkedIn profile**

**Top Domains:**
- Software Engineering: DS + Algorithms + System Design
- ML/AI: Projects + Kaggle + Research papers
- Product: Case studies + PM frameworks + Analytics

**Campus Resources:**
- Career Fair in November (200+ companies!)
- Placement Cell mock interviews
- E-Cell for startup internships

**Next Step:** Register for Career Fair and polish your GitHub profile! 🚀"""

    elif any(kw in query_lower for kw in ["elective", "3rd year", "third year", "which course"]):
        return """**Best Electives for 3rd Year** 🎓

**If you're into AI/ML:**
- CS302 (Deep Learning) ⭐ — Most impactful
- CS303 (Computer Vision) — Cutting edge
- CS304 (NLP) — Industry demand is huge

**If you want broad skills:**
- CS401 (Cloud Computing) — AWS, DevOps
- CS402 (Cybersecurity) — High demand field
- DATA301 (Big Data) — Spark, Hadoop

**For career preparation:**
- PM301 (Product Strategy) — For PM roles
- DS201 (UI/UX) — For design-adjacent roles

**Next Step:** Pick based on your career goal and make sure prerequisites are done! 📚"""

    else:
        return f"""Hello! I'm **UniAdvisor**, your AI academic assistant. 🎓

I can help you with:
- 📚 **Course recommendations** — "Which electives for ML?"
- 🗺️ **Career roadmaps** — "How to become an ML Engineer?"
- 📈 **GPA strategies** — "Easy courses to boost my GPA?"
- 💼 **Internship guidance** — "How to prepare for Google internship?"
- 📅 **Semester planning** — "Plan my 3rd year schedule"

You asked: *"{query}"*

Could you provide more details? For example, your year, branch, or specific goals? I'll give you a personalized recommendation! ✨"""


@router.post("/query")
async def chatbot_query(request: ChatRequest):
    """
    RAG-based chatbot query endpoint.
    
    Pipeline:
    1. Build system prompt with university knowledge base
    2. Add student context for personalization
    3. Query Groq LLM with conversation history
    4. Return response with sources
    """
    system_prompt = build_system_prompt(request.student_context)

    # Build message history for Groq
    messages = []
    for msg in (request.history or [])[-6:]:  # last 6 messages for context
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": request.query})

    response = await query_groq(messages, system_prompt)

    return {
        "student_id": request.student_id,
        "query": request.query,
        "response": response,
        "sources": ["University Curriculum Guide", "Academic Advisor Database", "Career Placement Records"],
        "model": GROQ_MODEL if GROQ_API_KEY else "Rule-based (configure GROQ_API_KEY for LLM)",
        "rag_enabled": bool(GROQ_API_KEY),
    }
