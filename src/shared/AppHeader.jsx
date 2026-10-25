import { Link } from 'react-router';
import { Bell, Search } from 'lucide-react';
import logoUrl from '@/assets/logo.svg';
import AccountMenu from './AccountMenu';

export default function AppHeader({ query = '', onQueryChange }) {
  return (
    <header className="app-header">
      <Link to="/home" className="brand">
        <img src={logoUrl} alt="" />
        <span className="brand__name">tulamiou</span>
      </Link>

      <div role="search" className="search">
        <label htmlFor="search" className="sr-only">
          Rechercher un objet ou un emplacement
        </label>
        <Search className="search__icon" aria-hidden />
        <input
          id="search"
          type="search"
          className="search__input"
          placeholder="Tu l'as mis où ? Cherche un objet…"
          value={query}
          onChange={(e) => onQueryChange?.(e.target.value)}
        />
      </div>

      <div className="app-header__actions">
        <button type="button" className="icon-btn" aria-label="Notifications">
          <Bell aria-hidden />
        </button>
        <AccountMenu />
      </div>
    </header>
  );
}
