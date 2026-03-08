import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRegisterSkill } from '@/hooks/useSupabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Award, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

const categories = [
  'Python', 'Java', 'JavaScript', 'C++', 'Web Development',
  'Data Science', 'Artificial Intelligence', 'Machine Learning', 'Data Structures', 'Database Systems', 'Cloud Computing', 'Technology',
];

const RegisterSkill = () => {
  const navigate = useNavigate();
  const registerSkill = useRegisterSkill();
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState('');
  const [credits, setCredits] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName || !category || !credits || !description) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }
    const creditNum = parseInt(credits);
    if (creditNum < 5 || creditNum > 20) {
      setMessage({ type: 'error', text: 'Credits must be between 5 and 20.' });
      return;
    }
    try {
      const skill = await registerSkill.mutateAsync({ name: skillName, category, description, credits: creditNum });
      setMessage({ type: 'success', text: 'Skill registered! Now take the teacher assessment.' });
      setTimeout(() => navigate(`/teacher-assessment/${skill.id}`), 800);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Registration failed' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Register a Skill</h1>
          <p className="text-muted-foreground">Share your technology expertise with fellow students and earn credits</p>
        </div>

        <div className="card-elevated p-8">
          {message && (
            <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${message.type === 'error' ? 'bg-destructive/10 border border-destructive/20' : 'bg-success/10 border border-success/20'}`}>
              {message.type === 'error' ? <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" /> : <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />}
              <p className={`text-sm font-medium ${message.type === 'error' ? 'text-destructive' : 'text-success'}`}>{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Skill Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>{categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Skill Name *</Label>
              <Input placeholder="e.g., Python Programming, React Development" value={skillName} onChange={(e) => setSkillName(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Credits per Session * (5-20)</Label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="number" min="5" max="20" placeholder="e.g., 15" value={credits} onChange={(e) => setCredits(e.target.value)} className="h-12 pl-10" />
              </div>
              <p className="text-xs text-muted-foreground">Minimum: 5 credits | Maximum: 20 credits</p>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea placeholder="Describe what students will learn..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="resize-none" />
            </div>
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Teacher Assessment Required</h4>
                  <p className="text-sm text-muted-foreground">After registering, you'll need to pass a skill assessment (score ≥ 70%) before your skill appears in the marketplace.</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-secondary">
              <h4 className="font-medium text-foreground mb-2">What happens next?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />Take and pass the teacher assessment (≥ 70%)</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />Your skill will be listed in the marketplace</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />Set your available time slots with Google Meet links</li>
              </ul>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={registerSkill.isPending}>
              {registerSkill.isPending ? 'Registering...' : 'Register & Take Assessment'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterSkill;
