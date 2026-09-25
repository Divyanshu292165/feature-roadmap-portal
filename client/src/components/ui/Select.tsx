import type * as React from 'react';
import { cn } from '../../lib/utils';
import {
  Select as CossSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './coss/select';
import { Label } from './coss/label';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  id?: string;
  name?: string;
  disabled?: boolean;
}

export function Select({
  label,
  error,
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder,
  className,
  size = 'default',
  id,
  name,
  disabled,
}: SelectProps): React.ReactElement {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <Label className="mb-2" htmlFor={id}>
          {label}
        </Label>
      )}
      <CossSelect
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => onValueChange?.(next as string)}
        name={name}
        disabled={disabled}
      >
        <SelectTrigger id={id} size={size} aria-invalid={error ? true : undefined}>
          <SelectValue>
            {(current: string) =>
              options.find((option) => option.value === current)?.label ?? placeholder ?? ''
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </CossSelect>
      {error && <p className="mt-1.5 text-destructive-foreground text-sm">{error}</p>}
    </div>
  );
}
