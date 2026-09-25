import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../lib/api';
import { FeatureRequest, PaginatedResponse, FeaturesQueryParams, RoadmapData, ApiResponse } from '../types';

export function useFeatureList(params: FeaturesQueryParams) {
  return useQuery({
    queryKey: ['features', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.sort) searchParams.set('sort', params.sort);
      if (params.category) searchParams.set('category', params.category);
      if (params.status) searchParams.set('status', params.status);
      if (params.search) searchParams.set('search', params.search);
      return get<PaginatedResponse<FeatureRequest>>(`/feature-requests?${searchParams.toString()}`);
    }
  });
}

export function useFeature(id: string) {
  return useQuery({
    queryKey: ['feature', id],
    queryFn: () => get<ApiResponse<FeatureRequest>>(`/feature-requests/${id}`)
  });
}

export function useRoadmap() {
  return useQuery({
    queryKey: ['roadmap'],
    queryFn: () => get<ApiResponse<RoadmapData>>('/roadmap')
  });
}

export function useCreateFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => post<ApiResponse<FeatureRequest>>('/feature-requests', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['features'] });
      qc.invalidateQueries({ queryKey: ['roadmap'] });
    }
  });
}
