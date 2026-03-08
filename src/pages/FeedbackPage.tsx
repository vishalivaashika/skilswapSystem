import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useMyBookings, useAddReview } from '@/hooks/useSupabase';
import { Star, MessageSquare, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: bookings = [] } = useMyBookings();
  const addReview = useAddReview();

  const completedBookings = bookings.filter((b: any) => b.learner_id === user?.id && b.status === 'completed');

  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const sentenceCount = comment.trim().split(/[.!?]+/).filter(s => s.trim().length > 0).length;

  const handleSubmit = async () => {
    if (!selectedBooking || !user) return;
    const booking = completedBookings.find((b: any) => b.id === selectedBooking);
    if (!booking) return;

    if (sentenceCount < 2) {
      setMessage({ type: 'error', text: 'Please write at least 2 sentences of feedback.' });
      return;
    }

    try {
      await addReview.mutateAsync({
        learner_id: user.id,
        mentor_id: (booking as any).mentor_id,
        skill_id: (booking as any).skill_id,
        booking_id: booking.id,
        rating,
        comment,
      });
      setMessage({ type: 'success', text: 'Thank you for your feedback!' });
      setSelectedBooking(null);
      setComment('');
      setRating(5);
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Failed to submit feedback' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />Back
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Give Feedback</h1>
          <p className="text-muted-foreground">Share your learning experience (minimum 2 sentences required)</p>
        </div>

        {message && (
          <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${message.type === 'error' ? 'bg-destructive/10 border border-destructive/20' : 'bg-success/10 border border-success/20'}`}>
            {message.type === 'error' ? <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" /> : <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />}
            <p className={`text-sm font-medium ${message.type === 'error' ? 'text-destructive' : 'text-success'}`}>{message.text}</p>
          </div>
        )}

        {completedBookings.length > 0 ? (
          <div className="space-y-4">
            {completedBookings.map((booking: any) => (
              <div key={booking.id} className={`card-elevated p-5 cursor-pointer transition-all ${selectedBooking === booking.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedBooking(booking.id)}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{booking.skillName}</h4>
                    <p className="text-sm text-muted-foreground">Mentor: {booking.mentorName}</p>
                  </div>
                  {selectedBooking === booking.id && <CheckCircle className="h-5 w-5 text-primary" />}
                </div>

                {selectedBooking === booking.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Rating</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={(e) => { e.stopPropagation(); setRating(s); }}>
                            <Star className={`h-7 w-7 transition-colors ${s <= rating ? 'text-warning fill-warning' : 'text-muted-foreground'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Your Feedback (min. 2 sentences)</p>
                      <Textarea
                        placeholder="Share your experience with this session..."
                        value={comment}
                        onChange={(e) => { e.stopPropagation(); setComment(e.target.value); }}
                        onClick={(e) => e.stopPropagation()}
                        rows={4}
                      />
                      {comment.length > 0 && sentenceCount < 2 && (
                        <p className="text-xs text-destructive mt-1">Please write at least 2 sentences ({sentenceCount}/2)</p>
                      )}
                    </div>
                    <Button
                      variant="hero"
                      onClick={(e) => { e.stopPropagation(); handleSubmit(); }}
                      disabled={addReview.isPending || sentenceCount < 2}
                    >
                      {addReview.isPending ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 card-elevated">
            <MessageSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No completed sessions</h3>
            <p className="text-muted-foreground">Complete a learning session to leave feedback.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
