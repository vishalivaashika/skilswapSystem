import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useMyBookings, useMyTestResults, useMySkills, useMySlots, useMyCertificates, useAddReview } from '@/hooks/useSupabase';
import { Award, BookOpen, GraduationCap, Calendar, Star, ArrowRight, Clock, TrendingUp, Video, FileText, Download, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { data: bookings = [] } = useMyBookings();
  const { data: testResults = [] } = useMyTestResults();
  const { data: mySkills = [] } = useMySkills();
  const { data: mySlots = [] } = useMySlots();
  const { data: certificates = [] } = useMyCertificates();
  const addReview = useAddReview();

  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const isTeacher = profile?.role === 'teach' || profile?.role === 'both';
  const isLearner = profile?.role === 'learn' || profile?.role === 'both';

  const upcomingSessions = bookings.filter((b: any) => b.status === 'confirmed' || b.status === 'pending');
  const completedCount = bookings.filter((b: any) => b.status === 'completed').length;
  const learnerBookings = bookings.filter((b: any) => b.learner_id === user?.id);
  const completedLearnerBookings = learnerBookings.filter((b: any) => b.status === 'completed');
  const testedBookingIds = testResults.map((t: any) => t.booking_id);
  const untested = completedLearnerBookings.filter((b: any) => !testedBookingIds.includes(b.id));
  const teacherBookings = bookings.filter((b: any) => b.mentor_id === user?.id);
  const creditsEarned = teacherBookings.filter((b: any) => b.status === 'completed').reduce((sum: number, b: any) => sum + b.credits, 0);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleReview = async (booking: any) => {
    try {
      await addReview.mutateAsync({
        learner_id: user!.id,
        mentor_id: booking.mentor_id,
        skill_id: booking.skill_id,
        booking_id: booking.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setMessage({ type: 'success', text: 'Thank you for your feedback!' });
      setReviewBookingId(null);
      setReviewComment('');
      setReviewRating(5);
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Failed to submit review' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}! 👋</h1>
        <p className="text-muted-foreground">
          {isTeacher && isLearner ? 'Manage your teaching and learning activities' : isTeacher ? 'Manage your teaching sessions and skills' : 'Discover and learn new technology skills'}
        </p>
      </div>

      {message && (
        <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${message.type === 'error' ? 'bg-destructive/10 border border-destructive/20' : 'bg-success/10 border border-success/20'}`}>
          {message.type === 'error' ? <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" /> : <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />}
          <p className={`text-sm font-medium ${message.type === 'error' ? 'text-destructive' : 'text-success'}`}>{message.text}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card-elevated p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Award className="h-6 w-6 text-primary" /></div>
            <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">Available</span>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">{profile?.credits || 0}</div>
          <p className="text-sm text-muted-foreground">Credit Balance</p>
        </div>
        <div className="card-elevated p-6">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4"><BookOpen className="h-6 w-6 text-primary" /></div>
          <div className="text-3xl font-bold text-foreground mb-1">{completedCount}</div>
          <p className="text-sm text-muted-foreground">Sessions Completed</p>
        </div>
        <div className="card-elevated p-6">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4"><GraduationCap className="h-6 w-6 text-primary" /></div>
          <div className="text-3xl font-bold text-foreground mb-1">{upcomingSessions.length}</div>
          <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
        </div>
        {isTeacher && (
          <div className="card-elevated p-6">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4"><TrendingUp className="h-6 w-6 text-success" /></div>
            <div className="text-3xl font-bold text-foreground mb-1">{creditsEarned}</div>
            <p className="text-sm text-muted-foreground">Credits Earned (Teaching)</p>
          </div>
        )}
        {isLearner && !isTeacher && (
          <div className="card-elevated p-6">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4"><Star className="h-6 w-6 text-primary" /></div>
            <div className="text-3xl font-bold text-foreground mb-1">{certificates.length}</div>
            <p className="text-sm text-muted-foreground">Certificates Earned</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {isTeacher && (
          <>
            <Link to="/register-skill" className="block">
              <div className="card-elevated-hover p-6 h-full">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0"><GraduationCap className="h-7 w-7 text-primary-foreground" /></div>
                  <div className="flex-1"><h3 className="text-lg font-semibold text-foreground mb-1">Register & Teach a Skill</h3><p className="text-sm text-muted-foreground">Pass assessment, create slots & earn credits</p></div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </Link>
            <Link to="/manage-sessions" className="block">
              <div className="card-elevated-hover p-6 h-full">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0"><Calendar className="h-7 w-7 text-primary" /></div>
                  <div className="flex-1"><h3 className="text-lg font-semibold text-foreground mb-1">Manage Sessions</h3><p className="text-sm text-muted-foreground">Review requests & manage booked learners</p></div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </Link>
          </>
        )}
        {isLearner && (
          <>
            <Link to="/language-selection" className="block">
              <div className="card-elevated-hover p-6 h-full">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0"><BookOpen className="h-7 w-7 text-primary" /></div>
                  <div className="flex-1"><h3 className="text-lg font-semibold text-foreground mb-1">Start Learning</h3><p className="text-sm text-muted-foreground">Choose language & course, find a teacher</p></div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </Link>
            <Link to="/marketplace" className="block">
              <div className="card-elevated-hover p-6 h-full">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0"><FileText className="h-7 w-7 text-primary" /></div>
                  <div className="flex-1"><h3 className="text-lg font-semibold text-foreground mb-1">Browse All Skills</h3><p className="text-sm text-muted-foreground">View marketplace & certificates</p></div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </Link>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Sessions */}
          <div className="card-elevated">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Upcoming Sessions</h2>
                <Link to="/manage-sessions"><Button variant="ghost" size="sm">View All</Button></Link>
              </div>
            </div>
            <div className="p-6">
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.slice(0, 5).map((booking: any) => (
                    <div key={booking.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Calendar className="h-6 w-6 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{booking.skillName}</h4>
                        <p className="text-sm text-muted-foreground">{booking.mentor_id === user?.id ? `Learner: ${booking.learnerName}` : `Mentor: ${booking.mentorName}`}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-medium text-foreground">{formatDate(booking.slotDate)}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Clock className="h-3 w-3" />{booking.slotTime}</div>
                      </div>
                      {booking.meetLink && (
                        <a href={booking.meetLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                          <Video className="h-3 w-3" /> Join Meet
                        </a>
                      )}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{booking.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" /><p className="text-muted-foreground">No upcoming sessions</p>
                  <Link to="/marketplace"><Button variant="outline" size="sm" className="mt-4">Browse Skills</Button></Link>
                </div>
              )}
            </div>
          </div>

          {/* Take MCQ Test */}
          {isLearner && untested.length > 0 && (
            <div className="card-elevated">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Take MCQ Test</h2>
                <p className="text-sm text-muted-foreground">Complete your assessment for finished sessions</p>
              </div>
              <div className="p-6 space-y-3">
                {untested.map((booking: any) => (
                  <div key={booking.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><FileText className="h-5 w-5 text-warning" /></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{booking.skillName}</h4>
                      <p className="text-sm text-muted-foreground">with {booking.mentorName}</p>
                    </div>
                    <Link to={`/mcq-test/${booking.id}`}><Button size="sm" variant="hero">Take Test</Button></Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Give Feedback */}
          {isLearner && completedLearnerBookings.length > 0 && (
            <div className="card-elevated">
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Give Feedback</h2>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {completedLearnerBookings.map((booking: any) => (
                  <div key={booking.id} className="p-4 rounded-xl bg-secondary/50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-foreground">{booking.skillName}</h4>
                        <p className="text-sm text-muted-foreground">Mentor: {booking.mentorName}</p>
                      </div>
                      {reviewBookingId !== booking.id && (
                        <Button size="sm" variant="outline" onClick={() => setReviewBookingId(booking.id)}>
                          <Star className="h-3 w-3 mr-1" /> Rate
                        </Button>
                      )}
                    </div>
                    {reviewBookingId === booking.id && (
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setReviewRating(star)}>
                              <Star className={`h-6 w-6 transition-colors ${star <= reviewRating ? 'text-warning fill-warning' : 'text-muted-foreground'}`} />
                            </button>
                          ))}
                        </div>
                        <Textarea placeholder="Share your experience (minimum 2 sentences)..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={3} />
                        {reviewComment.trim().split(/[.!?]+/).filter(s => s.trim().length > 0).length < 2 && reviewComment.length > 0 && (
                          <p className="text-xs text-destructive">Please write at least 2 sentences of feedback.</p>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" variant="hero" onClick={() => handleReview(booking)} disabled={addReview.isPending || reviewComment.trim().split(/[.!?]+/).filter(s => s.trim().length > 0).length < 2}>Submit</Button>
                          <Button size="sm" variant="outline" onClick={() => setReviewBookingId(null)}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card-elevated p-6">
            <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-success" /><h3 className="text-lg font-semibold text-foreground">Activity</h3></div>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Total Bookings</span><span className="font-semibold text-foreground">{bookings.length}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Completed</span><span className="font-semibold text-success">{completedCount}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Pending</span><span className="font-semibold text-warning">{upcomingSessions.filter((s: any) => s.status === 'pending').length}</span></div>
              {isTeacher && (
                <>
                  <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Approved Skills</span><span className="font-semibold text-foreground">{mySkills.filter((s: any) => s.is_approved).length}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Active Slots</span><span className="font-semibold text-foreground">{mySlots.filter((s: any) => s.is_available).length}</span></div>
                </>
              )}
            </div>
          </div>

          {isTeacher && (
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Teacher Quick Links</h3>
              <div className="space-y-2">
                <Link to="/manage-slots" className="flex items-center gap-2 p-3 rounded-lg hover:bg-secondary transition-colors text-sm text-muted-foreground hover:text-foreground"><Calendar className="h-4 w-4" /> Manage Slots</Link>
                <Link to="/register-skill" className="flex items-center gap-2 p-3 rounded-lg hover:bg-secondary transition-colors text-sm text-muted-foreground hover:text-foreground"><GraduationCap className="h-4 w-4" /> Register New Skill</Link>
                <Link to="/manage-sessions" className="flex items-center gap-2 p-3 rounded-lg hover:bg-secondary transition-colors text-sm text-muted-foreground hover:text-foreground"><BookOpen className="h-4 w-4" /> View Booked Learners</Link>
              </div>
            </div>
          )}

          {isLearner && (
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Learner Quick Links</h3>
              <div className="space-y-2">
                <Link to="/marketplace" className="flex items-center gap-2 p-3 rounded-lg hover:bg-secondary transition-colors text-sm text-muted-foreground hover:text-foreground"><BookOpen className="h-4 w-4" /> Browse Tech Skills</Link>
                <Link to="/certificates" className="flex items-center gap-2 p-3 rounded-lg hover:bg-secondary transition-colors text-sm text-muted-foreground hover:text-foreground"><Award className="h-4 w-4" /> My Certificates</Link>
                <Link to="/portfolio" className="flex items-center gap-2 p-3 rounded-lg hover:bg-secondary transition-colors text-sm text-muted-foreground hover:text-foreground"><Download className="h-4 w-4" /> Portfolio</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
