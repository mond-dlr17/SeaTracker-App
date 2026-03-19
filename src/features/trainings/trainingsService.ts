import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { firestore } from '../../shared/services/firebase';

export type Training = {
  id: string;
  title: string;
  provider: string;
  location: string;
  courseType?: string;
};

export async function listTrainings(courseType?: string): Promise<Training[]> {
  const base = collection(firestore, 'trainings');
  const q = courseType ? query(base, where('courseType', '==', courseType), orderBy('title', 'asc')) : query(base);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Training, 'id'>) }));
}

