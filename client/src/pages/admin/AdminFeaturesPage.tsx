import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, patch, del } from '../../lib/api';
import { FeatureRequest, PaginatedResponse, FeatureStatus } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminFeaturesPage() {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-features', page],
    queryFn: () => get<PaginatedResponse<FeatureRequest>>(`/admin/feature-requests?page=${page}&limit=20`)
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string, status: FeatureStatus }) => 
      patch(`/admin/feature-requests/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      qc.invalidateQueries({ queryKey: ['admin-features'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    }
  });

  const deleteFeature = useMutation({
    mutationFn: (id: string) => del(`/admin/feature-requests/${id}`),
    onSuccess: () => {
      toast.success('Feature deleted');
      qc.invalidateQueries({ queryKey: ['admin-features'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      deleteFeature.mutate(id);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Features</h1>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : data?.data.map((feature) => (
                <tr key={feature._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 max-w-[200px] truncate">{feature.title}</div>
                    <div className="text-xs text-gray-500">{formatDate(feature.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={`cat_${feature.category.toLowerCase()}` as any}>{feature.category}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {feature.author.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>↑ {feature.voteCount}</div>
                    <div>💬 {feature.commentCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Select
                      value={feature.status}
                      onValueChange={(value) => updateStatus.mutate({ id: feature._id, status: value as FeatureStatus })}
                      size="sm"
                      className="w-44"
                      options={[
                        { value: 'UNDER_REVIEW', label: 'Under Review' },
                        { value: 'PLANNED', label: 'Planned' },
                        { value: 'IN_PROGRESS', label: 'In Progress' },
                        { value: 'COMPLETED', label: 'Completed' },
                      ]}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDelete(feature._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-gray-600">Page {page} of {data.pagination.pages}</span>
          <Button variant="outline" disabled={page === data.pagination.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
