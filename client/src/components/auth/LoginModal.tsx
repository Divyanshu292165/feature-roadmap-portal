import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
});

type FormData = z.infer<typeof schema>;

export function LoginModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess?: () => void }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data);
      toast.success('Logged in successfully');
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login to continue">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Password"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
        <div className="pt-2">
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Log in
          </Button>
        </div>
        <div className="text-sm text-center text-gray-500 mt-4">
          Don't have an account?{' '}
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => {
              onClose();
              navigate('/register', { state: { from: location } });
            }}
          >
            Sign up
          </button>
        </div>
      </form>
    </Modal>
  );
}
