import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Home, ChevronDown, ChevronUp, MessageSquare, Bot } from 'lucide-react';
import { useState, useEffect } from 'react';
import { downloadReport, SubmitInterviewResponse, InterviewData } from '@/services/api';
import ScoreCircle from '@/components/ScoreCircle';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/hooks/use-toast';

interface LocationState {
  result: SubmitInterviewResponse;
  interviewData: InterviewData;
}

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!state?.result) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state?.result) return null;

  const { result, interviewData } = state;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const reportData = {
        ...interviewData,
        final_score: result.final_score
      };
      const blob = await downloadReport(reportData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'interview-report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Report Downloaded',
        description: 'Your interview report has been downloaded.',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Interview Complete</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Here's your performance summary
          </p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          className="glass-card p-8 mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <ScoreCircle
              score={result.final_score}
              label="Overall Score"
              size={220}
            />

            <div className="flex flex-col gap-4">
              <div className="glass-card p-4">
                <p className="text-sm text-muted-foreground mb-1">Questions Answered</p>
                <p className="text-3xl font-bold text-foreground">{interviewData?.all_qa_pairs?.length || 0}</p>
              </div>

              <div className="glass-card p-4">
                <p className="text-sm text-muted-foreground mb-1">Performance</p>
                <p className={`text-3xl font-bold ${getScoreColor(result.final_score)}`}>
                  {result.final_score >= 8 ? 'Excellent' : result.final_score >= 6 ? 'Good' : 'Needs Work'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 btn-primary flex items-center justify-center gap-3"
            whileHover={{ scale: isDownloading ? 1 : 1.02 }}
            whileTap={{ scale: isDownloading ? 1 : 0.98 }}
          >
            {isDownloading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download Report
              </>
            )}
          </motion.button>

          <motion.button
            onClick={() => navigate('/')}
            className="flex-1 btn-secondary flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Home className="w-5 h-5" />
            Start New Interview
          </motion.button>
        </motion.div>

        {/* Detailed Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6">Detailed Breakdown</h2>

          <div className="space-y-4">
            {interviewData?.all_qa_pairs?.map((answer, index) => (
              <motion.div
                key={index}
                className="glass-card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                {/* Question Header */}
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">Q{index + 1}</span>
                    </div>
                    <p className="text-foreground font-medium line-clamp-1">{answer.question}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-bold ${getScoreColor(answer.evaluation.overall_score)}`}>
                      {answer.evaluation.overall_score ? answer.evaluation.overall_score.toFixed(1) : 'N/A'}
                    </span>
                    {expandedIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6"
                  >
                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {[
                        { label: 'Technical', score: answer.evaluation.technical_accuracy },
                        { label: 'Relevance', score: answer.evaluation.relevance },
                        { label: 'Communication', score: answer.evaluation.communication_quality },
                      ].map((metric) => (
                        <div key={metric.label} className="text-center p-3 rounded-xl bg-secondary/50">
                          <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                          <p className={`text-xl font-bold ${getScoreColor(metric.score)}`}>
                            {metric.score ? metric.score.toFixed(1) : 'N/A'}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Your Answer */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Your Answer</span>
                      </div>
                      <div className="p-4 rounded-xl bg-secondary/30">
                        <p className="text-foreground">{answer.answer}</p>
                      </div>
                    </div>

                    {/* AI Feedback */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-primary" />
                        <span className="text-sm text-primary">AI Feedback</span>
                      </div>
                      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                        <p className="text-foreground">{answer.evaluation.feedback}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResultPage;
