import firebase_admin
from firebase_admin import credentials, firestore
from flask import current_app
import os

db = None

def initialize_firebase(app):
    global db
    cred_path = app.config['FIREBASE_CREDENTIALS_PATH']
    
    if not os.path.exists(cred_path):
        print(f"Warning: Firebase credentials not found at {cred_path}. Firebase features will not work.")
        return

    try:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Firebase initialized successfully.")
    except Exception as e:
        print(f"Error initializing Firebase: {e}")

def get_db():
    return db

def save_interview_data(data):
    if not db:
        return None
    try:
        doc_ref = db.collection('interviews').add(data)
        return doc_ref[1].id
    except Exception as e:
        print(f"Error saving to Firebase: {e}")
        return None
