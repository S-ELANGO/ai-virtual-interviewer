# Project Documentation: AI Virtual Interviewer

## Contents
*   Acknowledgement
*   Contents
*   Synopsis
*   1. Introduction
    *   1.1 Organization Profile
    *   1.2 System Specification
        *   1.2.1 Hardware Configuration
        *   1.2.2 Software Specification
*   2. System Study
    *   2.1 Existing System
    *   2.1.1 Drawbacks
    *   2.2 Proposed System
        *   2.2.1 Features
*   3. System Design and Development
    *   3.1 File Design
    *   3.2 Input Design
    *   3.3 Output Design
    *   3.4 Database Design
    *   3.5 System Development
        *   3.5.1 Description of Modules
*   4. Testing and Implementation
*   5. Conclusion
*   Bibliography
*   Appendices
    *   A. Data Flow Diagram
    *   B. Table Structure
    *   C. Sample Coding
    *   D. Sample Input
    *   E. Sample Output

---

## Synopsis
The **AI Virtual Interviewer** is an advanced web application designed to automate the initial rounds of technical interviews. By leveraging Generative AI (Google Gemini), the system parses resumes to extract key skills, generates dynamic technical questions, conducts voice-enabled interviews, and evaluates candidate responses with precision. This project aims to streamline the recruitment process, reduce human bias, and provide instant, actionable feedback to candidates.

---

## 1. Introduction

The traditional recruitment process is often time-consuming, resource-intensive, and prone to unconscious bias. The **AI Virtual Interviewer** addresses these challenges by providing an intelligent, automated platform for conducting technical screenings. The system acts as a first-line interviewer, assessing candidates on their core competencies through a natural, conversational interface.

### 1.1 Organization Profile
*Note: This project is developed as a technical solution for modern HR challenges, demonstrating the capability of Large Language Models (LLMs) in practical enterprise applications.*

### 1.2 System Specification

#### 1.2.1 Hardware Configuration
To run and develop the application, the following minimum hardware configuration is recommended:
*   **Processor**: Intel Core i5 / Apple Silicon M1 or equivalent
*   **RAM**: 8 GB or higher
*   **Storage**: 500 MB free space for application files and dependencies
*   **Peripherals**: Microphone (for voice input) and Speakers/Headphones (for audio output)
*   **Internet**: Stable broadband connection (required for API calls to Google Gemini and Firebase)

#### 1.2.2 Software Specification
The project is built using a modern full-stack architecture:

*   **Operating System**: Cross-platform (Windows 10/11, macOS, Linux)
*   **Frontend Technology**:
    *   **Framework**: React.js (via Vite)
    *   **Language**: TypeScript
    *   **Styling**: Tailwind CSS, Shadcn/UI
    *   **State Management**: React Hooks
    *   **Libraries**: Axios (API calls), Framer Motion (Animations), SpeechRecognition (Web API)
*   **Backend Technology**:
    *   **Framework**: Flask (Python)
    *   **Language**: Python 3.9+
    *   **AI Integration**: Google GenAI SDK (Gemini Pro)
    *   **PDF Processing**: PyPDF2
    *   **Audio Processing**: SpeechRecognition, gTTS (Google Text-to-Speech)
*   **Database**:
    *   **Primary DB**: Firebase Firestore (NoSQL) for storing user profiles, interview sessions, and results.
*   **Tools & IDE**:
    *   VS Code
    *   Git (Version Control)

---

## 2. System Study

### 2.1 Existing System
In the existing manual system, recruitment involves:
1.  Manual screening of resumes.
2.  Scheduling phone/video screens with HR personnel.
3.  Conducting technical rounds with engineering leads.

#### 2.1.1 Drawbacks
*   **Scalability Issues**: Limited by the number of available human interviewers.
*   **Time Constraints**: Scheduling conflicts delay the hiring process.
*   **Subjectivity**: Different interviewers may evaluate candidates differently.
*   **Fatigue**: Interviewers may lose focus after back-to-back sessions.

### 2.2 Proposed System
The proposed **AI Virtual Interviewer** automates the technical screening phase. Candidates interact with an AI agent that accepts their resume, asks relevant questions, and scores their answers in real-time.

#### 2.2.1 Features
*   **Resume Parsing**: Automatically extracts skills, experience, and education from PDF resumes.
*   **Dynamic Question Generation**: Creates unique questions tailored to the candidate's specific skill set (e.g., Python, React, SQL).
*   **Voice-Enabled Interface**: Supports speech-to-text for answers and text-to-speech for asking questions, simulating a real call.
*   **Automated Evaluation**: AI analyzes answers for technical accuracy, clarity, and completeness.
*   **Report Generation**: Generates a detailed PDF performance report with scores and feedback.

---

## 3. System Design and Development

### 3.1 File Design
The project is structured into two main directories:
*   **backend/**: Contains the Flask application, API routes, and Python logic modules.
*   **frontend/**: Contains the React application, components, pages, and UI assets.

### 3.2 Input Design
*   **Resume Upload**: Accepts `.pdf` files.
*   **Microphone Input**: Captures user audio answers.
*   **Text Input**: Fallback for typing answers or chat interaction.

### 3.3 Output Design
*   **Audio Questions**: Synthetic voice output.
*   **On-Screen Questions**: Text display of the current question.
*   **Final Report**: A downloadable PDF containing the score summary and advice.

### 3.4 Database Design
The system uses **Firebase Firestore** (NoSQL). Key collections include:
*   `users`: Candidate details.
*   `interviews`: Session data linking users to specific interview runs.
*   `questions`: List of generated questions for an interview.
*   `results`: Scores and feedback for each answer.

### 3.5 System Development

#### 3.5.1 Description of Modules (Backend)
The backend logic is modularized for maintainability:

1.  **Resume Parser (`resume_parser.py`)**:
    *   Reading PDF content.
    *   Using Regex or AI to extract Key Skills and Candidate Name.
2.  **Question Generator (`question_generator.py`)**:
    *   Constructs prompts for the Gemini API.
    *   Returns a list of 5-10 technical interview questions based on extracted skills.
3.  **Gemini Client (`gemini_client.py`)**:
    *   Manages authentication and API calls to Google's Generative AI models.
4.  **Speech Handler (`speech_handler.py`)**:
    *   Converts text questions to audio files (mp3/wav) using gTTS.
    *   (Optional) Handles server-side speech recognition if not done on client.
5.  **Answer Evaluator (`answer_evaluator.py`)**:
    *   Compares user responses against expected answers.
    *   Assigns a score (0-10) and provides constructive feedback.
6.  **Report Generator (`report_generator.py`)**:
    *   Compiles all data into a formatted PDF using the ReportLab library.

---

## 4. Testing and Implementation
*   **Unit Testing**: Individual modules (Parser, Generator) were tested with sample inputs to ensure correct error handling and output format.
*   **Integration Testing**: Verified the flow from Frontend (Resume Upload) -> Backend (API) -> Database (Firebase) and back.
*   **User Acceptance Testing (UAT)**: Validated the voice recognition accuracy and the relevance of AI-generated questions.

---

## 5. Conclusion
The **AI Virtual Interviewer** project successfully demonstrates how modern AI can optimize the recruitment lifecycle. By accurately efficiently screening candidates, it saves valuable engineering hours and provides a standardized, unbiased interview experience. Future enhancements could include code-writing challenges and video analysis for behavioral cues.

---

## Bibliography
1.  **Google AI for Developers**: [https://ai.google.dev/docs](https://ai.google.dev/docs)
2.  **Flask Documentation**: [https://flask.palletsprojects.com/](https://flask.palletsprojects.com/)
3.  **React Documentation**: [https://react.dev/](https://react.dev/)
4.  **Firebase Docs**: [https://firebase.google.com/docs](https://firebase.google.com/docs)

---

## Appendices

### A. Data Flow Diagram
*(Placeholder: Conceptual flow)*
User -> [Upload Resume] -> [Backend Parsing] -> [Skill Extraction] -> [GenAI Question Gen] -> [Frontend Display] -> [User Answer] -> [Evaluation] -> [Report]

### C. Sample Coding
**Resume Parsing Logic (`resume_parser.py`)**:

```python
import PyPDF2

def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text()
    return text
```

### D. Sample Input
*   **Resume**: `resume.pdf` (Software Engineer with Python, SQL skills).
*   **Input**: "Explain the difference between a list and a tuple in Python."

### E. Sample Output
*   **Evaluation**:
    *   *Score*: 9/10
    *   *Feedback*: "Good explanation of mutability differences. Could mention performance implications."
