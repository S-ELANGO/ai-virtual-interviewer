# Appendix C: Comprehensive Sample Source Code

This appendix contains the core modules of the **SmartHire AI** virtual interviewer application, covering both the backend (Python/Flask) and frontend (React/TypeScript) architectures. The provided source code demonstrates the implementation of key features including resume parsing via LLMs, dynamic question generation, session management, and the user interface.

---

## 1. Backend: Main Application Routes
**File:** `backend/app/routes.py`

**Description:** 
This module serves as the primary controller for the Flask backend API. It defines the RESTful endpoints used by the frontend to upload resumes, submit interview answers, finalize interviews, and download evaluation reports. It orchestrates various internal services such as the resume parser, Gemini LLM client, answer evaluator, and Firebase database layer.

**Sample Input:**
- **Endpoint:** `POST /upload_resume`
- **Payload:** `multipart/form-data` containing a PDF file (`resume`) and candidate `name`.

**Sample Output:**
```json
{
  "message": "Resume processed successfully",
  "user_name": "John Doe",
  "parsed_data": {
    "skills": ["Python", "Flask", "React"],
    "experience": "2 years as a full-stack developer",
    "job_role": "Full-Stack Engineer"
  },
  "filename": "john_doe_resume.pdf",
  "questions": [
    "How does Flask handle routing under the hood?",
    "Explain the Virtual DOM in React.",
    "Describe a time you optimized a Python application."
  ]
}
```

**Source Code:**
```python
from flask import Blueprint, request, jsonify, current_app, send_file, after_this_request
from werkzeug.utils import secure_filename
import os
from app.modules.resume_parser import parse_resume
from app.modules.question_generator import generate_questions
from app.modules.answer_evaluator import evaluate_answer
from app.modules.scorer import calculate_final_score
from app.services.firebase_db import save_interview_data, get_db
from app.modules.report_generator import generate_pdf_report
from app.services.email_service import send_email_with_attachment

main_bp = Blueprint('main', __name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@main_bp.route('/')
def index():
    return "AI Virtual Interviewer Backend is Running! 🚀"

@main_bp.route('/upload_resume', methods=['POST'])
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file provided'}), 400
    
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        parsed_data = parse_resume(filepath)
        if parsed_data:
            user_name = request.form.get('name', 'Candidate')
            skills = parsed_data.get('skills', [])
            job_role = parsed_data.get('job_role', 'General')
            questions = generate_questions(skills, job_role)
            return jsonify({
                'message': 'Resume processed successfully',
                'user_name': user_name,
                'parsed_data': parsed_data,
                'filename': filename,
                'questions': questions
            })
        else:
            return jsonify({'error': 'Failed to parse resume'}), 500

@main_bp.route('/submit_answer', methods=['POST'])
def submit_answer():
    data = request.json
    question = data.get('question')
    answer = data.get('answer')
    
    if not question or not answer:
        return jsonify({'error': 'Question and answer are required'}), 400

    evaluation = evaluate_answer(question, answer)
    if evaluation:
        return jsonify({'evaluation': evaluation})
    else:
        return jsonify({'error': 'Failed to evaluate answer'}), 500

@main_bp.route('/submit_interview', methods=['POST'])
def submit_interview():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    qa_pairs = data.get('all_qa_pairs', [])
    evaluations = [pair.get('evaluation', {}) for pair in qa_pairs]
    final_score = calculate_final_score(evaluations)
    data['final_score'] = final_score
    
    doc_id = save_interview_data(data)
    
    filename = data.get('filename')
    user_details = data.get('user_details', {})
    user_name = user_details.get('name', 'Candidate')
    
    if filename:
        resume_path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(resume_path):
            subject = f"Interview Completed: {user_name}"
            body = f"The interview for {user_name} has been completed.\n\nPlease find the resume attached."
            recipient = "elango2006cs@gmail.com"
            send_email_with_attachment(recipient, subject, body, resume_path)
            try:
                os.remove(resume_path)
            except Exception as e:
                pass

    return jsonify({
        'message': 'Interview submitted successfully',
        'id': doc_id,
        'final_score': final_score
    })

@main_bp.route('/download_report', methods=['POST'])
def download_report():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    report_path = generate_pdf_report(data)
    if report_path:
        abs_report_path = os.path.abspath(report_path)

        @after_this_request
        def remove_file(response):
            try:
                os.remove(abs_report_path)
            except Exception as e:
                pass
            return response

        return send_file(abs_report_path, as_attachment=True)
    else:
        return jsonify({'error': 'Failed to generate report'}), 500
```

---

## 2. Backend: Generative Question Engine
**File:** `backend/app/modules/question_generator.py`

**Description:**
This module encapsulates the logic required to communicate with Google's Gemini LLM. It generates dynamic, context-aware interview questions based on the candidate's parsed skills, intended job role, and experience level. It relies on strict prompting to ensure the model returns a valid JSON array of questions.

**Sample Input:**
- `skills`: `["Python", "Machine Learning", "TensorFlow"]`
- `job_role`: `"AI Engineer"`
- `experience_level`: `"Entry Level"`

**Sample Output:**
```json
[
  "What is the difference between supervised and unsupervised learning?",
  "How do you prevent overfitting in a TensorFlow model?",
  "Can you explain the architecture of a Convolutional Neural Network (CNN)?",
  "Write a simple Python function to perform data normalization.",
  "What evaluation metrics would you use for an imbalanced classification dataset?"
]
```

**Source Code:**
```python
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
```

---

## 3. Backend: Resume Parsing Module
**File:** `backend/app/modules/resume_parser.py`

**Description:**
This module utilizes `PyPDF2` to extract raw text from PDF resume uploads. It then structures this unstructured text by passing it into the Gemini Generative AI model with a strict prompt structure, telling the AI to return the extracted skills, summarized experience, and predicted job role in JSON format.

**Sample Input:**
- `pdf_file`: A binary file stream representing a candidate's resume PDF.

**Sample Output:**
```json
{
    "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
    "experience": "3 years building enterprise web applications at TechCorp.",
    "job_role": "Frontend Developer"
}
```

**Source Code:**
```python
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
        clean_text = response_text.replace('```json', '').replace('```', '').strip()
        data = json.loads(clean_text)
        return data
    except json.JSONDecodeError:
        print("Error decoding JSON from Gemini response for resume parsing.")
        return None
```

---

## 4. Frontend: Application Routing and Layout
**File:** `frontend/src/App.tsx`

**Description:**
This is the root functional component for the React frontend application. It wraps the entire application within multiple higher-order context providers including `QueryClientProvider` (for React Query state management), `TooltipProvider`, and `BrowserRouter` for SPA (Single Page Application) routing. It defines the paths for the Landing, Interview, and Result pages.

**Sample Input:**
- **URL Path:** `/interview` navigated by the user.

**Sample Output:**
- The React Router matches the `/interview` path and dynamically renders the `<InterviewPage />` component nested inside the global animated background wrapper.

**Source Code:**
```tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BackgroundBlobs from "./components/BackgroundBlobs";
import LandingPage from "./pages/LandingPage";
import InterviewPage from "./pages/InterviewPage";
import ResultPage from "./pages/ResultPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen relative">
          {/* Global Animated Background */}
          <BackgroundBlobs />

          {/* Main Content Area */}
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/result" element={<ResultPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```
