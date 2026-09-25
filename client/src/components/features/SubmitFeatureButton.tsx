import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, type ButtonProps } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { LoginModal } from '../auth/LoginModal';
import FeatureForm from './FeatureForm';
import { useAuth } from '../../context/AuthContext';

interface SubmitFeatureButtonProps {
  className?: string;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  children?: ReactNode;
}

/**
 * Opens the "Request a Feature" form in a modal.
 * If the visitor is not logged in, prompts login first, then opens the form.
 */
export function SubmitFeatureButton({ className, size = 'md', variant = 'default', children }: SubmitFeatureButtonProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const openForm = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    setShowForm(true);
  };

  return (
    <>
      <Button size={size} variant={variant} className={className} onClick={openForm}>
        {children ?? 'Submit a Feature'}
      </Button>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Request a Feature">
        <FeatureForm
          embedded
          onCancel={() => setShowForm(false)}
          onSuccess={(id) => {
            setShowForm(false);
            navigate(`/features/${id}`);
          }}
        />
      </Modal>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          setShowLogin(false);
          setShowForm(true);
        }}
      />
    </>
  );
}
