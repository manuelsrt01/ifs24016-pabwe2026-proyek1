import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { validateAuthForm } from '../utils/validators.js';

const COPY = {
  login: {
    title: 'Masuk',
    subtitle: 'Selamat datang kembali, Pembaca.',
    submit: 'Masuk',
    footer: <>Belum punya akun? <Link to="/register">Daftar</Link></>,
  },
  register: {
    title: 'Buat Akun',
    subtitle: 'Daftar untuk mulai mencatat bacaanmu.',
    submit: 'Daftar',
    footer: <>Sudah punya akun? <Link to="/login">Masuk</Link></>,
  },
};

function AuthForm({ mode }) {
  const { status, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const copy = COPY[mode];
  const isRegister = mode === 'register';
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (status === 'authed') return <Navigate to="/" replace />;

  const set = (key, value) => setValues((s) => ({ ...s, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setFormError('');
    const found = validateAuthForm(values, mode);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    try {
      const email = values.email.trim();
      if (isRegister) await register({ name: values.name.trim(), email, password: values.password });
      else await login({ email, password: values.password });
      navigate(location.state?.from ?? '/', { replace: true });
    } catch (err) {
      setErrors((prev) => ({ ...prev, ...err?.details }));
      setFormError(err?.message ?? 'Terjadi kesalahan');
      setBusy(false);
    }
  };

  const field = (name, label, props) => (
    <div className="field">
      <label htmlFor={`auth-${name}`}>{label}</label>
      <input id={`auth-${name}`} value={values[name]} onChange={(e) => set(name, e.target.value)} {...props} />
      {errors[name] && <p className="field-error" role="alert">{errors[name]}</p>}
    </div>
  );

  const passwordAutocomplete = isRegister ? 'new-password' : 'current-password';
  return (
    <AuthShell title={copy.title} subtitle={copy.subtitle} footer={copy.footer}>
      <form className="form" onSubmit={submit} noValidate>
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}
        {isRegister && field('name', 'Nama', { autoComplete: 'name', maxLength: 80 })}
        {field('email', 'Email', { type: 'email', autoComplete: 'email', maxLength: 254 })}
        {field('password', 'Kata sandi', { type: 'password', autoComplete: passwordAutocomplete, maxLength: 128 })}
        {isRegister && field('confirm', 'Ulangi kata sandi', { type: 'password', autoComplete: 'new-password' })}
        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Memproses…' : copy.submit}
        </button>
      </form>
    </AuthShell>
  );
}

export const LoginPage = () => <AuthForm mode="login" />;
export const RegisterPage = () => <AuthForm mode="register" />;
