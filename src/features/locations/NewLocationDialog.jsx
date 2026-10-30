import { useId, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { Button } from '@/shared/ui/Button';
import { Dialog, DialogFooter } from '@/shared/ui/Dialog';
import { Field } from '@/shared/ui/Field';
import { createLocation } from './createLocation';
import { buildLocationTree } from './locationTree';
import { ParentPicker } from './ParentPicker';

/**
 * - workspace       : { id, name } — l'espace où l'on crée
 * - locations       : tous les emplacements de cet espace ({ id, parentId, name })
 * - defaultParentId : parent pré-sélectionné (null = racine ; l'id courant depuis une fiche emplacement)
 * - onCreated({ location, printLabel })
 */
export function NewLocationDialog({ open, onClose, workspace, locations, defaultParentId = null, onCreated }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Nouvel emplacement"
      description="Un carton, une étagère, un tiroir… tout ce qui peut porter un QR."
    >
      <NewLocationForm
        workspace={workspace}
        locations={locations}
        defaultParentId={defaultParentId}
        onCancel={onClose}
        onCreated={onCreated}
      />
    </Dialog>
  );
}

function NewLocationForm({ workspace, locations, defaultParentId, onCancel, onCreated }) {
  const { user } = useAuth();
  const descriptionId = useId();
  const tree = useMemo(() => buildLocationTree(locations), [locations]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState(defaultParentId);
  const [printLabel, setPrintLabel] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const location = await createLocation({
        workspaceId: workspace.id,
        parentId,
        name,
        description,
        userId: user.id,
      });
      onCreated?.({ location, printLabel });
    } catch (err) {
      setError(err.message ?? 'Impossible de créer l’emplacement.');
      setSubmitting(false);
    }
  }

  return (
    <form className="dialog__form" onSubmit={handleSubmit}>
      <Field
        label="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ex. Carton cuisine 2"
        autoComplete="off"
        data-autofocus
        required
      />

      <div className="field">
        <label htmlFor={descriptionId} className="field__label">
          Description <span className="field__optional">(facultatif)</span>
        </label>
        <textarea
          id={descriptionId}
          className="input input--textarea"
          rows={2}
          placeholder="Où le trouver, comment l’ouvrir…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <ParentPicker
        tree={tree}
        value={parentId}
        onChange={setParentId}
        workspaceName={workspace.name}
      />

      <label className="checkbox">
        <input
          type="checkbox"
          checked={printLabel}
          onChange={(e) => setPrintLabel(e.target.checked)}
        />
        <span>
          <strong>Imprimer l’étiquette QR ensuite</strong>
          <br />
          Tu pourras aussi le faire plus tard depuis la fiche.
        </span>
      </label>

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
          Créer l’emplacement
        </Button>
      </DialogFooter>
    </form>
  );
}
