import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from '@firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Env } from './env';

const firebaseConfig = {
  apiKey: Env.firebase.apiKey,
  authDomain: Env.firebase.authDomain,
  projectId: Env.firebase.projectId,
  storageBucket: Env.firebase.storageBucket,
  messagingSenderId: Env.firebase.messagingSenderId,
  appId: Env.firebase.appId,
};

function getApp(): { app: ReturnType<typeof initializeApp>; isNew: boolean } {
  const existing = getApps();
  if (existing.length) return { app: existing[0]!, isNew: false };
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      'Firebase config missing. Set EXPO_PUBLIC_FIREBASE_API_KEY and EXPO_PUBLIC_FIREBASE_PROJECT_ID in .env (see .env.example).'
    );
  }
  return { app: initializeApp(firebaseConfig), isNew: true };
}

const { app, isNew } = getApp();

// Persist auth in AsyncStorage so session survives app restarts; use getAuth when app already exists (e.g. hot reload)
const persistence = getReactNativePersistence(AsyncStorage);
export const firebaseAuth = isNew ? initializeAuth(app, { persistence }) : getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

