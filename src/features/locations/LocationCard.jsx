import { Link } from 'react-router';
import { ChevronRight, MapPin } from 'lucide-react';
import logoUrl from '@/assets/logo.svg';

const MAX_TAGS = 3;

export default function LocationCard({ location }) {
  const { id, name, description, parentName, childCount, itemCount, previewItems = [] } = location;

  return (
    <Link to={`/locations/${id}`} className="location-card">
      <div className="location-card__top">
        <img src={logoUrl} alt="" className="location-card__box" />
        {childCount > 0 && (
          <span className="location-card__code">
            {childCount} {childCount > 1 ? 'emplacements' : 'emplacement'}
          </span>
        )}
      </div>

      <div className="location-card__info">
        <h3 className="location-card__name">{name}</h3>
        {parentName && (
          <span className="location-card__place">
            <MapPin aria-hidden /> Dans {parentName}
          </span>
        )}
        {description && <p className="location-card__description">{description}</p>}
      </div>

      {previewItems.length > 0 && (
        <ul className="tag-list" aria-label="Quelques objets">
          {previewItems.slice(0, MAX_TAGS).map((item) => (
            <li key={item} className="tag">
              {item}
            </li>
          ))}
        </ul>
      )}

      <div className="location-card__footer">
        <span>{itemCount} objets</span>
        <ChevronRight aria-hidden />
      </div>
    </Link>
  );
}
