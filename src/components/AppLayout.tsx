import { Outlet, Navigate } from 'react-router-dom';
import AppNavbar from '@/components/AppNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap } from 'lucide-react';

const AppLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">Loading SkillSwap...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
