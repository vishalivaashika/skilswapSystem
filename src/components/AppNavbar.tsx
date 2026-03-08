import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, LayoutDashboard, BookOpen, Award, User, LogOut, Menu, X, Briefcase, Calendar, ChevronDown, Globe, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/language-selection', label: 'Learn', icon: Globe },
  { href: '/marketplace', label: 'Marketplace', icon: BookOpen },
  { href: '/certificates', label: 'Certificates', icon: Award },
];

const AppNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"><GraduationCap className="h-6 w-6 text-primary-foreground" /></div>
            <span className="text-xl font-bold text-foreground hidden sm:block">SkillSwap</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.href} to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                  <item.icon className="h-4 w-4" />{item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{profile?.credits || 0}</span>
              <span className="text-xs text-muted-foreground">credits</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">{profile?.full_name?.charAt(0) || 'U'}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/account" className="cursor-pointer"><User className="mr-2 h-4 w-4" />Account Settings</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/feedback" className="cursor-pointer"><MessageSquare className="mr-2 h-4 w-4" />Give Feedback</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/portfolio" className="cursor-pointer"><Briefcase className="mr-2 h-4 w-4" />Portfolio</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/manage-slots" className="cursor-pointer"><Calendar className="mr-2 h-4 w-4" />Manage Slots</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/manage-sessions" className="cursor-pointer"><BookOpen className="mr-2 h-4 w-4" />Manage Sessions</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer"><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.href} to={item.href} onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                    <item.icon className="h-5 w-5" />{item.label}
                  </Link>
                );
              })}
              <div className="flex items-center gap-2 px-4 py-3">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">{profile?.credits || 0} credits</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AppNavbar;
