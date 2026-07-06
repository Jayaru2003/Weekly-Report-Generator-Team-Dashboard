import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../../utils/constants';

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f4f6f8',
  padding: '1.5rem',
};

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  padding: '2rem',
};

const titleStyle: CSSProperties = {
  margin: '0 0 0.25rem',
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#1a1a1a',
};

const subtitleStyle: CSSProperties = {
  margin: '0 0 1.5rem',
  color: '#666',
  fontSize: '0.95rem',
};

const fieldStyle: CSSProperties = {
  marginBottom: '1rem',
};

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: '0.35rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#333',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  fontSize: '0.95rem',
  border: '1px solid #ccc',
  borderRadius: '6px',
  boxSizing: 'border-box',
};

const errorStyle: CSSProperties = {
  marginTop: '0.35rem',
  fontSize: '0.8rem',
  color: '#c0392b',
};

const submitStyle: CSSProperties = {
  width: '100%',
  marginTop: '0.5rem',
  padding: '0.65rem',
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#fff',
  backgroundColor: '#2563eb',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

const footerStyle: CSSProperties = {
  marginTop: '1.25rem',
  textAlign: 'center',
  fontSize: '0.875rem',
  color: '#666',
};

const bannerErrorStyle: CSSProperties = {
  marginBottom: '1rem',
  padding: '0.75rem',
  fontSize: '0.875rem',
  color: '#c0392b',
  backgroundColor: '#fdecea',
  borderRadius: '6px',
};

export const authStyles = {
  page: pageStyle,
  card: cardStyle,
  title: titleStyle,
  subtitle: subtitleStyle,
  field: fieldStyle,
  label: labelStyle,
  input: inputStyle,
  error: errorStyle,
  submit: submitStyle,
  footer: footerStyle,
  bannerError: bannerErrorStyle,
};

type AuthFormLayoutProps = {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
};

export function AuthFormLayout({ title, subtitle, footer, children }: AuthFormLayoutProps) {
  return (
    <main style={authStyles.page}>
      <div style={authStyles.card}>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {APP_NAME}
        </p>
        <h1 style={authStyles.title}>{title}</h1>
        <p style={authStyles.subtitle}>{subtitle}</p>
        {children}
        <div style={authStyles.footer}>{footer}</div>
      </div>
    </main>
  );
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} style={{ color: '#2563eb', textDecoration: 'none' }}>
      {children}
    </Link>
  );
}
