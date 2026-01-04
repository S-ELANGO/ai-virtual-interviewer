# Deployment Guide for AI Virtual Interviewer

This guide outlines the steps to deploy the AI Virtual Interviewer application. The backend is configured for deployment on **Render** (or similar PaaS), and the frontend is ready for **Vercel** (or Netlify).

## Prerequisites
- A GitHub account with the project repository pushed.
- Accounts on [Render](https://render.com/) and [Vercel](https://vercel.com/).

---

## 1. Backend Deployment (Render)

Render is an excellent choice for hosting Python Flask applications.

### Steps:
1.  **Log in to Render** and click generic **"New + "** button, then select **"Web Service"**.
2.  **Connect your GitHub repository**.
3.  **Configure the Service**:
    - **Name**: `ai-interviewer-backend` (or your choice)
    - **Region**: Select the one closest to you.
    - **Branch**: `Backend` (or your backend branch).
    - **Root Directory**: `backend` (Important: since your flask app is inside the `backend` folder).
    - **Runtime**: `Python 3`
    - **Build Command**: `pip install -r requirements.txt`
    - **Start Command**: `gunicorn wsgi:app`

4.  **Environment Variables**:
    You MUST add the following environment variables in the "Environment" tab:
    - `Acc_key`: (Your Gemini API Key)
    - `FIREBASE_CREDENTIALS`: (See note below on handling JSON keys)
    - `SECRET_KEY`: (A random string)
    - `MAIL_USERNAME`: (If using email service)
    - `MAIL_PASSWORD`: (If using email service)

    *> **Note on Firebase Key**: For Render, you can either:*
    *   *Option A*: Paste the content of `serviceAccountKey.json` into a "Secret File" named `backend/serviceAccountKey.json`.
    *   *Option B*: Base64 encode the JSON file, save it as an env var, and decode it in your code (requires code change).
    *   *Recommended*: Use the **"Secret Files"** feature in Render to upload `serviceAccountKey.json` to `/opt/render/project/src/backend/serviceAccountKey.json`.

5.  **Deploy**: Click "Create Web Service". Wait for the build to finish.
6.  **Copy URL**: Once deployed, copy your backend URL (e.g., `https://ai-interviewer-backend.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

Vercel is optimized for React/Vite apps.

### Steps:
1.  **Log in to Vercel** and click **"Add New..."** -> **"Project"**.
2.  **Import your GitHub repository**.
3.  **Configure Project**:
    - **Framework Preset**: `Vite`
    - **Root Directory**: Click "Edit" and select `frontend`.
4.  **Environment Variables**:
    Add the backend URL you just created:
    - **Name**: `VITE_API_BASE_URL`
    - **Value**: `https://ai-interviewer-backend.onrender.com` (The URL from Step 1).

5.  **Deploy**: Click "Deploy".
6.  **Verify**: Open the deployed frontend URL. Try uploading a resume to ensure it connects to the backend.
