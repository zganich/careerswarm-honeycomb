import { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc';
import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { AlertCircle, CheckCircle2, TrendingUp, FileText } from 'lucide-react';
import { toast } from 'sonner';
import posthog from 'posthog-js';

export default function ResumeRoast() {
  const [resumeText, setResumeText] = useState('');
  const [results, setResults] = useState<{
    score: number;
    verdict: string;
    brutalTruth: string;
    mistakes: string[];
    characterCount: number;
    wordCount: number;
  } | null>(null);

  // Initialize PostHog
  useEffect(() => {
    if (import.meta.env.VITE_POSTHOG_KEY && import.meta.env.VITE_POSTHOG_HOST) {
      posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
        api_host: import.meta.env.VITE_POSTHOG_HOST,
        loaded: (posthog) => {
          if (import.meta.env.DEV) posthog.debug();
        },
      });
    }
  }, []);

  const roastMutation = trpc.public.roast.useMutation({
    onSuccess: (data) => {
      setResults(data);
      
      // Track Resume Roast completion
      posthog.capture('resume_roast_completed', {
        score: data.score,
        verdict: data.verdict,
        characterCount: data.characterCount,
        wordCount: data.wordCount,
        mistakeCount: data.mistakes.length,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to analyze resume');
    },
  });

  const handleRoast = () => {
    if (resumeText.length < 50) {
      toast.error('Please paste at least 50 characters of your resume');
      return;
    }
    roastMutation.mutate({ resumeText });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CS</span>
                </div>
                <span className="font-bold text-xl">CareerSwarm</span>
              </a>
            </Link>
            <Link href="/onboarding">
              <Button>Build My Master Profile</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {!results ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Get Your Resume <span className="text-orange-500">Roasted</span>
              </h1>
              <p className="text-xl text-slate-600 mb-2">
                Brutally honest feedback in 60 seconds
              </p>
              <p className="text-sm text-slate-500">
                No signup required • 100% free • AI-powered analysis
              </p>
            </div>

            {/* Input Section */}
            <Card className="p-8 mb-8">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Paste Your Resume Text
                </label>
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here (at least 50 characters)..."
                  className="min-h-[300px] font-mono text-sm"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-slate-500">
                    {resumeText.length} characters • {resumeText.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                  <span className="text-sm text-slate-500">
                    {resumeText.length >= 50 ? '✓ Ready' : `Need ${50 - resumeText.length} more characters`}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleRoast}
                disabled={resumeText.length < 50 || roastMutation.isPending}
                className="w-full"
                size="lg"
              >
                {roastMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Get Roasted
                  </>
                )}
              </Button>
            </Card>

            {/* Trust Badges */}
            <div className="flex justify-center gap-8 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>No signup required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>100% free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Instant results</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Results Section */}
            <div className="space-y-6">
              {/* Score Card */}
              <Card className="p-8 text-center">
                <div className="mb-4">
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(results.score)} mb-4`}>
                    <span className={`text-5xl font-bold ${getScoreColor(results.score)}`}>
                      {results.score}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {results.verdict}
                  </h2>
                  <p className="text-lg text-slate-600 italic">
                    "{results.brutalTruth}"
                  </p>
                </div>
                <div className="flex justify-center gap-6 text-sm text-slate-500">
                  <span>{results.characterCount} characters</span>
                  <span>•</span>
                  <span>{results.wordCount} words</span>
                </div>
              </Card>

              {/* Mistakes Card */}
              <Card className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className="text-xl font-bold text-slate-900">
                    3 Critical Mistakes
                  </h3>
                </div>
                <div className="space-y-4">
                  {results.mistakes.map((mistake, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <p className="text-slate-700 flex-1 pt-1">{mistake}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Conversion Block - Lead Magnet CTA */}
              <Card className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500 text-white mb-4">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Want to Fix These Issues?
                  </h3>
                  <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
                    Build your Master Profile and let AI automatically tailor your resume for every job. 
                    Stop rewriting from scratch—apply to hundreds of jobs in minutes.
                  </p>
                  <Link href="/onboarding">
                    <Button 
                      size="lg" 
                      className="text-lg px-8"
                      onClick={() => {
                        // Track conversion CTA click
                        posthog.capture('conversion_cta_clicked', {
                          source: 'resume_roast',
                          destination: '/onboarding',
                          score: results?.score,
                        });
                      }}
                    >
                      Build My Master Profile →
                    </Button>
                  </Link>
                  <p className="text-sm text-slate-600 mt-4">
                    Takes less than 5 minutes • No credit card required
                  </p>
                </div>
              </Card>

              {/* Try Another Resume */}
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResults(null);
                    setResumeText('');
                  }}
                >
                  Roast Another Resume
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
