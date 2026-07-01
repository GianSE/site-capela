import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Busca dados da API por GET, com estado de loading/erro. */
export function useFetch<T>(path: string | null, fallback: T | null = null): State<T> {
  const [state, setState] = useState<State<T>>({
    data: fallback,
    loading: path !== null,
    error: null,
  });

  useEffect(() => {
    if (!path) return;
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));

    api
      .get<T>(path)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err: Error) => {
        if (active)
          setState({ data: fallback, loading: false, error: err.message || 'Erro ao carregar' });
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return state;
}
