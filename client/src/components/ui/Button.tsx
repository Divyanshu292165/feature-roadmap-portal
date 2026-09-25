import type * as React from 'react';
import { Button as CossButton, type ButtonProps as CossButtonProps } from './coss/button';

export interface ButtonProps
  extends Omit<CossButtonProps, 'loading' | 'size' | 'variant'> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  variant = 'default',
  size = 'md',
  isLoading,
  ...props
}: ButtonProps): React.ReactElement {
  return (
    <CossButton
      variant={variant}
      size={size === 'md' ? 'default' : size}
      loading={isLoading}
      {...props}
    />
  );
}
