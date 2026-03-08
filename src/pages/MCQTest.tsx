import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useMyBookings, useAddTestResult, useAddCertificate, useTeacherBonus } from '@/hooks/useSupabase';
import { getQuestionsForCategory } from '@/lib/mcqData';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, Award, Download, Trophy } from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';

const MCQTest = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: bookings = [] } = useMyBookings();
  const addTestResult = useAddTestResult();
  const addCertificate = useAddCertificate();
  const teacherBonus = useTeacherBonus();

  const booking = bookings.find((b: any) => b.id === bookingId);
  const questions = useMemo(
    () => booking ? getQuestionsForCategory((booking as any).skillCategory || '') : [],
    [booking]
  );

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  const passingScore = 75;
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  useEffect(() => {
    if (questions.length > 0 && answers.length === 0) {
      setAnswers(new Array(questions.length).fill(null));
    }
  }, [questions.length, answers.length]);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const handleSubmit = useCallback(async () => {
    if (!booking || !user || !profile || questions.length === 0) return;
    const currentAnswers = answersRef.current;
    let correct = 0;
    questions.forEach((q, i) => { if (currentAnswers[i] === q.correctIndex) correct++; });
    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct);
    setIsCompleted(true);
    const passed = pct >= passingScore;

    try {
      const result = await addTestResult.mutateAsync({
        booking_id: bookingId!,
        learner_id: user.id,
        skill_id: (booking as any).skill_id,
        score: correct,
        total_questions: questions.length,
        pass_percentage: pct,
        passed,
      });

      if (passed && result) {
        await addCertificate.mutateAsync({
          learner_id: user.id,
          learner_name: profile.full_name,
          skill_id: (booking as any).skill_id,
          skill_name: (booking as any).skillName,
          mentor_name: (booking as any).mentorName,
          score: pct,
          test_result_id: result.id,
        });
        teacherBonus.mutate(bookingId!);
      }
    } catch (e) {
      console.error('Error saving test result:', e);
    }
  }, [booking, user, profile, questions, bookingId]);

  if (!booking || questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Test not available. Make sure you have a completed booking.</p>
      </div>
    );
  }

  if (showCertificate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card-elevated overflow-hidden">
            <div className="bg-primary p-8 text-center">
              <Trophy className="h-16 w-16 text-primary-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary-foreground">Certificate of Completion</h2>
            </div>
            <div className="p-8 text-center">
              <div className="py-8 border-b border-t border-border my-8">
                <p className="text-muted-foreground mb-2">This is to certify that</p>
                <p className="text-2xl font-bold text-foreground mb-4">{profile?.full_name}</p>
                <p className="text-muted-foreground mb-2">has successfully completed</p>
                <p className="text-xl font-semibold text-primary mb-4">{(booking as any).skillName}</p>
                <p className="text-muted-foreground">with a score of <span className="font-bold text-success">{score}%</span></p>
              </div>
              <p className="text-sm text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="p-6 bg-secondary flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/certificates')}>View All Certificates</Button>
              <Button variant="hero"><Download className="h-4 w-4 mr-2" />Download PDF</Button>
            </div>
          </div>
        </div>
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
              {passed ? 'You earned a certificate for this skill.' : `You scored ${score}%. You need 75% to earn a certificate.`}
            </p>
            <div className="p-6 rounded-xl bg-secondary mb-6">
              <div className="text-4xl font-bold text-foreground mb-2">{score}%</div>
              <div className="text-sm text-muted-foreground">Passing: {passingScore}%</div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>Dashboard</Button>
              {passed && <Button variant="hero" onClick={() => setShowCertificate(true)}><Award className="h-4 w-4 mr-2" />View Certificate</Button>}
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Skill Assessment</h1>
          <p className="text-muted-foreground">{(booking as any).skillName}</p>
          <p className="text-xs text-muted-foreground mt-1">Score ≥ 75% to earn a certificate</p>
        </div>

        {/* Isolated timer — does NOT re-render question area */}
        <CountdownTimer duration={30 * 60} isRunning={!isCompleted} onTimeUp={handleSubmit} />

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
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  const a = [...answers];
                  a[currentQuestion] = i;
                  setAnswers(a);
                }}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  answers[currentQuestion] === i
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary hover:bg-muted text-foreground'
                }`}
              >
                <span className="font-medium text-sm">
                  <span className="font-mono mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
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
            <Button variant="hero" size="lg" onClick={handleSubmit} disabled={answers.some((a) => a === null)}>
              Submit Test
            </Button>
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

export default MCQTest;
