# AI Virtual Interviewer

## Project Structure
- **backend/**: Flask API server (Python)
- **frontend/**: React frontend (Node.js)

## How to Run

### Prerequisites
- Python 3.10+
- Node.js & npm
- Gemini API Key (set in `backend/.env`)

### 1. Backend
Navigate to the backend directory and run the Flask server:
```bash
cd backend
source ../.venv/bin/activate  # Activate virtual environment
python app.py
```
*Server will start at `http://127.0.0.1:5000`*

### 2. Frontend
Open a new terminal, navigate to the frontend directory, and start the React app:
```bash
cd frontend
npm install  # Install dependencies if not done yet
npm run dev
```
*App will usually start at `http://localhost:5173`*
