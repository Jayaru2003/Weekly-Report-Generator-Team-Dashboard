import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuthContext } from '../../context/AuthContext';
import { postLoginRoute } from '../../components/layout/ProtectedRoute';
import { getApiErrorMessage } from '../../utils/apiError';
import { AuthFormLayout, AuthLink } from './AuthFormLayout';
import { loginSchema, type LoginFormValues } from './schemas';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuthContext();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (isAuthenticated && user) {
    return <Navigate to={postLoginRoute(user.role)} replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);

    try {
      const response = await authApi.login(values);
      login(response);
      navigate(postLoginRoute(response.role), { replace: true });
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Login failed. Please try again.'));
    }
  };

  return (
    <AuthFormLayout
      title="Sign in"
      subtitle="Enter your credentials to access your account."
      footer={
        <>
          Don&apos;t have an account? <AuthLink to="/register">Register</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <div className="auth-banner-error">{serverError}</div>}

        <div className="auth-field">
          <label htmlFor="email" className="auth-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="auth-input"
            placeholder="yourname@company.com"
            {...register('email')}
          />
          {errors.email && <p className="auth-error">{errors.email.message}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="auth-input"
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password && <p className="auth-error">{errors.password.message}</p>}
        </div>

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthFormLayout>
  );
}
