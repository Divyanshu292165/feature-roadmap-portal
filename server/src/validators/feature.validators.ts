import { z } from 'zod';

export const createFeatureSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    category: z.enum(['UI_UX', 'INTEGRATIONS', 'PERFORMANCE', 'GENERAL']),
  }),
});

export const updateFeatureSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().min(10).max(1000).optional(),
    category: z.enum(['UI_UX', 'INTEGRATIONS', 'PERFORMANCE', 'GENERAL']).optional(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['UNDER_REVIEW', 'PLANNED', 'IN_PROGRESS', 'COMPLETED']),
  }),
});
