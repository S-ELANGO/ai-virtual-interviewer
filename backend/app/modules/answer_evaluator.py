from app.modules.gemini_client import generate_content
import json

def evaluate_answer(question, answer):
    prompt = f"""
    Evaluate the following answer to the interview question.
    
    Question: {question}
    Answer: {answer}

    Assess on:
    1. Technical Accuracy
    2. Relevance
    3. Communication Quality

    Return ONLY a JSON object with the following structure:
    {{
        "technical_accuracy": 0-10,
        "relevance": 0-10,
        "communication_quality": 0-10,
        "overall_score": 0-10,
        "feedback": "Brief feedback string"
    }}
    """
    
    response_text = generate_content(prompt)
    if not response_text:
        return None

    try:
        clean_text = response_text.replace('```json', '').replace('```', '').strip()
        evaluation = json.loads(clean_text)
        return evaluation
    except json.JSONDecodeError:
        print("Error decoding JSON from Gemini response for answer evaluation.")
        return None
