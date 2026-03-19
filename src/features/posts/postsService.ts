import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { firestore } from '../../shared/services/firebase';

export type Post = {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  createdAt?: number;
};

export async function listPosts(): Promise<Post[]> {
  const q = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Post, 'id'>) }));
}

export async function getPost(postId: string): Promise<Post | null> {
  const snap = await getDoc(doc(firestore, 'posts', postId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Post, 'id'>) };
}

