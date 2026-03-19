import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

import type { UserProfile } from '../../domain/models/UserProfile';
import { firebaseAuth, firestore } from '../../shared/services/firebase';

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  initializing: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const ref = doc(firestore, 'users', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setProfile(null);
        return;
      }
      const data = snap.data() as Omit<UserProfile, 'id'>;
      setProfile({ id: snap.id, ...data });
    });
    return unsub;
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({ user, profile, initializing }), [user, profile, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

