import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  UserPlus, 
  ListTodo, 
  BellRing, 
  Award, 
  Boxes, 
  BarChart3, 
  Settings,
  LogOut,
  Home,
  Shield,
  Brain,
  HelpCircle,
  Building2,
  ClipboardCheck,
  UserCheck,
  FileDown
} from 'lucide-react';

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Debug logging removed
  
  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const navigationItems = [
    { icon: Home, label: 'Dashboard', href: '/', roles: ['hr_admin', 'branch_manager', 'team_lead', 'employee', 'logistics_manager'] },
    { icon: Users, label: 'Employee Management', href: '/employees', roles: ['hr_admin', 'branch_manager', 'team_lead'] },
    { icon: Building2, label: 'Departments', href: '/departments', roles: ['hr_admin', 'branch_manager'] },
    { icon: UserPlus, label: 'Onboarding', href: '/onboarding', roles: ['hr_admin', 'branch_manager', 'team_lead', 'employee'] },
    { icon: ClipboardCheck, label: 'Onboarding Checklists', href: '/onboarding-checklist-manager', roles: ['hr_admin', 'branch_manager'] },
    { icon: UserCheck, label: 'HR Onboarding Process', href: '/hr-onboarding', roles: ['hr_admin', 'branch_manager'] },
    { icon: FileDown, label: 'PDF Export Center', href: '/onboarding-pdf-export', roles: ['hr_admin', 'branch_manager'] },
    { icon: Brain, label: 'Psychometric Tests', href: '/psychometric-admin', roles: ['hr_admin', 'branch_manager'] },
    { icon: ListTodo, label: 'Task Management', href: '/tasks', roles: ['hr_admin', 'branch_manager', 'team_lead', 'employee'] },
    { icon: HelpCircle, label: 'Task Requests', href: '/task-requests', roles: ['hr_admin', 'branch_manager', 'team_lead', 'employee'] },
    { icon: BellRing, label: 'Announcements', href: '/announcements', roles: ['hr_admin', 'branch_manager', 'team_lead', 'employee'] },
    { icon: Award, label: 'Recognition', href: '/recognition', roles: ['hr_admin', 'branch_manager', 'team_lead', 'employee'] },
    { icon: Boxes, label: 'Logistics', href: '/logistics', roles: ['hr_admin', 'logistics_manager', 'team_lead'] },
    { icon: FileDown, label: 'Logistics PDF Export', href: '/logistics-pdf-export', roles: ['hr_admin', 'logistics_manager', 'branch_manager'] },
    { icon: BarChart3, label: 'Analytics', href: '/analytics', roles: ['hr_admin', 'branch_manager'] },
    { icon: Settings, label: 'Settings', href: '/settings', roles: ['hr_admin', 'branch_manager', 'team_lead', 'employee', 'logistics_manager'] },
  ];

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      hr_admin: 'HR Administrator',
      branch_manager: 'Branch Manager',
      team_lead: 'Team Lead',
      employee: 'Employee',
      logistics_manager: 'Logistics Manager'
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
            <Users className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Meeting Matters</h1>
            <p className="text-sm text-gray-500">HR Management</p>
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
