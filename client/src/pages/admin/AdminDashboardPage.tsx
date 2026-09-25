import { useQuery } from '@tanstack/react-query';
import { get } from '../../lib/api';
import { AdminStats, ApiResponse } from '../../types';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Users, Lightbulb, ArrowUp, MessageSquare } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: statsRes, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => get<ApiResponse<AdminStats>>('/admin/stats')
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    );
  }

  const stats = statsRes?.data;

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Feature Requests', value: stats?.totalFeatureRequests || 0, icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Total Votes', value: stats?.totalVotes || 0, icon: ArrowUp, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Total Comments', value: stats?.totalComments || 0, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(stat => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 max-w-lg">
        <h3 className="text-lg font-semibold mb-4">Requests by Status</h3>
        {stats?.byStatus && (
          <div className="space-y-4">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-gray-600 capitalize">{status.replace('_', ' ').toLowerCase()}</span>
                <span className="font-semibold">{count as React.ReactNode}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
