import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface UploadResponse {
  message: string;
  user_name: string;
  parsed_data: {
    skills: string[];
    experience: string[];
    education: string[];
    job_role?: string;
  };
  filename: string;
  questions: string[];
}

export interface SubmitAnswerResponse {
  evaluation: {
    overall_score: number;
    feedback: string;
    technical_accuracy: number;
    relevance: number;
    communication_quality: number;
  };
}

export interface InterviewData {
  user_details: { name: string };
  resume_data: UploadResponse['parsed_data'];
  filename?: string;
  all_qa_pairs: {
    question: string;
    answer: string;
    evaluation: SubmitAnswerResponse['evaluation'];
  }[];
  final_score?: number;
}

export interface SubmitInterviewResponse {
  message: string;
  id: string;
  final_score: number;
}

export const uploadResume = async (name: string, file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('resume', file);

  const response = await api.post<UploadResponse>('/upload_resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const submitAnswer = async (
  question: string,
  answer: string
): Promise<SubmitAnswerResponse> => {
  const response = await api.post<SubmitAnswerResponse>('/submit_answer', {
    question,
    answer,
  });
  return response.data;
};

export const submitInterview = async (data: InterviewData): Promise<SubmitInterviewResponse> => {
  const response = await api.post<SubmitInterviewResponse>('/submit_interview', data);
  return response.data;
};

export const downloadReport = async (data: InterviewData): Promise<Blob> => {
  const response = await api.post('/download_report', data, {
    responseType: 'blob',
  });
  return response.data;
};

export default api;
