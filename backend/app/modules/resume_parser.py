import PyPDF2
import io
from app.modules.gemini_client import generate_content
import json

def extract_text_from_pdf(pdf_file):
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return None

def parse_resume(pdf_file):
    text = extract_text_from_pdf(pdf_file)
    if not text:
        return None

    prompt = f"""
    Extract the following details from the resume text below and return ONLY a JSON object:
    {{
        "skills": ["List of skills"],
        "experience": "Summary of experience",
        "job_role": "Predicted job role based on skills"
    }}

    Resume Text:
    {text}
    """
    
    response_text = generate_content(prompt)
    if not response_text:
        return None

    try:
        # Clean up Gemini response if it contains markdown code blocks
        clean_text = response_text.replace('```json', '').replace('```', '').strip()
        data = json.loads(clean_text)
        return data
    except json.JSONDecodeError:
        print("Error decoding JSON from Gemini response for resume parsing.")
        return None
