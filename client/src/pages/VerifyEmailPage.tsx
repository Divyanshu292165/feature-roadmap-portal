import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { post } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    post('/auth/verify-email', { token })
      .then(() => {
        setStatus('success');
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(err.message || 'Verification failed');
      });
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md p-8 text-center">
        {status === 'loading' && (
          <div className="py-8 flex flex-col items-center">
            <Spinner size="lg" className="mb-4" />
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8 flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">Your email address has been successfully verified.</p>
            <Link to="/login" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              Continue to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8 flex flex-col items-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link to="/login" className="text-blue-600 hover:underline">
              Return to Login
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
