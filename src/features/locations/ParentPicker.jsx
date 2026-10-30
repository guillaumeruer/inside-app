import { useId, useState } from 'react';
import { MapPin } from 'lucide-react';
import './ParentPicker.css';

/**
 * Choix de l'emplacement parent (« Rangé dans »).
 * Replié par défaut : affiche le choix courant ; « Changer » déplie l'arbre en boutons radio.
 *
 * - tree  : sortie de buildLocationTree()
 * - value : id du parent choisi, ou null pour la racine de l'espace
 */
export function ParentPicker({ tree, value, onChange, workspaceName }) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const groupName = useId();

  const selected = tree.find((option) => option.id === value);
  const summaryName = selected ? selected.name : `${workspaceName} (à la racine)`;
  const summaryPath = selected
    ? [workspaceName, selected.path].filter(Boolean).join(' › ')
    : 'Directement dans l’espace';

  const options = [
    { id: null, name: `${workspaceName} (à la racine)`, depth: 0 },
    ...tree.map((option) => ({ ...option, depth: option.depth + 1 })),
  ];

  function pick(id) {
    onChange(id);
    setExpanded(false);
  }

  return (
    <div className="parent-picker">
      <span className="field__label" id={`${listId}-label`}>
        Rangé dans
      </span>

      <button
        type="button"
        className="parent-picker__summary"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-describedby={`${listId}-label`}
        onClick={() => setExpanded((e) => !e)}
      >
        <MapPin aria-hidden="true" className="parent-picker__icon" />
        <span className="parent-picker__current">
          <span className="parent-picker__name">{summaryName}</span>
          <span className="parent-picker__path">{summaryPath}</span>
        </span>
        <span className="parent-picker__change">{expanded ? 'Fermer' : 'Changer'}</span>
      </button>

      {expanded && (
        <fieldset id={listId} className="parent-picker__list">
          <legend className="sr-only">Emplacement parent</legend>
          {options.map((option) => (
            <label
              key={option.id ?? 'root'}
              className="parent-picker__option"
              style={{ '--depth': option.depth }}
            >
              <input
                type="radio"
                name={groupName}
                checked={value === option.id}
                onChange={() => pick(option.id)}
              />
              <span>{option.name}</span>
            </label>
          ))}
        </fieldset>
      )}
    </div>
  );
}
