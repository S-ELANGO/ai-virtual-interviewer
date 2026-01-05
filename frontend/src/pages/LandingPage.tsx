import { useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, User, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { uploadResume, UploadResponse } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

const LandingPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }

    if (!file) {
      toast({
        title: 'Resume required',
        description: 'Please upload your resume',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response: UploadResponse = await uploadResume(name, file);

      if (response.questions && response.questions.length > 0) {
        navigate('/interview', {
          state: {
            userData: { name: response.user_name },
            parsedData: response.parsed_data,
            filename: response.filename,
            questions: response.questions,
          },
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Failed to process your resume. Please try again.';
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/30 overflow-x-hidden">

      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <Navbar />

      {/* Home Section */}
      <section id="home" className="min-h-screen flex items-center justify-center px-4 py-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-2xl relative z-10"
        >
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">AI-Powered Interview Practice</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-gradient">AI Virtual</span>
              <br />
              <span className="text-foreground">Interviewer</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Upload your resume and practice with our intelligent AI interviewer. Get real-time feedback and improve your skills.
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            className="glass-card p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* File Upload Zone */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload Resume (PDF)
              </label>
              <motion.div
                className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <AnimatePresence mode="wait">
                  {file ? (
                    <motion.div
                      key="file-selected"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-foreground font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="no-file"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <motion.div
                        className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center"
                        animate={{ y: isDragging ? -5 : 0 }}
                      >
                        {isDragging ? (
                          <Upload className="w-8 h-8 text-primary" />
                        ) : (
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        )}
                      </motion.div>
                      <div className="text-center">
                        <p className="text-foreground font-medium">
                          {isDragging ? 'Drop your file here' : 'Drag & drop your resume'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          or click to browse
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.button
              onClick={handleSubmit}
              disabled={isLoading || !name.trim() || !file}
              className="w-full btn-primary flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  Start Interview
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">Powerful Features</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the next generation of interview preparation with our cutting-edge AI technology.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Smart Question Generation',
                description: 'AI analyzes your resume to ask highly relevant, role-specific questions.'
              },
              {
                icon: '🎤',
                title: 'Voice Interaction',
                description: 'Speak naturally with our AI interviewer. Uses advanced speech-to-text technology.'
              },
              {
                icon: '📊',
                title: 'Comprehensive Feedback',
                description: 'Get detailed scoring on technical accuracy, relevance, and communication skills.'
              },
              {
                icon: '🎥',
                title: 'Live Proctoring',
                description: 'Simulates a real interview environment with camera monitoring and tips.'
              },
              {
                icon: '📄',
                title: 'Resume Parsing',
                description: 'Intelligent extraction of skills, experience, and education from your PDF resume.'
              },
              {
                icon: '📈',
                title: 'Performance Analytics',
                description: 'Download detailed PDF reports and track your interview performance over time.'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 hover:bg-secondary/20 transition-colors"
              >
                <div className="text-4xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-8">
              <span className="text-gradient">About The Project</span>
            </h2>

            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                The AI Virtual Interviewer is a state-of-the-art final year project designed to revolutionize how candidates prepare for job interviews.
              </p>
              <p>
                By leveraging Google's powerful Gemini API, we've created an intelligent system that doesn't just ask generic questions, but understands your unique profile through resume analysis.
              </p>
              <p>
                Our mission is to provide accessible, high-quality interview practice that helps students and professionals build confidence and land their dream jobs.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-white/5">
              {[
                { label: 'Users', value: '10+' },
                { label: 'Interviews', value: '5000+' },
                { label: 'Questions', value: '10k+' },
                { label: 'Success Rate', value: '98%' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground relative z-10">
        <p>© 2026 AI Virtual Interviewer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
