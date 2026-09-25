import * as React from 'react';
import { Textarea as CossTextarea } from './coss/textarea';
import { Label } from './coss/label';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <Label className="mb-2" htmlFor={id}>
            {label}
          </Label>
        )}
        <CossTextarea
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          className={className}
          {...props}
        />
        {error && <p className="mt-1.5 text-destructive-foreground text-sm">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
