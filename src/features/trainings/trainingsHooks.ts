import { useQuery } from '@tanstack/react-query';
import { listTrainings } from '@/features/trainings/trainingsService';

export function useTrainings(courseType?: string) {
  return useQuery({
    queryKey: ['trainings', courseType ?? 'all'],
    queryFn: () => listTrainings(courseType),
  });
}
