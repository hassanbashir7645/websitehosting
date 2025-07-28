import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  Brain,
  BarChart3,
  Users,
  FileText,
  Settings,
  LogOut,
  Home,
  Shield,
  Target,
  Award
} from 'lucide-react';

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Debug logging removed
  
  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const navigationItems = [
    { icon: Home, label: 'Dashboard', href: '/', roles: ['hr_admin', 'recruiter', 'hiring_manager'] },
    { icon: Brain, label: 'Psychometric Tests', href: '/psychometric-admin', roles: ['hr_admin', 'recruiter'] },
    { icon: Users, label: 'Test Candidates', href: '/candidates', roles: ['hr_admin', 'recruiter', 'hiring_manager'] },
    { icon: Target, label: 'Test Results', href: '/test-results-admin', roles: ['hr_admin', 'recruiter', 'hiring_manager'] },
    { icon: BarChart3, label: 'Analytics', href: '/analytics', roles: ['hr_admin', 'recruiter'] },
    { icon: FileText, label: 'Reports', href: '/reports', roles: ['hr_admin', 'recruiter', 'hiring_manager'] },
    { icon: Settings, label: 'Settings', href: '/settings', roles: ['hr_admin', 'recruiter', 'hiring_manager'] },
  ];

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      hr_admin: 'HR Administrator',
      recruiter: 'Recruiter',
      hiring_manager: 'Hiring Manager',
      candidate: 'Test Candidate',
      system_admin: 'System Administrator'
    };
    return roleMap[role] || role;
  };

  const hasAccess = (requiredRoles: string[]) => {
    return user && 'role' in user && user.role && requiredRoles.includes(user.role);
  };

  return (
    <aside className="w-64 bg-surface shadow-lg border-r border-gray-200">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">PsychoTest Pro</h1>
            <p className="text-sm text-gray-500">Psychometric Testing</p>
          </div>
        </div>
      </div>

      {/* User Role Indicator */}
      <div className="p-4 bg-blue-50 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Shield className="text-white" size={14} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user && 'firstName' in user ? `${user.firstName} ${user.lastName}` : 'User'}
            </p>
            <p className="text-xs text-primary font-medium">
              {user && 'role' in user && user.role ? getRoleDisplayName(user.role) : 'Employee'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2 flex-1">
        {navigationItems.map((item) => {
          if (!hasAccess(item.roles)) return null;
          
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start space-x-3 ${
                  isActive 
                    ? 'sidebar-active' 
                    : 'sidebar-inactive'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start space-x-3 text-gray-700 hover:bg-gray-100"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
