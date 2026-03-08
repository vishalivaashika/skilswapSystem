import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';

const courses = [
  { id: 'Python', label: 'Python', icon: '🐍', desc: 'Learn Python programming from basics to advanced' },
  { id: 'Java', label: 'Java', icon: '☕', desc: 'Master Java and object-oriented programming' },
  { id: 'JavaScript', label: 'JavaScript', icon: '⚡', desc: 'Build modern web apps with JavaScript' },
  { id: 'C++', label: 'C++', icon: '🔧', desc: 'Systems programming and competitive coding' },
  { id: 'Data Science', label: 'Data Science', icon: '📊', desc: 'Data analysis, ML, and AI fundamentals' },
  { id: 'Web Development', label: 'Web Development', icon: '🌐', desc: 'Full-stack web development' },
];

const CourseSelection = () => {
  const [searchParams] = useSearchParams();
  const language = searchParams.get('language') || 'English';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/language-selection" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />Back to Language Selection
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Course</h1>
          <p className="text-muted-foreground">Learning language: <span className="font-medium text-foreground">{language}</span></p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/teachers?language=${encodeURIComponent(language)}&course=${encodeURIComponent(course.id)}`}
              className="card-elevated-hover p-6 text-center group"
            >
              <span className="text-4xl block mb-3">{course.icon}</span>
              <h3 className="text-lg font-semibold text-foreground mb-1">{course.label}</h3>
              <p className="text-sm text-muted-foreground mb-3">{course.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                View Teachers <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseSelection;
