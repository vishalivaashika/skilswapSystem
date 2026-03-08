import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useProfileById, useApprovedSkills, useAvailableSlots, useReviews } from '@/hooks/useSupabase';
import { Star, Award, Calendar, Clock, ArrowLeft, User, BookOpen, Video, MessageSquare, Globe } from 'lucide-react';

const TeacherProfile = () => {
  const { teacherId } = useParams();
  const { data: teacherProfile, isLoading: profileLoading } = useProfileById(teacherId);
  const { data: allSkills = [] } = useApprovedSkills();
  const { data: allSlots = [] } = useAvailableSlots();
  const { data: reviews = [] } = useReviews(teacherId);

  const teacherSkills = allSkills.filter((s: any) => s.mentor_id === teacherId);
  const teacherSlots = allSlots.filter((s: any) => s.mentor_id === teacherId);
  const avgRating = reviews.length > 0 ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : 'N/A';

  const formatDate = (dateStr: string) => new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  if (profileLoading) return <div className="container mx-auto px-4 py-8 text-center"><p className="text-muted-foreground">Loading profile...</p></div>;
  if (!teacherProfile) return <div className="container mx-auto px-4 py-8 text-center"><h2 className="text-2xl font-bold text-foreground">Teacher not found</h2></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />Back to Marketplace
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card-elevated p-6 sticky top-24">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary-foreground">{teacherProfile.full_name.charAt(0)}</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">{teacherProfile.full_name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{teacherProfile.email}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <Star className="h-5 w-5 text-warning fill-warning" />
                <span className="text-lg font-semibold text-foreground">{avgRating}</span>
                <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
              </div>
            </div>
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <div><p className="text-xs text-muted-foreground">Teaching Language</p><p className="text-sm font-medium text-foreground">{(teacherProfile as any).teaching_language || 'English'}</p></div>
              </div>
              {teacherProfile.experience && (
                <div className="flex items-start gap-3">
                  <BookOpen className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <div><p className="text-xs text-muted-foreground">Experience</p><p className="text-sm font-medium text-foreground">{teacherProfile.experience}</p></div>
                </div>
              )}
              {teacherProfile.bio && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <div><p className="text-xs text-muted-foreground">About</p><p className="text-sm text-foreground">{teacherProfile.bio}</p></div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Award className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <div><p className="text-xs text-muted-foreground">Skills</p><p className="text-sm font-medium text-foreground">{teacherSkills.length} approved skills</p></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Skills */}
          <div className="card-elevated">
            <div className="p-6 border-b border-border"><h3 className="text-lg font-semibold text-foreground">Skills & Expertise</h3></div>
            <div className="p-6">
              {teacherSkills.length > 0 ? (
                <div className="grid gap-4">
                  {teacherSkills.map((skill: any) => (
                    <div key={skill.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                      <div>
                        <h4 className="font-medium text-foreground">{skill.name}</h4>
                        <p className="text-sm text-muted-foreground">{skill.category}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1"><Star className="h-4 w-4 text-warning fill-warning" /><span className="text-sm font-medium text-foreground">{skill.rating}</span></div>
                        <div className="flex items-center gap-1"><Award className="h-4 w-4 text-primary" /><span className="text-sm font-medium text-foreground">{skill.credits} credits</span></div>
                        <Link to={`/book/${skill.id}`}><Button size="sm">Book</Button></Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No approved skills yet</p>
              )}
            </div>
          </div>

          {/* Available Slots */}
          <div className="card-elevated">
            <div className="p-6 border-b border-border"><h3 className="text-lg font-semibold text-foreground">Available Classes</h3></div>
            <div className="p-6">
              {teacherSlots.length > 0 ? (
                <div className="grid gap-3">
                  {teacherSlots.map((slot: any) => {
                    const skill = teacherSkills.find((s: any) => s.id === slot.skill_id);
                    return (
                      <div key={slot.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /><span className="text-sm font-medium text-foreground">{formatDate(slot.slot_date)}</span></div>
                          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-foreground">{slot.slot_time}</span></div>
                          {slot.google_meet_link && <div className="flex items-center gap-1 text-xs text-primary"><Video className="h-3 w-3" /> Meet</div>}
                        </div>
                        <span className="text-sm text-muted-foreground">{skill?.name || 'Skill'}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No available slots</p>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="card-elevated">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /><h3 className="text-lg font-semibold text-foreground">Reviews ({reviews.length})</h3></div>
            </div>
            <div className="p-6">
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="p-4 rounded-xl bg-secondary/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{review.learnerName}</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'text-warning fill-warning' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                      <p className="text-xs text-muted-foreground mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
