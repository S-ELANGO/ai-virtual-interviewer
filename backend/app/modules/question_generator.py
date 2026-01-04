from app.modules.gemini_client import generate_content
import json

def generate_questions(skills, job_role, experience_level="Entry Level"):
    prompt = f"""
    Generate 5 interview questions for a candidate applying for the role of {job_role}.
    The candidate has the following skills: {', '.join(skills)}.
    Experience level: {experience_level}.

    Return ONLY a JSON list of strings, where each string is a question.
    Example: ["Question 1", "Question 2", ...]
    """
    
    response_text = generate_content(prompt)
    if not response_text:
        return []

    try:
        clean_text = response_text.replace('```json', '').replace('```', '').strip()
        questions = json.loads(clean_text)
        return questions
    except json.JSONDecodeError:
        print("Error decoding JSON from Gemini response for question generation.")
        return []
