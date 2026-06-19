import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { auth } from '../../lib/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  getToken: () => Promise<string>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const getToken = useCallback(async () => {
    if (!auth.currentUser) {
      throw new Error('Пользователь не авторизован');
    }
    return auth.currentUser.getIdToken();
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({ user, loading, getToken, logout }),
    [user, loading, getToken, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
