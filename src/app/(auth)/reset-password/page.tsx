/* eslint-disable react-hooks/incompatible-library */
'use client';
import { Suspense } from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

type FormData = z.infer<typeof schema>;

function ResetPasswordPageContent() {
  const router = useRouter();
  const supabase = createClient();

  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch('password', '');

  // Password strength indicator
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setServerError(null);

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      setServerError(error.message);
      setIsLoading(false);
      return;
    }

    // Sign out all other sessions, redirect to dashboard
    await supabase.auth.signOut({ scope: 'others' });
    router.push('/dashboard');
  };

  return (
    <div className="auth-card">
      <div className="auth-card__header">
        <h1 className="auth-card__title">Set new password</h1>
        <p className="auth-card__subtitle">
          Your new password must be at least 8 characters
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="auth-form"
        noValidate
        id="reset-password-form"
      >
        {serverError && (
          <div className="auth-form__error" role="alert" id="reset-error">
            {serverError}
          </div>
        )}

        <div className="auth-form__field">
          <label htmlFor="reset-password" className="auth-form__label">
            New password
          </label>
          <input
            {...register('password')}
            id="reset-password"
            type="password"
            autoComplete="new-password"
            className={`auth-form__input ${errors.password ? 'auth-form__input--error' : ''}`}
            placeholder="••••••••"
            disabled={isLoading}
          />

          {/* Strength meter */}
          {password.length > 0 && (
            <div className="auth-form__strength">
              <div className="auth-form__strength-bars">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className="auth-form__strength-bar"
                    style={{
                      backgroundColor:
                        strength >= level
                          ? strengthColors[strength]
                          : 'var(--color-border)',
                    }}
                  />
                ))}
              </div>
              <span
                className="auth-form__strength-label"
                style={{ color: strengthColors[strength] }}
              >
                {strengthLabels[strength]}
              </span>
            </div>
          )}

          {errors.password && (
            <p className="auth-form__field-error" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="auth-form__field">
          <label htmlFor="reset-confirm-password" className="auth-form__label">
            Confirm new password
          </label>
          <input
            {...register('confirm_password')}
            id="reset-confirm-password"
            type="password"
            autoComplete="new-password"
            className={`auth-form__input ${errors.confirm_password ? 'auth-form__input--error' : ''}`}
            placeholder="••••••••"
            disabled={isLoading}
          />
          {errors.confirm_password && (
            <p className="auth-form__field-error" role="alert">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="auth-form__submit"
          disabled={isLoading || strength < 2}
          id="reset-password-submit"
        >
          {isLoading ? (
            <>
              <span className="auth-form__spinner" aria-hidden="true" />
              Updating password…
            </>
          ) : (
            'Update password'
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
