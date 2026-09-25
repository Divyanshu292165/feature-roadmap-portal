import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '../lib/api';
import { Comment, ApiResponse } from '../types';

export function useComments(featureId: string) {
  return useQuery({
    queryKey: ['comments', featureId],
    queryFn: () => get<ApiResponse<Comment[]>>(`/feature-requests/${featureId}/comments`)
  });
}

export function useCreateComment(featureId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; parentComment?: string }) => 
      post<ApiResponse<Comment>>(`/feature-requests/${featureId}/comments`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', featureId] });
      qc.invalidateQueries({ queryKey: ['feature', featureId] });
    }
  });
}

export function useUpdateComment(featureId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) => 
      patch<ApiResponse<Comment>>(`/comments/${commentId}`, { content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', featureId] });
    }
  });
}

export function useDeleteComment(featureId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => del(`/comments/${commentId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', featureId] });
      qc.invalidateQueries({ queryKey: ['feature', featureId] });
    }
  });
}
