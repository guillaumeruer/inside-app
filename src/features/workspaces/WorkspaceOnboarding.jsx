import { useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { createWorkspace } from './createWorkspace';
import { WORKSPACE_KINDS, getWorkspaceKind } from './kinds';
import './WorkspaceOnboarding.css';

const STEPS = [
  { title: 'Crée un espace', text: 'Le lieu où sont tes affaires.' },
  { title: 'Ajoute tes emplacements', text: 'Cartons, étagères, tiroirs — et colle leur étiquette QR.' },
  { title: 'Range, scanne, retrouve', text: "Un scan suffit pour savoir ce qu'il y a dedans." },
];

export function WorkspaceOnboarding({ onCreated }) {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.first_name ?? '';

  const [kind, setKind] = useState('home');
  const [name, setName] = useState(getWorkspaceKind('home').defaultName);
  const [nameEdited, setNameEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleKindChange(nextKind) {
    setKind(nextKind);

    if (!nameEdited) setName(getWorkspaceKind(nextKind).defaultName);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const workspace = await createWorkspace({ name, kind, ownerId: user.id });
      onCreated?.(workspace);
    } catch (err) {
      setError(err.message ?? 'Impossible de créer l’espace.');
      setSubmitting(false);
    }
  }

  return (
    <div className="onboarding">
      <div className="onboarding__main">
        <div className="onboarding__intro">
          <h1 className="onboarding__title">Bienvenue{firstName && ` ${firstName}`}&#160;!</h1>
          <p className="onboarding__lead">
            Plus jamais de « tu l'as mis où ? ». Ça commence par un espace : ta maison, un
            garde-meuble, la cave des parents…
          </p>
        </div>

        <form className="onboarding__card" onSubmit={handleSubmit}>
          <fieldset className="kind-picker">
            <legend className="kind-picker__legend">C'est quoi, ton premier espace ?</legend>
            <div className="kind-picker__options">
              {WORKSPACE_KINDS.map(({ value, label, icon: Icon }) => (
                <label key={value} className="kind-picker__option">
                  <input
                    type="radio"
                    name="workspace-kind"
                    value={value}
                    checked={kind === value}
                    onChange={() => handleKindChange(value)}
                    className="kind-picker__input"
                  />
                  <Icon aria-hidden="true" className="kind-picker__icon" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field
            label="Son nom"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameEdited(true);
            }}
            placeholder="ex. Appartement, Cave, Box 14"
            autoComplete="off"
            required
          />

          {error && (
            <p className="field__error" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            block
            disabled={!name.trim()}
            loading={submitting}
            loadingText="Création…"
          >
            Créer mon espace
          </Button>
        </form>
      </div>

      <ol className="onboarding__steps">
        {STEPS.map((step, index) => (
          <li key={step.title} className="onboarding__step">
            <span className="onboarding__step-number" data-current={index === 0}>
              {index + 1}
            </span>
            <span>
              <strong className="onboarding__step-title">{step.title}</strong>
              <span className="onboarding__step-text">{step.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
