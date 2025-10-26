import api from './api';
import type { Post, CreatePostInput, UpdatePostInput } from '../types/post';

export async function listPosts(params?: { public?: boolean }): Promise<Post[]> {
  const res = await api.get('/posts', { params });
  return res.data;
}

export async function getPostById(id: string): Promise<Post> {
  const res = await api.get(`/posts/${id}`);
  return res.data;
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const res = await api.get(`/posts/slug/${slug}`);
  return res.data;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const res = await api.post('/posts', input);
  return res.data;
}

export async function updatePost(id: string, input: UpdatePostInput): Promise<Post> {
  const res = await api.patch(`/posts/${id}`, input);
  return res.data;
}

export async function deletePost(id: string): Promise<void> {
  await api.delete(`/posts/${id}`);
}

