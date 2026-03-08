import { useAuth } from '@/contexts/AuthContext';
import { useMySkills, useMyCertificates } from '@/hooks/useSupabase';
import { BookOpen, GraduationCap, Calendar, Award, Star, ShieldCheck } from 'lucide-react';

const Portfolio = () => {
  const { user } = useAuth();
  const { data: mySkills = [] } = useMySkills();
  const { data: certificates = [] } = useMyCertificates();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Portfolio</h1>
        <p className="text-muted-foreground">Your teaching and learning history</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card-elevated">
          <div className="p-6 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><GraduationCap className="h-5 w-5 text-primary" /></div>
            <div><h2 className="text-lg font-semibold text-foreground">Teaching</h2><p className="text-sm text-muted-foreground">{mySkills.length} skills registered</p></div>
          </div>
          <div className="p-6">
            {mySkills.length > 0 ? (
              <div className="space-y-3">
                {mySkills.map((skill: any) => (
                  <div key={skill.id} className="p-4 rounded-xl bg-secondary/50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">{skill.name}</h4>
                      {skill.is_approved ? <span className="flex items-center gap-1 text-xs text-success"><ShieldCheck className="h-3 w-3" /> Approved</span> : <span className="text-xs text-warning">Pending Assessment</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span>{skill.category}</span><span>•</span><span className="flex items-center gap-1"><Award className="h-3 w-3" /> {skill.credits} credits</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No skills registered yet</p>
            )}
          </div>
        </div>
        <div className="card-elevated">
          <div className="p-6 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><BookOpen className="h-5 w-5 text-success" /></div>
            <div><h2 className="text-lg font-semibold text-foreground">Learning</h2><p className="text-sm text-muted-foreground">{certificates.length} certificates earned</p></div>
          </div>
          <div className="p-6">
            {certificates.length > 0 ? (
              <div className="space-y-3">
                {certificates.map((cert: any) => (
                  <div key={cert.id} className="p-4 rounded-xl bg-secondary/50">
                    <h4 className="font-medium text-foreground">{cert.skill_name}</h4>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(cert.completed_date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-warning" /> {cert.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No learning completed yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
