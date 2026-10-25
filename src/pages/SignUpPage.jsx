import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '@/features/auth/AuthLayout';
import { useAuth } from '@/features/auth/useAuth';

const MIN_LENGTH = 8;

function getStrength(password) {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= MIN_LENGTH) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  const labels = ['Trop court', 'Faible', 'Moyen', 'Solide', 'Excellent'];
  return { score, label: password.length < MIN_LENGTH ? labels[0] : labels[score] };
}

function PasswordInput({
  id,
  value,
  onChange,
  onBlur,
  autoComplete,
  placeholder,
  invalid,
  describedBy,
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="input-group">
      <Lock className="input-group__icon" aria-hidden />
      <input
        id={id}
        className="input"
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        required
      />
      <button
        type="button"
        className="input-group__action"
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
}

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const strength = getStrength(password);
  const passwordTooShort = password.length > 0 && password.length < MIN_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== password;

  const showPasswordError = touched.password && passwordTooShort;
  const showConfirmError = touched.confirm && mismatch;

  const canSubmit =
    firstName.trim() &&
    email &&
    password.length >= MIN_LENGTH &&
    confirm === password &&
    acceptTerms &&
    !submitting;

  const touch = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched({ password: true, confirm: true });
    if (!canSubmit) return;

    setSubmitting(true);
    setFormError('');
    const { error } = await signUp({
      email,
      password,
      options: { data: { first_name: firstName.trim() } },
    });
    setSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }
    navigate('/login', { state: { justSignedUp: true, email } });
  }

  return (
    <AuthLayout
      pitch={
        <>
          <h2>Chaque carton a son QR code.</h2>
          <p>Scannez-le et voyez ce qu'il contient, sans rien ouvrir.</p>
        </>
      }
    >
      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <div className="auth__heading">
          <h1 className="auth__title">Créer un compte</h1>
          <p className="auth__subtitle">Étiquetez vos cartons, scannez, retrouvez tout.</p>
        </div>

        <div className="field">
          <label htmlFor="first-name" className="field__label">
            Prénom
          </label>
          <div className="input-group">
            <User className="input-group__icon" aria-hidden />
            <input
              id="first-name"
              className="input"
              type="text"
              autoComplete="given-name"
              placeholder="Camille"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="email" className="field__label">
            Adresse e-mail
          </label>
          <div className="input-group">
            <Mail className="input-group__icon" aria-hidden />
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="password" className="field__label">
            Mot de passe
          </label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder={`${MIN_LENGTH} caractères minimum`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={touch('password')}
            invalid={showPasswordError}
            describedBy="password-strength password-error"
          />
          <div id="password-strength" className="strength" aria-live="polite">
            <div className="strength__bars" aria-hidden>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="strength__bar" data-on={strength.score >= n} />
              ))}
            </div>
            {strength.label && <span className="strength__label">{strength.label}</span>}
          </div>
          {showPasswordError && (
            <p id="password-error" className="field__error">
              Le mot de passe doit faire au moins {MIN_LENGTH} caractères.
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="password-confirm" className="field__label">
            Confirmer le mot de passe
          </label>
          <PasswordInput
            id="password-confirm"
            autoComplete="new-password"
            placeholder="Saisissez-le à nouveau"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={touch('confirm')}
            invalid={showConfirmError}
            describedBy="confirm-error"
          />
          {showConfirmError && (
            <p id="confirm-error" className="field__error">
              Les deux mots de passe ne correspondent pas.
            </p>
          )}
        </div>

        <label htmlFor="terms" className="checkbox">
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            required
          />
          <span>
            J'accepte les <Link to="/cgu">conditions d'utilisation</Link> et la{' '}
            <Link to="/confidentialite">politique de confidentialité</Link>.
          </span>
        </label>

        {formError && (
          <p className="field__error" role="alert">
            {formError}
          </p>
        )}

        <button type="submit" className="btn btn--primary" disabled={!canSubmit}>
          {submitting ? 'Création…' : 'Créer mon compte'}
        </button>

        <p className="auth__switch">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
