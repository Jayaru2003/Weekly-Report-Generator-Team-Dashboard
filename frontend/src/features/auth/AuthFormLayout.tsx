import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../../utils/constants';

type AuthFormLayoutProps = {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
};

export function AuthFormLayout({ title, subtitle, footer, children }: AuthFormLayoutProps) {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="auth-brand">
          {APP_NAME}
        </p>
        <h1 className="auth-title">{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
        <div className="auth-footer">{footer}</div>
      </div>
    </main>
  );
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="auth-link">
      {children}
    </Link>
  );
}
