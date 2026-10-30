import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import logoUrl from '@/assets/logo.svg';
import './EmptyLocations.css';

export function EmptyLocations({ workspaceName, onCreate }) {
  return (
    <div className="empty-locations">
      <img src={logoUrl} alt="" className="empty-locations__icon" />
      <h3 className="empty-locations__title">
        {workspaceName ? `${workspaceName} est encore vide` : "Aucun emplacement pour l'instant"}
      </h3>
      <p className="empty-locations__text">
        Crée un premier emplacement — une pièce, une étagère, un carton — puis colle son étiquette
        QR.
      </p>
      <Button icon={Plus} onClick={onCreate}>
        Créer le premier emplacement
      </Button>
    </div>
  );
}
