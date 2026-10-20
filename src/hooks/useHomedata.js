import { useCallback, useEffect, useState } from 'react';
import { fetchHomeData } from '../api/home';

export function useHomeData() {
    const [state, setState] = useState({ status: 'loading', workspaces: [], locations: [], error: null });
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let ignore = false;
        fetchHomeData()
            .then((data) => !ignore && setState({ status: 'success', ...data, error: null }))
            .catch((error) => !ignore && setState((s) => ({ ...s, status: 'error', error })));
        return () => { ignore = true; };
    }, [version]);

    const reload = useCallback(() => {
        setState((s) => (s.status === "error" ? { ...s, status: "loading" } : s));
        setVersion((v) => v + 1);
    }, []);
    return { ...state, reload };
}