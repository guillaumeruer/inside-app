import { WORKSPACE_KINDS } from './kinds';
import './KindPicker.css';

/**
 * Choix du type d'espace : vrais boutons radio stylés en cartes
 * (navigation aux flèches et annonce « 1 sur 4 » fournies par le navigateur).
 */
export function KindPicker({ value, onChange, legend = 'C’est quoi ?', name = 'workspace-kind' }) {
  return (
    <fieldset className="kind-picker">
      <legend className="kind-picker__legend">{legend}</legend>
      <div className="kind-picker__options">
        {WORKSPACE_KINDS.map(({ value: kind, label, icon: Icon }) => (
          <label key={kind} className="kind-picker__option">
            <input
              type="radio"
              name={name}
              value={kind}
              checked={value === kind}
              onChange={() => onChange(kind)}
              className="kind-picker__input"
            />
            <Icon aria-hidden="true" className="kind-picker__icon" />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
