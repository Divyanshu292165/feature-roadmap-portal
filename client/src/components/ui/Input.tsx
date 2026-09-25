import * as React from 'react';
import { cn } from '../../lib/utils';
import { Input as CossInput } from './coss/input';
import { Label } from './coss/label';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <Label className="mb-2" htmlFor={id}>
            {label}
          </Label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-muted-foreground">
              {icon}
            </span>
          )}
          <CossInput
            ref={ref}
            type={type}
            id={id}
            aria-invalid={error ? true : undefined}
            className={cn(icon && '[&_input]:ps-9', className)}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-destructive-foreground text-sm">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
