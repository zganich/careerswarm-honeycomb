import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { toast } from "sonner";

import DashboardLayout from "@/components/DashboardLayout";
interface InterviewQuestion {
  question: string;
  category: "behavioral" | "technical" | "situational" | "company-specific";
  difficulty: "easy" | "medium" | "hard";
  suggestedAnswer?: string;
  relevantAchievements?: string[];
}

function InterviewPrepContent() {
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [preparationTips, setPreparationTips] = useState<string[]>([]);
  const [companyInsights, setCompanyInsights] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    score: number;
    strengths: string[];
    improvements: string[];
    revisedAnswer?: string;
  } | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);

  const { data: savedJobs, isLoading: jobsLoading } = trpc.jobs.list.useQuery();
  
  const generateQuestions = trpc.interviewPrep.generateQuestions.useMutation({
    onSuccess: (data) => {
      setQuestions(data.questions);
      setPreparationTips(data.preparationTips);
      setCompanyInsights(data.companyInsights || "");
      setPracticeMode(false);
      setCurrentQuestionIndex(0);
      toast.success(`Generated ${data.questions.length} interview questions!`);
    },
    onError: (error) => {
      toast.error(`Failed to generate questions: ${error.message}`);
    }
  });

  const evaluateAnswer = trpc.interviewPrep.evaluateAnswer.useMutation({
    onSuccess: (data) => {
      setFeedback(data);
    },
    onError: (error) => {
      toast.error(`Failed to evaluate answer: ${error.message}`);
    }
  });

  const handleGenerateQuestions = () => {
    if (!selectedJobId) {
      toast.error("Please select a job first");
      return;
    }
    generateQuestions.mutate({
      jobId: selectedJobId,
      questionCount: 10,
      includeCompanyResearch: true
    });
  };

  const handleStartPractice = () => {
    setPracticeMode(true);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setFeedback(null);
  };

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      toast.error("Please write an answer first");
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    evaluateAnswer.mutate({
      question: currentQuestion.question,
      answer: userAnswer,
      relevantAchievements: currentQuestion.relevantAchievements || []
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer("");
      setFeedback(null);
    } else {
      toast.success("Practice complete! Great job!");
      setPracticeMode(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "behavioral": return "bg-blue-100 text-blue-800";
      case "technical": return "bg-purple-100 text-purple-800";
      case "situational": return "bg-green-100 text-green-800";
      case "company-specific": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (jobsLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interview Prep Coach</h1>
        <p className="text-muted-foreground">
          Practice with AI-generated interview questions tailored to your target role
        </p>
      </div>

      {!practiceMode && questions.length === 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Select a Job to Prepare For</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Saved Jobs</label>
              <Select
                value={selectedJobId?.toString()}
                onValueChange={(value) => setSelectedJobId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a job..." />
                </SelectTrigger>
                <SelectContent>
                  {savedJobs?.map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()}>
                      {job.title} at {job.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerateQuestions}
              disabled={!selectedJobId || generateQuestions.isPending}
              size="lg"
              className="w-full"
            >
              {generateQuestions.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Interview Questions
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {!practiceMode && questions.length > 0 && (
        <>
          {companyInsights && (
            <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold mb-2 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
                Company Insights
              </h3>
              <p className="text-sm">{companyInsights}</p>
            </Card>
          )}

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Preparation Tips</h3>
            <ul className="space-y-2">
              {preparationTips.map((tip, idx) => (
                <li key={idx} className="flex items-start text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </Card>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Interview Questions ({questions.length})
              </h3>
              <Button onClick={handleStartPractice}>
                Start Practice Mode
              </Button>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex gap-2 mb-2">
                        <Badge className={getCategoryColor(q.category)}>
                          {q.category}
                        </Badge>
                        <Badge className={getDifficultyColor(q.difficulty)}>
                          {q.difficulty}
                        </Badge>
                      </div>
                      <p className="font-medium">{q.question}</p>
                    </div>
                  </div>

                  {q.suggestedAnswer && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                      <p className="font-medium mb-1">Suggested Approach:</p>
                      <p>{q.suggestedAnswer}</p>
                    </div>
                  )}

                  {q.relevantAchievements && q.relevantAchievements.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Relevant Achievements:</p>
                      <div className="flex flex-wrap gap-2">
                        {q.relevantAchievements.map((achievement, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setQuestions([]);
                setPreparationTips([]);
                setCompanyInsights("");
                setSelectedJobId(null);
              }}
            >
              Generate New Questions
            </Button>
          </div>
        </>
      )}

      {practiceMode && questions.length > 0 && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="flex gap-2">
                  <Badge className={getCategoryColor(questions[currentQuestionIndex].category)}>
                    {questions[currentQuestionIndex].category}
                  </Badge>
                  <Badge className={getDifficultyColor(questions[currentQuestionIndex].difficulty)}>
                    {questions[currentQuestionIndex].difficulty}
                  </Badge>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-4">
                {questions[currentQuestionIndex].question}
              </h3>

              <Textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your answer here... (Use STAR method for behavioral questions: Situation, Task, Action, Result)"
                className="min-h-[200px] mb-4"
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || evaluateAnswer.isPending}
                >
                  {evaluateAnswer.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    "Get Feedback"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPracticeMode(false)}
                >
                  Exit Practice
                </Button>
              </div>
            </div>
          </Card>

          {feedback && (
            <Card className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Feedback</h3>
                  <div className="text-3xl font-bold">
                    {feedback.score}/100
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center text-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {feedback.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm">• {strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center text-orange-700">
                      <XCircle className="w-4 h-4 mr-2" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {feedback.improvements.map((improvement, idx) => (
                        <li key={idx} className="text-sm">• {improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {feedback.revisedAnswer && (
                  <div className="p-4 bg-blue-50 rounded">
                    <h4 className="font-semibold mb-2">Improved Answer:</h4>
                    <p className="text-sm">{feedback.revisedAnswer}</p>
                  </div>
                )}
              </div>

              <Button onClick={handleNextQuestion} className="w-full">
                {currentQuestionIndex < questions.length - 1
                  ? "Next Question"
                  : "Finish Practice"}
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewPrep() {
  return (
    <DashboardLayout>
      <InterviewPrepContent />
    </DashboardLayout>
  );
}
