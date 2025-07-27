export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: 'hr_admin' | 'branch_manager' | 'team_lead' | 'employee' | 'logistics_manager';
  status: 'active' | 'inactive' | 'onboarding' | 'terminated';
  department?: string;
  position?: string;
  managerId?: string;
  startDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: number;
  userId: string;
  employeeId: string;
  phoneNumber?: string;
  address?: string;
  emergencyContact?: any;
  onboardingStatus: string;
  onboardingProgress: number;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  assignedTo?: string;
  assignedBy?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  assignedToUser?: User;
  assignedByUser?: User;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  authorId: string;
  isPublished: boolean;
  targetRoles?: string[];
  createdAt: Date;
  updatedAt: Date;
  author: User;
}

export interface Recognition {
  id: number;
  nomineeId: string;
  nominatedBy: string;
  title: string;
  description: string;
  type: string;
  isApproved: boolean;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  nominee: User;
  nominator: User;
}

export interface LogisticsItem {
  id: number;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  minQuantity: number;
  location?: string;
  lastUpdated: Date;
  createdAt: Date;
}

export interface LogisticsRequest {
  id: number;
  requesterId: string;
  itemId: number;
  quantity: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  requester: User;
  item: LogisticsItem;
}

export interface OnboardingChecklist {
  id: number;
  employeeId: number;
  itemTitle: string;
  description?: string;
  isCompleted: boolean;
  completedBy?: string;
  dueDate?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  relatedTo?: string;
  relatedType?: string;
  isApproved: boolean;
  approvedBy?: string;
  createdAt: Date;
  uploader: User;
}

export interface DashboardStats {
  totalEmployees: number;
  activeOnboarding: number;
  openTasks: number;
  pendingApprovals: number;
  complianceRate: number;
}

export interface Activity {
  type: string;
  id: number;
  title: string;
  timestamp: Date;
  status: string;
}

export interface Approval {
  type: string;
  id: number;
  title: string;
  requester: string;
  timestamp: Date;
}
