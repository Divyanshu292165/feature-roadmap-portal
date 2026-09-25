import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post, del } from '../lib/api';
import toast from 'react-hot-toast';
import { FeatureRequest, PaginatedResponse, RoadmapData } from '../types';

export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ featureId, hasVoted }: { featureId: string; hasVoted?: boolean }) => {
      if (hasVoted) {
        return del(`/feature-requests/${featureId}/vote`);
      }
      return post(`/feature-requests/${featureId}/vote`, {});
    },
    onMutate: async ({ featureId, hasVoted }) => {
      await queryClient.cancelQueries({ queryKey: ['features'] });
      await queryClient.cancelQueries({ queryKey: ['feature', featureId] });
      await queryClient.cancelQueries({ queryKey: ['roadmap'] });

      const prevSingle = queryClient.getQueryData<{ data: FeatureRequest }>(['feature', featureId]);
      const prevFeatures = queryClient.getQueriesData<PaginatedResponse<FeatureRequest>>({ queryKey: ['features'] });
      const prevRoadmap = queryClient.getQueryData<{ data: RoadmapData }>(['roadmap']);

      // Optimistically update single feature
      if (prevSingle?.data) {
        queryClient.setQueryData(['feature', featureId], {
          ...prevSingle,
          data: {
            ...prevSingle.data,
            hasVoted: !hasVoted,
            voteCount: Math.max(0, prevSingle.data.voteCount + (hasVoted ? -1 : 1))
          }
        });
      }

      // Optimistically update feature lists
      queryClient.setQueriesData<PaginatedResponse<FeatureRequest>>({ queryKey: ['features'] }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((item) =>
            item._id === featureId
              ? {
                  ...item,
                  hasVoted: !hasVoted,
                  voteCount: Math.max(0, item.voteCount + (hasVoted ? -1 : 1))
                }
              : item
          )
        };
      });

      return { prevSingle, prevFeatures, prevRoadmap };
    },
    onError: (err: any, { featureId }, context) => {
      toast.error(err.message || 'Failed to update vote');
      if (context?.prevSingle) {
        queryClient.setQueryData(['feature', featureId], context.prevSingle);
      }
      if (context?.prevFeatures) {
        context.prevFeatures.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.prevRoadmap) {
        queryClient.setQueryData(['roadmap'], context.prevRoadmap);
      }
    },
    onSettled: (_, __, { featureId }) => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
      queryClient.invalidateQueries({ queryKey: ['feature', featureId] });
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    }
  });
}
