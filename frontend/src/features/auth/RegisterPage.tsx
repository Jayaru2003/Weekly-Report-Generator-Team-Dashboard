import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuthContext } from '../../context/AuthContext';
import { postLoginRoute } from '../../components/layout/ProtectedRoute';
import { getApiErrorMessage } from '../../utils/apiError';
import { AuthFormLayout, AuthLink } from './AuthFormLayout';
import { registerSchema, type RegisterFormValues } from './schemas';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuthContext();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'MEMBER',
    },
  });

  if (isAuthenticated && user) {
    return <Navigate to={postLoginRoute(user.role)} replace />;
  }

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);

    try {
      const response = await authApi.register(values);
      login(response);
      navigate(postLoginRoute(response.role), { replace: true });
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Registration failed. Please try again.'));
    }
  };

  return (
    <AuthFormLayout
      title="Create account"
      subtitle="Register to start submitting weekly reports."
      footer={
        <>
          Already have an account? <AuthLink to="/login">Sign in</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <div className="auth-banner-error">{serverError}</div>}

        <div className="auth-field">
          <label htmlFor="firstName" className="auth-label">
            First name
          </label>
          <input id="firstName" type="text" autoComplete="given-name" className="auth-input" placeholder="John" {...register('firstName')} />
          {errors.firstName && <p className="auth-error">{errors.firstName.message}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="lastName" className="auth-label">
            Last name
          </label>
          <input id="lastName" type="text" autoComplete="family-name" className="auth-input" placeholder="Doe" {...register('lastName')} />
          {errors.lastName && <p className="auth-error">{errors.lastName.message}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="email" className="auth-label">
            Email
          </label>
          <input id="email" type="email" autoComplete="email" className="auth-input" placeholder="john.doe@company.com" {...register('email')} />
          {errors.email && <p className="auth-error">{errors.email.message}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="auth-input"
            placeholder="Min 6 characters"
            {...register('password')}
          />
          {errors.password && <p className="auth-error">{errors.password.message}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="role" className="auth-label">
            Role
          </label>
          <select id="role" className="auth-input" {...register('role')}>
            <option value="MEMBER">Member</option>
            <option value="MANAGER">Manager</option>
          </select>
          {errors.role && <p className="auth-error">{errors.role.message}</p>}
        </div>

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Register'}
        </button>
      </form>
    </AuthFormLayout>
  );
}
