import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/lib/store';
import { Calendar, Clock, CheckCircle, XCircle, Award, User, Video, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const ManageSessions = () => {
  const { user } = useAuth();
  const store = useStore();
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const bookings = store.bookings.filter((b) => b.mentorId === user?.id);
  const incomingSessions = bookings.filter((b) => b.status === 'pending');
  const confirmedSessions = bookings.filter((b) => b.status === 'confirmed');
  const creditsEarned = bookings.filter((b) => b.status === 'completed').reduce((sum, b) => sum + b.credits, 0);

  const formatDate = (dateStr: string) => new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const handleConfirm = (bookingId: string) => {
    store.updateBookingStatus(bookingId, 'confirmed');
    setMessage({ type: 'success', text: 'Session confirmed! The student has been notified.' });
  };

  const handleReject = (bookingId: string) => {
    store.updateBookingStatus(bookingId, 'cancelled');
    setMessage({ type: 'success', text: 'Session rejected. Credits have been refunded.' });
  };

  const handleComplete = (bookingId: string) => {
    store.updateBookingStatus(bookingId, 'completed');
    const booking = bookings.find((b) => b.id === bookingId);
    setMessage({ type: 'success', text: `Session completed! You earned ${booking?.credits || 0} credits.` });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Manage Sessions</h1>
        <p className="text-muted-foreground">Review and manage incoming session requests</p>
      </div>

      {message && (
        <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${message.type === 'error' ? 'bg-destructive/10 border border-destructive/20' : 'bg-success/10 border border-success/20'}`}>
          {message.type === 'error' ? <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" /> : <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />}
          <p className={`text-sm font-medium ${message.type === 'error' ? 'text-destructive' : 'text-success'}`}>{message.text}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-elevated">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Incoming Requests
                {incomingSessions.length > 0 && <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-warning/10 text-warning">{incomingSessions.length} new</span>}
              </h2>
            </div>
            <div className="p-6">
              {incomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {incomingSessions.map((booking) => (
                    <div key={booking.id} className="p-4 rounded-xl border border-border bg-secondary/30">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0"><User className="h-6 w-6 text-primary-foreground" /></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground">{booking.learnerName}</h4>
                            <p className="text-sm text-muted-foreground truncate">wants to learn {booking.skillName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground"><Calendar className="h-4 w-4" />{formatDate(booking.date)}</div>
                          <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4" />{booking.time}</div>
                          <div className="flex items-center gap-1 font-medium text-foreground"><Award className="h-4 w-4 text-primary" />{booking.credits}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleConfirm(booking.id)}><CheckCircle className="h-4 w-4 mr-1" /> Confirm</Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(booking.id)}><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8"><Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" /><p className="text-muted-foreground">No pending requests</p></div>
              )}
            </div>
          </div>

          <div className="card-elevated">
            <div className="p-6 border-b border-border"><h2 className="text-lg font-semibold text-foreground">Upcoming Sessions</h2></div>
            <div className="p-6">
              {confirmedSessions.length > 0 ? (
                <div className="space-y-4">
                  {confirmedSessions.map((booking) => (
                    <div key={booking.id} className="p-4 rounded-xl border border-success/20 bg-success/5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0"><CheckCircle className="h-6 w-6 text-success" /></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground">{booking.skillName}</h4>
                            <p className="text-sm text-muted-foreground">with {booking.learnerName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground"><Calendar className="h-4 w-4" />{formatDate(booking.date)}</div>
                          <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4" />{booking.time}</div>
                          {booking.googleMeetLink && (
                            <a href={booking.googleMeetLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary text-xs font-medium"><Video className="h-4 w-4" /> Join Meet</a>
                          )}
                        </div>
                        <Button size="sm" onClick={() => handleComplete(booking.id)}>Mark Complete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8"><Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" /><p className="text-muted-foreground">No upcoming sessions</p></div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card-elevated p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-foreground mb-6">Credits Summary</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/10 text-center">
                <div className="text-3xl font-bold text-primary mb-1">{creditsEarned}</div>
                <div className="text-sm text-muted-foreground">Total Credits Earned</div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border"><span className="text-sm text-muted-foreground">Sessions Completed</span><span className="font-semibold text-foreground">{bookings.filter((b) => b.status === 'completed').length}</span></div>
                <div className="flex justify-between items-center py-2 border-b border-border"><span className="text-sm text-muted-foreground">Pending Requests</span><span className="font-semibold text-foreground">{incomingSessions.length}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSessions;
