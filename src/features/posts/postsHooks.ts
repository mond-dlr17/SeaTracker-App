import { useQuery } from '@tanstack/react-query';
import { getPost, listPosts } from './postsService';

export function usePosts() {
  return useQuery({ queryKey: ['posts'], queryFn: listPosts });
}

export function usePost(postId: string) {
  return useQuery({ queryKey: ['posts', postId], queryFn: () => getPost(postId) });
}

