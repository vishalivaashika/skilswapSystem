import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useMySkills, useMySlots, useAddSlot, useDeleteSlot } from '@/hooks/useSupabase';
import { Calendar, Clock, Plus, Trash2, ChevronLeft, ChevronRight, Video, AlertCircle, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const timeOptions = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

const ManageSlots = () => {
  const { data: mySkills = [] } = useMySkills();
  const { data: mySlots = [] } = useMySlots();
  const addSlot = useAddSlot();
  const deleteSlot = useDeleteSlot();

  const approvedSkills = mySkills.filter((s: any) => s.is_approved);

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);
    return monday;
  });

  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [googleMeetLink, setGoogleMeetLink] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return { value: date.toISOString().split('T')[0], day: date.toLocaleDateString('en-US', { weekday: 'short' }), date: date.getDate(), month: date.toLocaleDateString('en-US', { month: 'short' }) };
  });

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const handleAddSlot = async () => {
    if (!selectedSkill || !selectedDate || !selectedTime) {
      setMessage({ type: 'error', text: 'Please select skill, date, and time.' });
      return;
    }
    if (!googleMeetLink) {
      setMessage({ type: 'error', text: 'Please add a Google Meet link for the session.' });
      return;
    }
    try {
      await addSlot.mutateAsync({ skill_id: selectedSkill, slot_date: selectedDate, slot_time: selectedTime, google_meet_link: googleMeetLink });
      setMessage({ type: 'success', text: 'Slot added successfully!' });
      setSelectedTime('');
      setGoogleMeetLink('');
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Failed to add slot' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Manage Time Slots</h1>
        <p className="text-muted-foreground">Set your availability for teaching sessions</p>
      </div>

      {message && (
        <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${message.type === 'error' ? 'bg-destructive/10 border border-destructive/20' : 'bg-success/10 border border-success/20'}`}>
          {message.type === 'error' ? <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" /> : <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />}
          <p className={`text-sm font-medium ${message.type === 'error' ? 'text-destructive' : 'text-success'}`}>{message.text}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card-elevated p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6"><Plus className="h-5 w-5 text-primary" /><h3 className="text-lg font-semibold text-foreground">Add Time Slot</h3></div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Skill</label>
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select skill" /></SelectTrigger>
                  <SelectContent>
                    {approvedSkills.length > 0 ? approvedSkills.map((skill: any) => (<SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>)) : (<SelectItem value="none" disabled>No approved skills</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date</label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select date" /></SelectTrigger>
                  <SelectContent>{weekDays.map((day) => (<SelectItem key={day.value} value={day.value}>{day.day}, {day.month} {day.date}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Time</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select time" /></SelectTrigger>
                  <SelectContent>{timeOptions.map((time) => (<SelectItem key={time} value={time}>{time}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2"><Video className="h-4 w-4 text-primary" />Google Meet Link *</label>
                <Input placeholder="https://meet.google.com/xxx-xxxx-xxx" value={googleMeetLink} onChange={(e) => setGoogleMeetLink(e.target.value)} className="h-12" />
              </div>
              <Button onClick={handleAddSlot} variant="hero" className="w-full" disabled={approvedSkills.length === 0 || addSlot.isPending}><Plus className="h-4 w-4 mr-2" />{addSlot.isPending ? 'Adding...' : 'Add Slot'}</Button>
              {approvedSkills.length === 0 && <p className="text-xs text-muted-foreground text-center">Register a skill and pass the assessment first</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card-elevated">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')}><ChevronLeft className="h-5 w-5" /></Button>
              <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /><span className="font-semibold text-foreground">{weekDays[0].month} {weekDays[0].date} - {weekDays[6].month} {weekDays[6].date}</span></div>
              <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')}><ChevronRight className="h-5 w-5" /></Button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-border">
              {weekDays.map((day) => {
                const daySlots = mySlots.filter((s: any) => s.slot_date === day.value);
                return (
                  <div key={day.value} className="bg-background">
                    <div className="p-3 text-center border-b border-border"><div className="text-xs font-medium text-muted-foreground">{day.day}</div><div className="text-lg font-bold text-foreground">{day.date}</div></div>
                    <div className="p-2 min-h-[200px] space-y-2">
                      {daySlots.map((slot: any) => (
                        <div key={slot.id} className="p-2 rounded-lg bg-primary/10 border border-primary/20 group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs font-medium text-primary"><Clock className="h-3 w-3" />{slot.slot_time}</div>
                            <button onClick={() => deleteSlot.mutate(slot.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80"><Trash2 className="h-3 w-3" /></button>
                          </div>
                          <div className="text-xs text-foreground truncate mt-1">{(slot as any).skills?.name || 'Skill'}</div>
                          {slot.google_meet_link && <div className="flex items-center gap-1 text-xs text-primary mt-1"><Video className="h-2.5 w-2.5" /> Meet</div>}
                        </div>
                      ))}
                      {daySlots.length === 0 && <div className="text-center text-xs text-muted-foreground py-4">No slots</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSlots;
