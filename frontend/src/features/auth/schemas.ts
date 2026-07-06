import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Must be a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name must be at most 100 characters'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name must be at most 100 characters'),
  email: z.string().min(1, 'Email is required').email('Must be a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['MEMBER', 'MANAGER'], { message: 'Role is required (MEMBER or MANAGER)' }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
