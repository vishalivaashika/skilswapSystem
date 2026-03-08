import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSkillById, useAvailableSlots, useBookSlot } from '@/hooks/useSupabase';
import { ArrowLeft, Star, Award, Calendar, Clock, CheckCircle, User, Video, AlertCircle } from 'lucide-react';

const BookSession = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: skill, isLoading: skillLoading } = useSkillById(skillId);
  const { data: availableSlots = [] } = useAvailableSlots(skillId);
  const bookSlot = useBookSlot();

  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (skillLoading) {
    return <div className="container mx-auto px-4 py-8 text-center"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (!skill) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">Skill not found</h2>
        <Link to="/marketplace"><Button variant="outline" className="mt-4">Back to Marketplace</Button></Link>
      </div>
    );
  }

  const hasEnoughCredits = (profile?.credits || 0) >= skill.credits;
  const formatDate = (dateStr: string) => new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const handleBooking = async () => {
    if (!selectedSlot) { setMessage({ type: 'error', text: 'Please select an available time slot.' }); return; }
    if (!hasEnoughCredits) { setMessage({ type: 'error', text: `Insufficient credits. You need ${skill.credits} credits.` }); return; }
    try {
      await bookSlot.mutateAsync({ slotId: selectedSlot.id, skillId: skill.id });
      setMessage({ type: 'success', text: `Session booked successfully for ${skill.name}!` });
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Booking failed' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />Back to Marketplace
      </Link>

      {message && (
        <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${message.type === 'error' ? 'bg-destructive/10 border border-destructive/20' : 'bg-success/10 border border-success/20'}`}>
          {message.type === 'error' ? <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" /> : <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />}
          <p className={`text-sm font-medium ${message.type === 'error' ? 'text-destructive' : 'text-success'}`}>{message.text}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card-elevated p-6 sticky top-24">
            <div className="text-center mb-6">
              <Link to={`/teacher/${skill.mentor_id}`} className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-4 hover:opacity-80 transition-opacity">
                <span className="text-2xl font-bold text-primary-foreground">{((skill as any).mentorName || 'U').charAt(0)}</span>
              </Link>
              <h3 className="text-xl font-semibold text-foreground">{(skill as any).mentorName}</h3>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="h-4 w-4 text-warning fill-warning" />
                <span className="text-sm font-medium text-foreground">{skill.rating}</span>
                <span className="text-sm text-muted-foreground">({skill.review_count} reviews)</span>
              </div>
            </div>
            <div className="border-t border-border pt-6">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground mb-3">{skill.category}</span>
              <h2 className="text-lg font-semibold text-foreground mb-2">{skill.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">{skill.description}</p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">{skill.credits}</span>
                <span className="text-sm text-muted-foreground">credits per session</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card-elevated p-6">
            <div className="flex items-center gap-2 mb-4"><Calendar className="h-5 w-5 text-primary" /><h3 className="text-lg font-semibold text-foreground">Available Slots</h3></div>
            {availableSlots.length > 0 ? (
              <div className="grid gap-3">
                {availableSlots.map((slot: any) => (
                  <button key={slot.id} onClick={() => setSelectedSlot(slot)}
                    className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between ${selectedSlot?.id === slot.id ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-muted text-foreground'}`}>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4" /><span className="font-medium">{formatDate(slot.slot_date)}</span>
                      <Clock className="h-4 w-4" /><span>{slot.slot_time}</span>
                    </div>
                    {slot.google_meet_link && <div className="flex items-center gap-1 text-xs"><Video className="h-3 w-3" /> Google Meet</div>}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No available slots for this skill</p>
            )}
          </div>

          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Booking Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-border"><span className="text-muted-foreground">Skill</span><span className="font-medium text-foreground">{skill.name}</span></div>
              <div className="flex justify-between items-center py-2 border-b border-border"><span className="text-muted-foreground">Mentor</span><span className="font-medium text-foreground">{(skill as any).mentorName}</span></div>
              <div className="flex justify-between items-center py-2 border-b border-border"><span className="text-muted-foreground">Date & Time</span><span className="font-medium text-foreground">{selectedSlot ? `${formatDate(selectedSlot.slot_date)} at ${selectedSlot.slot_time}` : 'Not selected'}</span></div>
              {selectedSlot?.google_meet_link && (
                <div className="flex justify-between items-center py-2 border-b border-border"><span className="text-muted-foreground">Meeting</span><span className="font-medium text-primary flex items-center gap-1"><Video className="h-4 w-4" /> Google Meet link included</span></div>
              )}
              <div className="flex justify-between items-center py-2"><span className="text-muted-foreground">Session Cost</span><div className="flex items-center gap-1"><Award className="h-4 w-4 text-primary" /><span className="font-bold text-foreground">{skill.credits} credits</span></div></div>
            </div>
            {!hasEnoughCredits && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                <p className="text-sm text-destructive">You don't have enough credits. You need {skill.credits - (profile?.credits || 0)} more credits.</p>
              </div>
            )}
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary mb-6">
              <div className="flex items-center gap-2"><User className="h-5 w-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">Your Balance</span></div>
              <div className="flex items-center gap-1"><Award className="h-4 w-4 text-primary" /><span className="font-bold text-foreground">{profile?.credits || 0} credits</span></div>
            </div>
            <Button variant="hero" size="lg" className="w-full" onClick={handleBooking} disabled={!selectedSlot || !hasEnoughCredits || bookSlot.isPending}>
              <CheckCircle className="h-5 w-5 mr-2" />{bookSlot.isPending ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSession;
