from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import os
import uuid

def generate_pdf_report(interview_data, output_dir="static/reports"):
    try:
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        filename = f"report_{uuid.uuid4()}.pdf"
        filepath = os.path.join(output_dir, filename)
        
        doc = SimpleDocTemplate(filepath, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Custom Styles
        title_style = styles["Title"]
        heading_style = styles["Heading2"]
        normal_style = styles["Normal"]
        
        # Define a style for the question (bold)
        question_style = ParagraphStyle(
            'QuestionStyle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=11,
            spaceAfter=6
        )
        
        # Define a style for feedback (colored)
        feedback_style = ParagraphStyle(
            'FeedbackStyle',
            parent=styles['Normal'],
            textColor=colors.blue,
            fontSize=10
        )

        # Title
        elements.append(Paragraph("AI Virtual Interviewer - Report", title_style))
        elements.append(Spacer(1, 20))
        
        # Candidate Details
        name = interview_data.get('user_details', {}).get('name', 'N/A')
        role = interview_data.get('resume_data', {}).get('job_role', 'N/A')
        score = interview_data.get('final_score', 'N/A')
        if isinstance(score, (int, float)):
            score = f"{score}/10"
            
        elements.append(Paragraph(f"<b>Candidate Name:</b> {name}", normal_style))
        elements.append(Paragraph(f"<b>Job Role:</b> {role}", normal_style))
        elements.append(Paragraph(f"<b>Final Score:</b> {score}", normal_style))
        elements.append(Spacer(1, 20))
        
        # Q&A Details
        qa_pairs = interview_data.get('all_qa_pairs', [])
        for i, pair in enumerate(qa_pairs, 1):
            question = pair.get('question', '')
            answer = pair.get('answer', '')
            eval_data = pair.get('evaluation', {})
            overall_score = eval_data.get('overall_score', 0)
            feedback = eval_data.get('feedback', '')
            
            # Question
            elements.append(Paragraph(f"Q{i}: {question}", question_style))
            
            # Answer
            elements.append(Paragraph(f"<b>Ans:</b> {answer}", normal_style))
            elements.append(Spacer(1, 5))
            
            # Score & Feedback
            feedback_text = f"<b>Score:</b> {overall_score}/10 | <b>Feedback:</b> {feedback}"
            elements.append(Paragraph(feedback_text, feedback_style))
            
            elements.append(Spacer(1, 15))

        doc.build(elements)
        return filepath
    except Exception as e:
        print(f"Error generating PDF report: {e}")
        return None
