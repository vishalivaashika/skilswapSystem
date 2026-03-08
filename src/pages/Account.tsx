import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile } from '@/hooks/useSupabase';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Lock, Save, CheckCircle, AlertCircle, Briefcase } from 'lucide-react';

const Account = () => {
  const { profile } = useAuth();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState(profile?.full_name || '');
  const [experience, setExperience] = useState(profile?.experience || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [teachingLanguage, setTeachingLanguage] = useState((profile as any)?.teaching_language || 'English');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ full_name: name, experience, bio, teaching_language: teachingLanguage });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Update failed' });
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setNewPassword('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Account Settings</h1>

        {message && (
          <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${message.type === 'error' ? 'bg-destructive/10 border border-destructive/20' : 'bg-success/10 border border-success/20'}`}>
            {message.type === 'error' ? <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" /> : <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />}
            <p className={`text-sm font-medium ${message.type === 'error' ? 'text-destructive' : 'text-success'}`}>{message.text}</p>
          </div>
        )}

        <div className="card-elevated p-6 mb-6">
          <div className="flex items-center gap-2 mb-6"><User className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold text-foreground">Profile</h2></div>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="h-12" /></div>
            <div className="space-y-2"><Label>Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input value={profile?.email || ''} disabled className="h-12 pl-10" /></div></div>
            <div className="space-y-2"><Label>Experience</Label><Input placeholder="e.g., 5 years in Python development" value={experience} onChange={(e) => setExperience(e.target.value)} className="h-12" /></div>
            <div className="space-y-2"><Label>Bio</Label><Textarea placeholder="Tell students about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} rows={3} /></div>
            <div className="space-y-2">
              <Label>Teaching Language</Label>
              <select value={teachingLanguage} onChange={(e) => setTeachingLanguage(e.target.value)} className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {['English', 'Tamil', 'Hindi', 'Malayalam'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <Button onClick={handleSave} variant="hero" disabled={updateProfile.isPending}><Save className="h-4 w-4 mr-2" />{updateProfile.isPending ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </div>
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2 mb-6"><Lock className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold text-foreground">Change Password</h2></div>
          <div className="space-y-4">
            <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-12" /></div>
            <Button variant="outline" onClick={handlePasswordChange}>Update Password</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
