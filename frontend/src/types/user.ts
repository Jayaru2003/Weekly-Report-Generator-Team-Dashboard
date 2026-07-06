export type UserRole = 'MEMBER' | 'MANAGER';

export type User = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
};
