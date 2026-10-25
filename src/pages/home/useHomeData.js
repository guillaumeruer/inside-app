import { useCallback, useEffect, useState } from 'react';
import { fecthLocationSummaries } from '@/features/locations/api';
import { fetchWorkspaceSummaries } from '@/features/workspaces/api';

export function useHomeData() {
  const [status, setStatus] = useState('loading');
  const [workspaces, setWorkspaces] = useState([]);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let ignore = false;

    Promise.all([fetchWorkspaceSummaries(), fecthLocationSummaries()])
      .then(([workspaces, locations]) => {
        if (ignore) {
          return;
        }
        setWorkspaces(workspaces);
        setLocations(locations);
        setError(null);
        setStatus('success');
      })
      .catch((error) => {
        if (ignore) {
          return;
        }
        setError(error);
        setStatus('error');
      });
  }, [version]);

  const reload = useCallback(() => {
    setStatus((current) => (current === 'error' ? 'loading' : current));
    setVersion((v) => v + 1);
  }, []);
  return { status, workspaces, locations, error, reload };
}
