import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, User } from 'lucide-react';
import AuthLayout from '@/features/auth/AuthLayout';
import { MIN_PASSWORD_LENGTH, StrengthMeter } from '@/features/auth/StrengthMeter';
import { useAuth } from '@/features/auth/useAuth';
import { PasswordInput } from '@/shared/PasswordInput';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';

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

  const passwordTooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== password;

  const canSubmit =
    firstName.trim() &&
    email &&
    password.length >= MIN_PASSWORD_LENGTH &&
    confirm === password &&
    acceptTerms;

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

        <Field
          label="Prénom"
          icon={User}
          type="text"
          autoComplete="given-name"
          placeholder="Camille"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <Field
          label="Adresse e-mail"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <PasswordInput
          label="Mot de passe"
          autoComplete="new-password"
          placeholder={`${MIN_PASSWORD_LENGTH} caractères minimum`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={touch('password')}
          error={
            touched.password && passwordTooShort
              ? `Le mot de passe doit faire au moins ${MIN_PASSWORD_LENGTH} caractères.`
              : undefined
          }
          after={<StrengthMeter password={password} />}
          required
        />

        <PasswordInput
          label="Confirmer le mot de passe"
          autoComplete="new-password"
          placeholder="Saisissez-le à nouveau"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={touch('confirm')}
          error={
            touched.confirm && mismatch ? 'Les deux mots de passe ne correspondent pas.' : undefined
          }
          required
        />

        <label className="checkbox">
          <input
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

        <Button
          type="submit"
          block
          disabled={!canSubmit}
          loading={submitting}
          loadingText="Création…"
        >
          Créer mon compte
        </Button>

        <p className="auth__switch">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
