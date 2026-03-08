import { Link } from 'react-router-dom';
import { Globe, ArrowRight } from 'lucide-react';

const languages = [
  { code: 'English', label: 'English', flag: '🇬🇧' },
  { code: 'Tamil', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'Hindi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'Malayalam', label: 'മലയാളം', flag: '🇮🇳' },
  { code: 'Kannada', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'Telugu', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'Bengali', label: 'বাংলা', flag: '🇮🇳' },
  { code: 'Marathi', label: 'मराठी', flag: '🇮🇳' },
  { code: 'Gujarati', label: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'Punjabi', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'Odia', label: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'Urdu', label: 'اردو', flag: '🇮🇳' },
  { code: 'French', label: 'Français', flag: '🇫🇷' },
  { code: 'Spanish', label: 'Español', flag: '🇪🇸' },
  { code: 'German', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'Arabic', label: 'العربية', flag: '🇸🇦' },
];

const LanguageSelection = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Learning Language</h1>
          <p className="text-muted-foreground">Select the language in which you'd like to learn</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {languages.map((lang) => (
            <Link
              key={lang.code}
              to={`/course-selection?language=${encodeURIComponent(lang.code)}`}
              className="card-elevated-hover p-6 flex items-center gap-4 group"
            >
              <span className="text-4xl">{lang.flag}</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{lang.label}</h3>
                <p className="text-sm text-muted-foreground">Learn in {lang.label}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;
