import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useApprovedSkills } from '@/hooks/useSupabase';
import { Star, Award, ArrowLeft, User, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const useAllProfiles = () => useQuery({
  queryKey: ['all-profiles'],
  queryFn: async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data || [];
  },
});

const TeacherList = () => {
  const [searchParams] = useSearchParams();
  const language = searchParams.get('language') || 'English';
  const course = searchParams.get('course') || '';
  const { data: skills = [], isLoading: skillsLoading } = useApprovedSkills();
  const { data: profiles = [], isLoading: profilesLoading } = useAllProfiles();

  const isLoading = skillsLoading || profilesLoading;

  // Map course name to skill categories
  const courseToCategories: Record<string, string[]> = {
    'Python': ['Python'],
    'Java': ['Java'],
    'JavaScript': ['JavaScript', 'Web Development'],
    'C++': ['C++'],
    'Data Science': ['Machine Learning', 'Artificial Intelligence', 'Data Structures'],
    'Web Development': ['Web Development', 'JavaScript'],
  };

  const relevantCategories = courseToCategories[course] || [course];

  // Filter skills by course category
  const courseSkills = skills.filter((s: any) => relevantCategories.includes(s.category));

  // Get unique mentor IDs from those skills
  const mentorIds = [...new Set(courseSkills.map((s: any) => s.mentor_id))];

  // Filter profiles by language and mentor IDs
  const filteredTeachers = profiles.filter((p: any) =>
    mentorIds.includes(p.user_id) &&
    (p.teaching_language || 'English') === language
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Loading teachers...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to={`/course-selection?language=${encodeURIComponent(language)}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />Back to Course Selection
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{course} Teachers</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Globe className="h-4 w-4" /> Language: {language}</span>
            <span>{filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''} found</span>
          </div>
        </div>

        {filteredTeachers.length > 0 ? (
          <div className="space-y-4">
            {filteredTeachers.map((teacher: any) => {
              const teacherSkills = courseSkills.filter((s: any) => s.mentor_id === teacher.user_id);
              const avgRating = teacherSkills.length > 0
                ? (teacherSkills.reduce((s: number, sk: any) => s + Number(sk.rating), 0) / teacherSkills.length).toFixed(1)
                : '0.0';

              return (
                <div key={teacher.user_id} className="card-elevated-hover p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary-foreground">{teacher.full_name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-semibold text-foreground">{teacher.full_name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-warning fill-warning" />
                          <span className="font-medium text-foreground">{avgRating}</span>
                        </div>
                      </div>
                      {teacher.experience && (
                        <p className="text-sm text-muted-foreground mb-1">{teacher.experience}</p>
                      )}
                      {teacher.bio && (
                        <p className="text-sm text-muted-foreground mb-3">{teacher.bio}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {teacherSkills.map((s: any) => (
                          <span key={s.id} className="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                            {s.name} · {s.credits} <Award className="h-3 w-3 inline" />
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <Link to={`/teacher/${teacher.user_id}`}>
                          <Button size="sm" variant="outline">
                            <User className="h-3 w-3 mr-1" /> View Profile
                          </Button>
                        </Link>
                        {teacherSkills[0] && (
                          <Link to={`/book/${teacherSkills[0].id}`}>
                            <Button size="sm">Book Session</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <User className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No teachers found</h3>
            <p className="text-muted-foreground mb-6">
              No teachers available for {course} in {language} yet.
            </p>
            <Link to="/marketplace">
              <Button variant="outline">Browse All Skills</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherList;
