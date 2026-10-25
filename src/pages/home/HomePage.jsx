import { useEffect, useState } from 'react';
import { Plus, ScanLine } from 'lucide-react';
import AppHeader from '@/shared/AppHeader';
import WorkspaceCard, { NewWorkspaceCard } from '@/features/workspaces/WorkspaceCard';
import LocationCard from '@/features/locations/LocationCard';
import ActivityTimeline from '@/features/activity/ActivityTimeline';
import '@/styles/home.css';
import { useAuth } from '@/features/auth/useAuth';
import { useHomeData } from './useHomeData';

const ACTIVITIES = [
  {
    id: 'a1',
    text: 'Perceuse ajoutée dans #009 Outils · Maison',
    createdAt: new Date(Date.now() - 2 * 3600e3).toISOString(),
  },
  {
    id: 'a2',
    text: '#012 Vaisselle de fête scanné · Garde-meuble',
    createdAt: new Date(Date.now() - 26 * 3600e3).toISOString(),
  },
];

export function Home() {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.first_name ?? '';

  const [query, setQuery] = useState('');

  const { status, workspaces, locations, reload } = useHomeData();
  const [selectedId, setSelectedId] = useState(() => localStorage.getItem('tulamiou:workspace'));
  const activeId = workspaces.some((w) => w.id === selectedId) ? selectedId : workspaces[0]?.id;

  const current = workspaces.find((w) => w.id === activeId);
  const visibleLocations = locations.filter(
    (l) => l.workspaceId === activeId && l.parentId === null,
  );

  const select = (id) => {
    setSelectedId(id);
    localStorage.setItem('tulamiou:workspace', id);
  };

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') reload();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [reload]);

  return (
    <div className="app">
      <AppHeader query={query} onQueryChange={setQuery} />

      <main className="home">
        {status === 'loading' && <p>Chargement...</p>}

        {status === 'error' && (
          <div className="home__error" role="alert">
            <p className="field__error">Impossible de charger tes données.</p>
            <button type="button" className="btn btn--outline btn--auto" onClick={reload}>
              Réessayer
            </button>
          </div>
        )}
        {status === 'success' && (
          <>
            <section className="home__hero">
              <div>
                <h1 className="home__title">Bonjour{firstName && ` ${firstName}`}</h1>
                <p className="home__subtitle">Tout est rangé. Enfin, presque.</p>
              </div>
              <div className="home__actions">
                <button type="button" className="btn btn--outline btn--auto">
                  <Plus aria-hidden /> Nouvel emplacement
                </button>
                <button type="button" className="btn btn--primary btn--auto">
                  <ScanLine aria-hidden /> Scanner un QR code
                </button>
              </div>
            </section>

            <section aria-labelledby="ws-title" className="home__section">
              <h2 id="ws-title" className="section-title">
                Mes espaces
              </h2>
              <div className="workspace-grid" role="group" aria-label="Choisir un espace">
                {workspaces.map((w) => (
                  <WorkspaceCard
                    key={w.id}
                    workspace={w}
                    selected={w.id === activeId}
                    onSelect={select}
                  />
                ))}
                <NewWorkspaceCard onClick={() => {}} />
              </div>
            </section>

            <div className="home__columns">
              <section aria-labelledby="loc-title" className="home__section home__main">
                <div className="section-head">
                  <div>
                    <nav aria-label="Fil d'Ariane" className="breadcrumb">
                      Espaces <span aria-hidden>›</span> {current?.name}
                    </nav>
                    <h2 id="loc-title" className="section-title">
                      Emplacements
                    </h2>
                  </div>
                </div>
                <div className="location-grid">
                  {visibleLocations.map((l) => (
                    <LocationCard key={l.id} location={l} />
                  ))}
                </div>
              </section>

              <ActivityTimeline activities={ACTIVITIES} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
