import { api } from '../../shared/services/api';
import type { UserProfile } from '../../domain/models/UserProfile';
import type { Certificate } from '../../domain/models/Certificate';

export type AIAdvisorResponse = {
  suggestions: string;
};

export async function aiAdvisor(params: { profile: UserProfile; certificates: Certificate[] }) {
  const res = await api.post<AIAdvisorResponse>('/aiAdvisor', params);
  return res.data;
}

