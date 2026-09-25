import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { post } from '../lib/api';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email')
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await post('/auth/forgot-password', data);
      toast.success('Check the server console for your reset link (development mode)');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-8 space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
        </div>
        
        {isSubmitSuccessful ? (
          <div className="text-center">
            <p className="text-green-600 font-medium mb-6">If an account with that email exists, we sent a password reset link.</p>
            <Link to="/login" className="text-blue-600 hover:underline font-medium">Return to login</Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <Input label="Email address" type="email" {...register('email')} error={errors.email?.message} />
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>Send Reset Link</Button>
            
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-blue-600 hover:underline">Back to login</Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
