import { forwardRef } from 'react';
import styles from './Input.module.css';
import { cn } from '@/lib/utils/cn';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helpText, error, required, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={styles.field}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.label__required}>*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            styles.input,
            error && styles['input--error'],
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
          }
          required={required}
          {...props}
        />
        {helpText && !error && (
          <span id={`${inputId}-help`} className={styles.help}>
            {helpText}
          </span>
        )}
        {error && (
          <span id={`${inputId}-error`} className={styles.error} role="alert">
            <AlertCircle size={12} aria-hidden="true" />
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/** Textarea variant */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helpText, error, required, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={styles.field}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.label__required}>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            styles.textarea,
            error && styles['input--error'],
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
          }
          required={required}
          {...props}
        />
        {helpText && !error && (
          <span id={`${inputId}-help`} className={styles.help}>
            {helpText}
          </span>
        )}
        {error && (
          <span id={`${inputId}-error`} className={styles.error} role="alert">
            <AlertCircle size={12} aria-hidden="true" />
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
