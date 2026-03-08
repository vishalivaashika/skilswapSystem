import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Mail, Lock, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const location = useLocation();
  const isSignup = location.pathname === '/signup';
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(isSignup ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'teach' | 'learn' | 'both'>('both');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
    if (error) setMessage({ type: 'error', text: error.message });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (activeTab === 'signup') {
      const { error } = await signUp(email, password, { full_name: name, role });
      if (error) {
        // Allow re-login for already registered users
        if (error.toLowerCase().includes('already registered') || error.toLowerCase().includes('already been registered')) {
          const loginResult = await signIn(email, password);
          if (loginResult.error) {
            setMessage({ type: 'error', text: 'Account exists. Please login instead.' });
            setActiveTab('login');
            setLoading(false);
            return;
          }
          setMessage({ type: 'success', text: 'Welcome back! Redirecting...' });
          setTimeout(() => navigate('/dashboard'), 500);
          setLoading(false);
          return;
        }
        setMessage({ type: 'error', text: error });
        setLoading(false);
        return;
      }
      setMessage({ type: 'success', text: 'Account created successfully! Redirecting...' });
      setTimeout(() => navigate('/dashboard'), 500);
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setMessage({ type: 'error', text: 'Invalid credentials. Please try again.' });
        setLoading(false);
        return;
      }
      setMessage({ type: 'success', text: 'Welcome back! Redirecting...' });
      setTimeout(() => navigate('/dashboard'), 500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="card-elevated p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">SkillSwap</span>
          </div>

          {message && (
            <div className={`flex items-start gap-3 p-4 rounded-xl mb-6 ${
              message.type === 'error' ? 'bg-destructive/10 border border-destructive/20' : 'bg-success/10 border border-success/20'
            }`}>
              {message.type === 'error' ? (
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm font-medium ${message.type === 'error' ? 'text-destructive' : 'text-success'}`}>
                {message.text}
              </p>
            </div>
          )}

          <div className="flex rounded-lg bg-secondary p-1 mb-6">
            <button onClick={() => { setActiveTab('login'); setMessage(null); }}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'login' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              Login
            </button>
            <button onClick={() => { setActiveTab('signup'); setMessage(null); }}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'signup' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              Sign Up
            </button>
          </div>

          {/* Google Sign In */}
          <Button variant="outline" className="w-full h-12 mb-4" onClick={handleGoogleSignIn}>
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or continue with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {activeTab === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required className="h-12" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-12 pl-10 pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {activeTab === 'signup' && (
              <div className="space-y-3">
                <Label>I want to</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'teach', label: 'Teach' },
                    { value: 'learn', label: 'Learn' },
                    { value: 'both', label: 'Both' },
                  ].map((option) => (
                    <button key={option.value} type="button" onClick={() => setRole(option.value as typeof role)}
                      className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${role === option.value ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : activeTab === 'login' ? 'Login' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {activeTab === 'login' ? (
              <>Don't have an account? <button onClick={() => { setActiveTab('signup'); setMessage(null); }} className="text-primary font-medium hover:underline">Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => { setActiveTab('login'); setMessage(null); }} className="text-primary font-medium hover:underline">Login</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
