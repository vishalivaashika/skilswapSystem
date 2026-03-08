import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMyCertificates } from '@/hooks/useSupabase';
import { Award, Download, Calendar, Trophy, Star } from 'lucide-react';

const Certificates = () => {
  const { data: certificates = [], isLoading } = useMyCertificates();

  if (isLoading) return <div className="container mx-auto px-4 py-8 text-center"><p className="text-muted-foreground">Loading certificates...</p></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Certificates</h1>
        <p className="text-muted-foreground">View and download your earned certificates</p>
      </div>

      {certificates.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert: any) => (
            <div key={cert.id} className="card-elevated-hover overflow-hidden">
              <div className="bg-primary p-6 text-center">
                <Trophy className="h-10 w-10 text-primary-foreground mx-auto mb-2" />
                <h3 className="font-semibold text-primary-foreground">Certificate</h3>
              </div>
              <div className="p-6">
                <h4 className="text-lg font-semibold text-foreground mb-2">{cert.skill_name}</h4>
                <p className="text-sm text-muted-foreground mb-1">Learner: {cert.learner_name}</p>
                <p className="text-sm text-muted-foreground mb-4">Mentor: {cert.mentor_name}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />{new Date(cert.completed_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-warning fill-warning" /><span className="font-medium text-foreground">{cert.score}%</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full"><Download className="h-4 w-4 mr-2" />Download PDF</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6"><Award className="h-10 w-10 text-muted-foreground" /></div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No certificates yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Complete learning sessions and pass the assessment to earn certificates</p>
          <Link to="/marketplace"><Button variant="hero">Browse Skills</Button></Link>
        </div>
      )}
    </div>
  );
};

export default Certificates;
