import { forwardRef } from 'react';
import styles from './Button.module.css';
import { cn } from '@/lib/utils/cn';
import { Spinner } from '@/components/ui/Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'cta';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const iconSizeMap: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18 };
const spinnerSizeMap: Record<ButtonSize, number> = { sm: 12, md: 14, lg: 16 };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isIconOnly = icon && !children;

    return (
      <button
        ref={ref}
        className={cn(
          styles.btn,
          styles[`btn--${variant}`],
          styles[`btn--${size}`],
          loading && styles['btn--loading'],
          isIconOnly && styles['btn--icon-only'],
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <Spinner size={spinnerSizeMap[size]} />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className={styles[`btn__icon--${size}`]} aria-hidden="true">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <span className={styles[`btn__icon--${size}`]} aria-hidden="true">{icon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
