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
            # Extract user name from form data
            user_name = request.form.get('name', 'Candidate')
            
            # Generate questions based on parsed skills
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
    # Expected data: { "user_details": ..., "resume_data": ..., "all_qa_pairs": [...] }
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Calculate final score
    qa_pairs = data.get('all_qa_pairs', [])
    evaluations = [pair.get('evaluation', {}) for pair in qa_pairs]
    final_score = calculate_final_score(evaluations)
    
    data['final_score'] = final_score
    
    # Save to Firebase
    doc_id = save_interview_data(data)
    
    # Email Resume and Cleanup
    filename = data.get('filename')
    user_details = data.get('user_details', {})
    user_name = user_details.get('name', 'Candidate')
    
    if filename:
        resume_path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(resume_path):
            subject = f"Interview Completed: {user_name}"
            body = f"The interview for {user_name} has been completed.\n\nPlease find the resume attached."
            recipient = "elango2006cs@gmail.com"
            
            # Send Email
            send_email_with_attachment(recipient, subject, body, resume_path)
            
            # Delete File
            try:
                os.remove(resume_path)
                print(f"Deleted file: {resume_path}")
            except Exception as e:
                print(f"Error deleting file {resume_path}: {e}")

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
        # report_path is relative (e.g., static/reports/...), convert to absolute
        abs_report_path = os.path.abspath(report_path)

        @after_this_request
        def remove_file(response):
            try:
                os.remove(abs_report_path)
            except Exception as e:
                current_app.logger.error(f"Error removing report file: {e}")
            return response

        return send_file(abs_report_path, as_attachment=True)
    else:
        return jsonify({'error': 'Failed to generate report'}), 500
