import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    FIREBASE_CREDENTIALS_PATH = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
