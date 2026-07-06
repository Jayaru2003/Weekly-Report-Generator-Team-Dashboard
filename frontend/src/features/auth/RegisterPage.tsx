import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuthContext } from '../../context/AuthContext';
import { postLoginRoute } from '../../components/layout/ProtectedRoute';
import { getApiErrorMessage } from '../../utils/apiError';
import { AuthFormLayout, AuthLink, authStyles } from './AuthFormLayout';
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
        {serverError && <div style={authStyles.bannerError}>{serverError}</div>}

        <div style={authStyles.field}>
          <label htmlFor="firstName" style={authStyles.label}>
            First name
          </label>
          <input id="firstName" type="text" autoComplete="given-name" style={authStyles.input} {...register('firstName')} />
          {errors.firstName && <p style={authStyles.error}>{errors.firstName.message}</p>}
        </div>

        <div style={authStyles.field}>
          <label htmlFor="lastName" style={authStyles.label}>
            Last name
          </label>
          <input id="lastName" type="text" autoComplete="family-name" style={authStyles.input} {...register('lastName')} />
          {errors.lastName && <p style={authStyles.error}>{errors.lastName.message}</p>}
        </div>

        <div style={authStyles.field}>
          <label htmlFor="email" style={authStyles.label}>
            Email
          </label>
          <input id="email" type="email" autoComplete="email" style={authStyles.input} {...register('email')} />
          {errors.email && <p style={authStyles.error}>{errors.email.message}</p>}
        </div>

        <div style={authStyles.field}>
          <label htmlFor="password" style={authStyles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            style={authStyles.input}
            {...register('password')}
          />
          {errors.password && <p style={authStyles.error}>{errors.password.message}</p>}
        </div>

        <div style={authStyles.field}>
          <label htmlFor="role" style={authStyles.label}>
            Role
          </label>
          <select id="role" style={authStyles.input} {...register('role')}>
            <option value="MEMBER">Member</option>
            <option value="MANAGER">Manager</option>
          </select>
          {errors.role && <p style={authStyles.error}>{errors.role.message}</p>}
        </div>

        <button type="submit" style={authStyles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Register'}
        </button>
      </form>
    </AuthFormLayout>
  );
}
