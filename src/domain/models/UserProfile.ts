export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  rank: string;
  yearsOfExperience: number;
  vesselTypes: string[];
  isPremium: boolean;
  createdAt: number;
  updatedAt: number;
  expoPushToken?: string;
};

