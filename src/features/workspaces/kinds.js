import { Briefcase, House, Package, Warehouse } from 'lucide-react';

export const WORKSPACE_KINDS = [
  { value: 'home', label: 'Maison', defaultName: 'Maison', icon: House },
  { value: 'storage', label: 'Garde-meuble', defaultName: 'Garde-meuble', icon: Warehouse },
  { value: 'office', label: 'Bureau', defaultName: 'Bureau', icon: Briefcase },
  { value: 'other', label: 'Autre', defaultName: '', icon: Package },
];

export function getWorkspaceKind(value) {
  return WORKSPACE_KINDS.find((kind) => kind.value === value) ?? WORKSPACE_KINDS[0];
}
