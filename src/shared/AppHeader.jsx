import { Bell, Search } from 'lucide-react';
import AccountMenu from './AccountMenu';
import Logo from '@/shared/Logo';
import './AppHeader.css';

export default function AppHeader({ query = '', onQueryChange }) {
  return (
    <header className="app-header">
      <Logo />
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
