import google.genai as genai
from flask import current_app
import os

def get_gemini_client():
    api_key = current_app.config['GEMINI_API_KEY']
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in configuration")
    
    client = genai.Client(api_key=api_key)
    return client

def generate_content(prompt):
    try:
        client = get_gemini_client()
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Error generating content with Gemini: {e}")
        return None
