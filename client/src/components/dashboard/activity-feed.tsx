import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, TriangleAlert, Check, BellRing } from 'lucide-react';
import { Activity } from '@/types';

interface ActivityFeedProps {
  activities: Activity[];
  isLoading: boolean;
}

export default function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task':
        return UserPlus;
      case 'announcement':
        return BellRing;
      default:
        return Check;
    }
  };

  const getActivityColor = (type: string, status: string) => {
    if (status === 'overdue') return 'bg-warning/10 text-warning';
    if (status === 'completed') return 'bg-accent/10 text-accent';
    return 'bg-primary/10 text-primary';
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'bg-destructive/10 text-destructive';
      case 'completed':
        return 'bg-accent/10 text-accent';
      case 'published':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-accent/10 text-accent';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <Card className="stats-card">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Activities</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="activity-item animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length > 0 ? (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={`${activity.type}-${activity.id}`} className="activity-item">
                  <div className={`activity-icon ${getActivityColor(activity.type, activity.status)}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">
                      {activity.type === 'task' ? 'Task: ' : 'Announcement: '}
                      <span className="text-primary">{activity.title}</span>
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                  <Badge className={`activity-badge ${getBadgeVariant(activity.status)}`}>
                    {activity.status}
                  </Badge>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Check className="mx-auto mb-4 text-gray-400" size={48} />
              <p>No recent activities</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
