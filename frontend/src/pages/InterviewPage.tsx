import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, VolumeX, Mic, MicOff, ArrowRight,
  MessageSquare, User, Bot, Clock
} from 'lucide-react';
import { submitAnswer, submitInterview, SubmitAnswerResponse } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/hooks/use-toast';

interface LocationState {
  userData: { name: string };
  parsedData: { skills: string[]; experience: string[]; education: string[] };
  filename: string;
  questions: string[];
}

interface Answer {
  question: string;
  answer: string;
  evaluation: SubmitAnswerResponse['evaluation'];
}

const InterviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState<SubmitAnswerResponse['evaluation'] | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Redirect if no state
  useEffect(() => {
    if (!state?.questions?.length) {
      navigate('/');
    }
  }, [state, navigate]);

  const questions = state?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        toast({
          title: "Camera Error",
          description: "Could not access webcam. Please check permissions.",
          variant: "destructive"
        });
      }
    };

    startCamera();

    return () => {
      // Cleanup stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Text-to-Speech & Auto-Listen
  const speakQuestion = useCallback(() => {
    if (!currentQuestion) return;

    // Cancel current speech/listening
    window.speechSynthesis.cancel();
    if (isListening) recognitionRef.current?.stop();

    const utterance = new SpeechSynthesisUtterance(currentQuestion);
    utterance.rate = 1.0;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
      // Auto-start listening after question is asked
      setTimeout(() => startListening(), 500);
    };

    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [currentQuestion]); // Removed isListening dep to avoid weird loops

  // Trigger TTS when question index changes
  useEffect(() => {
    speakQuestion();
  }, [currentQuestionIndex, speakQuestion]);

  // Speech-to-Text
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript;
      }
      if (finalTranscript) {
        setCurrentAnswer((prev) => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      startListening();
    }
  };

  // Submit current answer and AUTO-MOVE to next
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast({ title: 'Answer required', description: 'Please speak or type an answer.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    // Stop listening if active
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    try {
      // 1. Submit for evaluation (in background)
      const response = await submitAnswer(currentQuestion, currentAnswer.trim());

      const newAnswer: Answer = {
        question: currentQuestion,
        answer: currentAnswer.trim(),
        evaluation: response.evaluation || {
          overall_score: 0, feedback: "Pending", technical_accuracy: 0, relevance: 0, communication_quality: 0
        },
      };

      // 2. Update local state
      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);

      // 3. Move to next question immediately (Deferred Feedback Flow)
      handleNext(updatedAnswers);

    } catch (error) {
      console.error('Submit error:', error);
      toast({ title: 'Error', description: 'Failed to save answer. Proceeding anyway.', variant: 'destructive' });
      // Proceed even on error to keep flow going
      const failedAnswer: Answer = {
        question: currentQuestion, answer: currentAnswer.trim(),
        evaluation: { overall_score: 0, feedback: "Error saving", technical_accuracy: 0, relevance: 0, communication_quality: 0 }
      };
      const updatedAnswers = [...answers, failedAnswer];
      setAnswers(updatedAnswers);
      handleNext(updatedAnswers);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async (currentAnswers: Answer[]) => {
    setCurrentAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      // formatting note: standard useEffect will trigger speakQuestion
    } else {
      finishInterview(currentAnswers);
    }
  };

  const finishInterview = async (finalAnswers: Answer[]) => {
    // Stop camera immediately
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    try {
      const interviewData = {
        user_details: state.userData,
        resume_data: state.parsedData,
        filename: state.filename,
        all_qa_pairs: finalAnswers
      };

      const response = await submitInterview(interviewData);

      if (response.final_score !== undefined) {
        navigate('/result', {
          state: {
            result: response,
            interviewData: interviewData
          }
        });
      }
    } catch (error) {
      console.error('Finish error:', error);
      // Fallback
      navigate('/result', {
        state: {
          result: {
            message: 'Local (Backend Failed)',
            id: 'local',
            final_score: finalAnswers.reduce((acc, a) => acc + (a.evaluation?.overall_score || 0), 0) / finalAnswers.length,
          },
          interviewData: {
            user_details: state.userData,
            resume_data: state.parsedData,
            all_qa_pairs: finalAnswers
          }
        },
      });
    }
  };

  if (!state) return null;

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mb-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Candidate</p>
            <p className="font-medium text-foreground">{state.userData.name}</p>
          </div>
        </div>

        <div className="flex-1 mx-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{currentQuestionIndex + 1} / {questions.length}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-medium text-red-500">Live</span>
        </div>
      </motion.div>

      {/* Main Grid: Left (QA) - Right (Camera) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Interviewer & Question/Answer */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Question Card */}
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Bot className="w-24 h-24" />
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-primary mb-2">AI Interviewer</h3>
                <p className="text-xl md:text-2xl text-foreground leading-relaxed font-light">
                  {currentQuestion}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Answer Area */}
          <div className="flex-1 glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Your Response</span>
              </div>
              {isListening && (
                <span className="text-xs text-primary animate-pulse">Listening...</span>
              )}
            </div>

            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Speak your answer..."
              className="flex-1 w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/30 text-lg leading-relaxed p-0"
            />

            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border/50">
              <motion.button
                onClick={toggleListening}
                className={`p-4 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </motion.button>

              <motion.button
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !currentAnswer.trim()}
                className="flex-1 btn-primary py-4 text-base font-medium flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : (
                  <>
                    {currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Submit Answer'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right Column: Webcam */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <div className="aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
              />

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-xs font-medium text-white/90">
                  {state.userData.name}
                </div>
                <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500' : 'bg-red-500'} shadow-lg`} />
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-secondary/30 backdrop-blur-sm border border-white/5">
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary" />
                Interview Tips
              </h4>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>• Speak clearly and at a moderate pace.</li>
                <li>• Look at the camera to simulate eye contact.</li>
                <li>• The AI will automatically listen after speaking.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InterviewPage;
