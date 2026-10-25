import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Mail, Send } from 'lucide-react';
import AuthLayout from '@/features/auth/AuthLayout';
import { useAuth } from '@/features/auth/useAuth';
import { PasswordInput } from '@/shared/PasswordInput';
import { Button } from '@/shared/ui/Button';
import { Divider } from '@/shared/ui/Divider';
import { Field } from '@/shared/ui/Field';

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/home';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
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
  }

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

        <Field
          label="Adresse e-mail"
          icon={Mail}
          type="email"
          autoComplete="username"
          placeholder="vous@exemple.fr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <PasswordInput
          label="Mot de passe"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          labelAction={<Link to="/forgot-password">Mot de passe oublié ?</Link>}
          required
        />

        {error && (
          <p className="field__error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" block loading={submitting} loadingText="Connexion…">
          Se connecter
        </Button>

        <Divider>ou</Divider>

        <Button variant="outline" block icon={Send}>
          Recevoir un lien magique
        </Button>

        <p className="auth__switch">
          Pas encore de compte ? <Link to="/signup">Créer un compte</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
