import { useQuery } from '@tanstack/react-query';
import { listTrainings } from './trainingsService';

export function useTrainings(courseType?: string) {
  return useQuery({
    queryKey: ['trainings', courseType ?? 'all'],
    queryFn: () => listTrainings(courseType),
  });
}

