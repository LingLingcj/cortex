// Basic Post type aligned with backend Prisma schema and DTOs
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  isPublic: boolean;
  isDraft: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name?: string | null;
    avatar?: string | null;
  };
  tags?: { id?: string; name: string }[];
}

export interface CreatePostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  isPublic?: boolean;
  isDraft?: boolean;
  tags?: string[];
}

export type UpdatePostInput = Partial<CreatePostInput>;

