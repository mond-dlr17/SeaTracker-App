import type { User } from 'firebase/auth';
import type { UserProfile } from '../../domain/models/UserProfile';

export type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  initializing: boolean;
};

