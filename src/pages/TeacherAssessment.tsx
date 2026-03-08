import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSkillById, useAddAssessment, useApproveSkill } from '@/hooks/useSupabase';
import { getQuestionsForCategory } from '@/lib/mcqData';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';

const TeacherAssessment = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { data: skill, isLoading } = useSkillById(skillId);
  const addAssessment = useAddAssessment();
  const approveSkill = useApproveSkill();

  const questions = useMemo(() => skill ? getQuestionsForCategory(skill.category) : [], [skill]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timerKey, setTimerKey] = useState(0);

  const passingScore = 70;
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  useEffect(() => {
    if (questions.length > 0 && answers.length === 0) {
      setAnswers(new Array(questions.length).fill(null));
    }
  }, [questions.length, answers.length]);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const handleSubmit = useCallback(() => {
    if (!skill || questions.length === 0) return;
    const currentAnswers = answersRef.current;
    let correct = 0;
    questions.forEach((q, i) => { if (currentAnswers[i] === q.correctIndex) correct++; });
    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(finalScore);
    setIsCompleted(true);

    const passed = finalScore >= passingScore;
    addAssessment.mutate({ skill_id: skillId!, score: finalScore, passed });
    if (passed) approveSkill.mutate({ skillId: skillId!, score: finalScore });
  }, [questions, skillId, skill]);

  if (isLoading) return <div className="container mx-auto px-4 py-8 text-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!skill) return <div className="container mx-auto px-4 py-8 text-center"><h2 className="text-2xl font-bold text-foreground">Skill not found</h2></div>;
  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">No assessment questions available</h2>
        <p className="text-muted-foreground mb-6">Questions for "{skill.category}" are not yet available.</p>
        <Button onClick={() => navigate('/manage-slots')}>Go to Manage Slots</Button>
      </div>
    );
  }

  if (isCompleted) {
    const passed = score >= passingScore;
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto text-center">
          <div className="card-elevated p-8">
            <div className={`w-20 h-20 rounded-full ${passed ? 'bg-success/10' : 'bg-destructive/10'} flex items-center justify-center mx-auto mb-6`}>
              {passed ? <CheckCircle className="h-10 w-10 text-success" /> : <XCircle className="h-10 w-10 text-destructive" />}
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {passed ? 'Congratulations! You passed!' : 'Keep learning and try again.'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {passed ? 'Your skill is now approved. You can create teaching slots.' : 'You need at least 70% to teach this skill.'}
            </p>
            <div className="p-6 rounded-xl bg-secondary mb-6">
              <div className="text-4xl font-bold text-foreground mb-2">{score}%</div>
              <div className="text-sm text-muted-foreground">Passing score: {passingScore}%</div>
            </div>
            <div className="flex gap-4 justify-center">
              {passed ? (
                <Button variant="hero" onClick={() => navigate('/manage-slots')}><ShieldCheck className="h-4 w-4 mr-2" />Create Teaching Slots</Button>
              ) : (
                <Button onClick={() => { setIsCompleted(false); setCurrentQuestion(0); setAnswers(new Array(questions.length).fill(null)); setTimerKey(k => k + 1); }}>Try Again</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Teacher Assessment</h1>
          <p className="text-muted-foreground">{skill.name} — {skill.category}</p>
          <p className="text-xs text-warning mt-1">You need ≥ 70% to teach this skill</p>
        </div>

        {/* Isolated timer — does NOT re-render question area */}
        <CountdownTimer key={timerKey} duration={30 * 60} isRunning={!isCompleted} onTimeUp={handleSubmit} />

        {/* Progress */}
        <div className="card-elevated p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Question {currentQuestion + 1} of {questions.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question — stays fixed, only changes on Next/Previous click */}
        <div className="card-elevated p-6 sm:p-8 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-6 whitespace-pre-line leading-relaxed">
            {question.question}
          </h3>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => { const a = [...answers]; a[currentQuestion] = index; setAnswers(a); }}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  answers[currentQuestion] === index
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary hover:bg-muted text-foreground'
                }`}
              >
                <span className="font-medium text-sm">
                  <span className="font-mono mr-2">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="lg" onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          {currentQuestion === questions.length - 1 ? (
            <Button variant="hero" size="lg" onClick={handleSubmit} disabled={answers.some((a) => a === null)}>Submit Assessment</Button>
          ) : (
            <Button size="lg" onClick={() => setCurrentQuestion(currentQuestion + 1)} disabled={answers[currentQuestion] === null}>
              Next <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherAssessment;
