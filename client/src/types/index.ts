export type UserRole = 'USER' | 'ADMIN';
export type FeatureStatus = 'UNDER_REVIEW' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
export type FeatureCategory = 'UI_UX' | 'INTEGRATIONS' | 'PERFORMANCE' | 'GENERAL';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

export interface FeatureRequest {
  _id: string;
  title: string;
  description: string;
  category: FeatureCategory;
  status: FeatureStatus;
  author: { _id: string; name: string; email: string };
  voteCount: number;
  commentCount: number;
  hasVoted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  featureRequest: string;
  author: { _id: string; name: string; email: string };
  content: string;
  parentComment: string | null;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
}

export interface RoadmapData {
  PLANNED: FeatureRequest[];
  IN_PROGRESS: FeatureRequest[];
  COMPLETED: FeatureRequest[];
}

export interface AdminStats {
  totalUsers: number;
  totalFeatureRequests: number;
  totalVotes: number;
  totalComments: number;
  byStatus: Record<FeatureStatus, number>;
}

export interface FeaturesQueryParams {
  page?: number;
  limit?: number;
  sort?: 'upvotes' | 'trending' | 'newest' | 'discussed';
  category?: FeatureCategory | '';
  status?: FeatureStatus | '';
  search?: string;
}
