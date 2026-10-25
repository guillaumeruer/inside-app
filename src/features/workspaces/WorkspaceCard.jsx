import { Briefcase, House, Package, Warehouse } from 'lucide-react';

const ICONS = {
  home: House,
  storage: Warehouse,
  office: Briefcase,
  other: Package,
};

export default function WorkspaceCard({ workspace, selected, onSelect }) {
  const Icon = ICONS[workspace.kind] ?? House;
  const { locationCount, itemCount } = workspace;

  return (
    <button
      type="button"
      className="workspace-card"
      aria-pressed={selected}
      onClick={() => onSelect(workspace.id)}
    >
      <span className="workspace-card__icon">
        <Icon aria-hidden />
      </span>
      <span className="workspace-card__body">
        <span className="workspace-card__name">{workspace.name}</span>
        <span className="workspace-card__meta">
          {locationCount} {locationCount > 1 ? 'emplacements' : 'emplacement'} · {itemCount} objets
        </span>
      </span>
    </button>
  );
}

export function NewWorkspaceCard({ onClick }) {
  return (
    <button type="button" className="workspace-card workspace-card--new" onClick={onClick}>
      + Nouvel espace
    </button>
  );
}
