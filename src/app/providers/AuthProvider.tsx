import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { auth } from '../../lib/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  getToken: () => Promise<string>;
  logout: () => Promise<void>;
}

interface CachedToken {
  token: string;
  expiresAtMs: number;
  uid: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_REFRESH_SKEW_MS = 60_000;

function getJwtExpiryMs(token: string): number | null {
  const [, payloadPart] = token.split('.');
  if (!payloadPart) return null;

  try {
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(window.atob(padded)) as { exp?: unknown };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const tokenCacheRef = useRef<CachedToken | null>(null);
  const tokenPromiseRef = useRef<Promise<string> | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      tokenCacheRef.current = null;
      tokenPromiseRef.current = null;
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const getToken = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Пользователь не авторизован');
    }

    const cached = tokenCacheRef.current;
    if (
      cached &&
      cached.uid === currentUser.uid &&
      cached.expiresAtMs - TOKEN_REFRESH_SKEW_MS > Date.now()
    ) {
      return cached.token;
    }

    if (!tokenPromiseRef.current) {
      tokenPromiseRef.current = currentUser.getIdToken().then((token) => {
        tokenCacheRef.current = {
          token,
          uid: currentUser.uid,
          expiresAtMs: getJwtExpiryMs(token) ?? Date.now() + 10 * 60_000,
        };
        return token;
      }).finally(() => {
        tokenPromiseRef.current = null;
      });
    }

    return tokenPromiseRef.current;
  }, []);

  const logout = useCallback(async () => {
    tokenCacheRef.current = null;
    tokenPromiseRef.current = null;
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
