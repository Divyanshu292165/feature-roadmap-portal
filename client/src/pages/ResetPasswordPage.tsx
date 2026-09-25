import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { post } from '../lib/api';
import toast from 'react-hot-toast';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  if (!token) {
    return <div className="text-center py-12 text-red-500 font-medium">Invalid or missing reset token.</div>;
  }

  const onSubmit = async (data: FormData) => {
    try {
      await post('/auth/reset-password', { token, newPassword: data.password });
      toast.success('Password has been reset successfully');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Set new password</h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input label="New Password" type="password" {...register('password')} error={errors.password?.message} />
            <Input label="Confirm New Password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>Reset Password</Button>
        </form>
      </Card>
    </div>
  );
}
