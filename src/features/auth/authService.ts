import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  type AuthError,
  type UserCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import { firebaseAuth, firestore } from '../../shared/services/firebase';
import type { UserProfile } from '../../domain/models/UserProfile';

function isAuthError(e: unknown): e is AuthError {
  return typeof e === 'object' && e !== null && 'code' in e && typeof (e as AuthError).code === 'string';
}

function getAuthErrorMessage(e: unknown): string {
  if (!isAuthError(e)) return 'Something went wrong. Please try again.';
  switch (e.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled for this app.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return e.message ?? 'Something went wrong. Please try again.';
  }
}

export function getAuthErrorDisplayMessage(e: unknown): string {
  return getAuthErrorMessage(e);
}

export async function loginWithEmail(email: string, password: string): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
  } catch (e) {
    throw new Error(getAuthErrorMessage(e));
  }
}

export async function registerWithEmail(
  params: Pick<UserProfile, 'fullName' | 'rank' | 'yearsOfExperience' | 'vesselTypes'> & { email: string; password: string },
) {
  let cred: UserCredential;
  try {
    cred = await createUserWithEmailAndPassword(firebaseAuth, params.email.trim(), params.password);
  } catch (e) {
    throw new Error(getAuthErrorMessage(e));
  }

  const now = Date.now();
  const profile: Omit<UserProfile, 'id'> = {
    email: params.email.trim(),
    fullName: params.fullName.trim(),
    rank: params.rank.trim(),
    yearsOfExperience: params.yearsOfExperience,
    vesselTypes: params.vesselTypes,
    isPremium: false,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(firestore, 'users', cred.user.uid), profile);
  } catch (e) {
    throw new Error('Account created but profile could not be saved. Please try signing in and update your profile.');
  }

  return cred;
}

export async function loginWithGoogleIdToken(idToken: string): Promise<UserCredential> {
  const credential = GoogleAuthProvider.credential(idToken);
  const cred = await signInWithCredential(firebaseAuth, credential);

  // Ensure we always have a user profile document so downstream tabs can read `profile`.
  const uid = cred.user.uid;
  const ref = doc(firestore, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return cred;

  const now = Date.now();
  const displayName = cred.user.displayName ?? '';
  const email = cred.user.email ?? '';

  const profile: Omit<UserProfile, 'id'> = {
    email,
    fullName: displayName || (email.includes('@') ? email.split('@')[0] : ''),
    rank: '',
    yearsOfExperience: 0,
    vesselTypes: [],
    isPremium: false,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(ref, profile);
  return cred;
}

export async function logout() {
  return await signOut(firebaseAuth);
}

export async function updateUserProfile(uid: string, patch: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>) {
  await updateDoc(doc(firestore, 'users', uid), { ...patch, updatedAt: Date.now() });
}

