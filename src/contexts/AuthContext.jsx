import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setUnauthorizedHandler } from '../services/api.js';

export const AuthContext = createContext({
  status: 'loading', user: null, login: async () => undefined, register: async () => undefined, logout: async () => undefined, setUser: () => undefined,
});

/** status: 'loading' (cek sesi) | 'authed' | 'guest' */
export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null });

  useEffect(() => {
    let cancelled = false;
    api.me()
      .then((user) => !cancelled && setState({ status: 'authed', user }))
      .catch(() => !cancelled && setState({ status: 'guest', user: null }));
    setUnauthorizedHandler(() => setState({ status: 'guest', user: null }));
    return () => {
      cancelled = true;
      setUnauthorizedHandler(null);
    };
  }, []);

  const login = useCallback(async (body) => {
    const user = await api.login(body);
    setState({ status: 'authed', user });
    return user;
  }, []);
  const register = useCallback(async (body) => {
    const user = await api.register(body);
    setState({ status: 'authed', user });
    return user;
  }, []);
  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setState({ status: 'guest', user: null });
    }
  }, []);
  const setUser = useCallback((user) => setState((s) => ({ ...s, user })), []);

  const value = useMemo(() => ({ ...state, login, register, logout, setUser }), [state, login, register, logout, setUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
