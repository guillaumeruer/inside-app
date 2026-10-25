import { useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from 'lucide-react';
import AuthLayout from '@/features/auth/AuthLayout';

export default function Landing() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/home';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!loading && user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error } = await signIn({ email, password });

    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <AuthLayout
      reverse
      pitch={
        <>
          <h2>Vos cartons vous attendent.</h2>
          <p>Reprenez là où vous en étiez : pièces, boîtes et objets, tout est rangé.</p>
        </>
      }
    >
      <form className="auth__form" onSubmit={handleSubmit}>
        <div className="auth__heading">
          <h1 className="auth__title">Bon retour</h1>
          <p className="auth__subtitle">Connectez-vous pour retrouver vos boîtes.</p>
        </div>

        <div className="field">
          <div className="field__header">
            <label htmlFor="email" className="field__label">
              Adresse e-mail
            </label>
          </div>
          <div className="input-group">
            <MailIcon className="input-group__icon" />
            <input
              id="email"
              value={email}
              className="input"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="field">
          <div className="field__header">
            <label htmlFor="password" className="field__label">
              Mot de passe
            </label>
            <a href="/forgot" className="field__link">
              Mot de passe oublié ?
            </a>
          </div>
          <div className="input-group">
            <LockIcon className="input-group__icon" />
            <input
              id="password"
              value={password}
              className="input"
              type={showPassword ? 'text' : 'password'}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="input-group__action"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {error && <p role="alert">{error}</p>}

        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Connexion...' : 'Se connecter'}
        </button>
        <div className="divider">ou</div>
        <button type="button" className="btn btn--outline">
          Recevoir un lien magique
        </button>

        <p className="auth__switch">
          Pas encore de compte ? <Link to="/signup">Créer un compte</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
