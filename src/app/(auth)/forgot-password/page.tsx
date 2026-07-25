'use client';
import { Suspense } from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

function ForgotPasswordPageContent() {
  const supabase = createClient();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setServerError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setServerError(error.message);
      setStatus('error');
    } else {
      setStatus('success');
    }

    setIsLoading(false);
  };

  if (status === 'success') {
    return (
      <div className="auth-card">
        <div className="auth-card__success" id="forgot-password-success">
          <div className="auth-card__success-icon" aria-hidden="true">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.82 12a19.79 19.79 0 0 1-3-8.59A2 2 0 0 1 3.82 1.5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <h1 className="auth-card__title">Check your email</h1>
          <p className="auth-card__subtitle">
            We sent a password reset link to{' '}
            <strong>{getValues('email')}</strong>. It expires in 60 minutes.
          </p>
          <p className="auth-card__hint">
            Didn&apos;t receive it? Check your spam folder or{' '}
            <button
              type="button"
              className="auth-card__link"
              onClick={() => setStatus('idle')}
              id="resend-email-link"
            >
              try again
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <h1 className="auth-card__title">Reset your password</h1>
        <p className="auth-card__subtitle">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="auth-form"
        noValidate
        id="forgot-password-form"
      >
        {serverError && (
          <div className="auth-form__error" role="alert">
            {serverError}
          </div>
        )}

        <div className="auth-form__field">
          <label htmlFor="forgot-email" className="auth-form__label">
            Email address
          </label>
          <input
            {...register('email')}
            id="forgot-email"
            type="email"
            autoComplete="email"
            className={`auth-form__input ${errors.email ? 'auth-form__input--error' : ''}`}
            placeholder="you@company.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="auth-form__field-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="auth-form__submit"
          disabled={isLoading}
          id="forgot-password-submit"
        >
          {isLoading ? (
            <>
              <span className="auth-form__spinner" aria-hidden="true" />
              Sending link…
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <p className="auth-card__footer-text">
        Remember your password?{' '}
        <Link href="/login" className="auth-card__link" id="back-to-login">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordPageContent />
    </Suspense>
  );
}
