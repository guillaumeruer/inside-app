import { useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { Button } from '@/shared/ui/Button';
import { Dialog, DialogFooter } from '@/shared/ui/Dialog';
import { Field } from '@/shared/ui/Field';
import { createWorkspace } from './createWorkspace';
import { KindPicker } from './KindPicker';
import { getWorkspaceKind } from './kinds';

export function NewWorkspaceDialog({ open, onClose, onCreated }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Nouvel espace"
      description="Un autre lieu où tu ranges des affaires."
    >
      <NewWorkspaceForm onCancel={onClose} onCreated={onCreated} />
    </Dialog>
  );
}

function NewWorkspaceForm({ onCancel, onCreated }) {
  const { user } = useAuth();
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
    <form className="dialog__form" onSubmit={handleSubmit}>
      <KindPicker name="new-workspace-kind" value={kind} onChange={handleKindChange} />

      <Field
        label="Son nom"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setNameEdited(true);
        }}
        autoComplete="off"
        required
      />

      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={!name.trim()} loading={submitting} loadingText="Création…">
          Créer l’espace
        </Button>
      </DialogFooter>
    </form>
  );
}
