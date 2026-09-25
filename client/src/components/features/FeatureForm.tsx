import { useState } from 'react';
// Removed react-form

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useCreateFeature } from '../../hooks/useFeatures';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['UI_UX', 'INTEGRATIONS', 'PERFORMANCE', 'GENERAL'])
});

type FormData = z.infer<typeof schema>;

export default function FeatureForm() {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const navigate = useNavigate();
  const createMutation = useCreateFeature();
  
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'GENERAL' }
  });

  const descriptionValue = watch('description') || '';
  const titleValue = watch('title') || '';

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data, {
      onSuccess: (res) => {
        toast.success('Feature created successfully');
        navigate(`/features/${res.data._id}`);
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to create feature');
      }
    });
  };

  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Request a Feature</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Input
            label="Title"
            placeholder="Short, descriptive title"
            {...register('title')}
            error={errors.title?.message}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">{titleValue.length}/100</p>
        </div>
        
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select
              label="Category"
              value={field.value}
              onValueChange={field.onChange}
              error={errors.category?.message}
              options={[
                { value: 'GENERAL', label: 'General' },
                { value: 'UI_UX', label: 'UI/UX' },
                { value: 'INTEGRATIONS', label: 'Integrations' },
                { value: 'PERFORMANCE', label: 'Performance' },
              ]}
            />
          )}
        />

        <div>
          <div className="flex border-b mb-4">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'write' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('write')}
            >
              Write
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'preview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </button>
          </div>
          
          {activeTab === 'write' ? (
            <Textarea
              className="[&_textarea]:min-h-[200px]"
              placeholder="Describe your feature request... Markdown is supported."
              {...register('description')}
              error={errors.description?.message}
            />
          ) : (
            <div className="prose max-w-none min-h-[200px] p-4 border rounded-md bg-gray-50">
              {descriptionValue ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {DOMPurify.sanitize(descriptionValue)}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-400 italic">Nothing to preview</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" isLoading={createMutation.isPending}>Submit Request</Button>
        </div>
      </form>
    </Card>
  );
}
