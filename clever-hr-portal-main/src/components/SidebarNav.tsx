
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  ClipboardList, 
  Home as HomeIcon, 
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SidebarNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
    { name: 'Employees', icon: Users, path: '/employees' },
    { name: 'Departments', icon: Building2, path: '/departments' },
    { name: 'Job History', icon: ClipboardList, path: '/job-history' },
  ];

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('Sign out error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white w-64 py-6 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center">HR Manager</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link 
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-md transition-colors",
                  location.pathname === item.path 
                    ? "bg-hr-primary text-white" 
                    : "hover:bg-gray-800 text-gray-300"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-5 w-5" />
          {isLoggingOut ? 'Signing out...' : 'Sign out'}
        </Button>
      </div>
    </div>
  );
};

export default SidebarNav;
