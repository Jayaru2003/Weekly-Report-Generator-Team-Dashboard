import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuthContext } from '../../context/AuthContext';
import { postLoginRoute } from '../../components/layout/ProtectedRoute';
import { getApiErrorMessage } from '../../utils/apiError';
import { AuthFormLayout, AuthLink, authStyles } from './AuthFormLayout';
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
        {serverError && <div style={authStyles.bannerError}>{serverError}</div>}

        <div style={authStyles.field}>
          <label htmlFor="email" style={authStyles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            style={authStyles.input}
            {...register('email')}
          />
          {errors.email && <p style={authStyles.error}>{errors.email.message}</p>}
        </div>

        <div style={authStyles.field}>
          <label htmlFor="password" style={authStyles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            style={authStyles.input}
            {...register('password')}
          />
          {errors.password && <p style={authStyles.error}>{errors.password.message}</p>}
        </div>

        <button type="submit" style={authStyles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthFormLayout>
  );
}
