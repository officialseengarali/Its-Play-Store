export interface Category {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
}

export interface App {
  id: string;
  name: string;
  developer: string;
  category_id: string | null;
  description: string | null;
  icon_url: string | null;
  apk_url: string | null;
  version: string | null;
  size: string | null;
  rating: number;
  downloads: number;
  is_featured: boolean;
  created_at: string;
  categories?: Category | null;
}

export interface Screenshot {
  id: string;
  app_id: string;
  image_url: string | null;
  order: number | null;
  created_at: string;
}

export interface Review {
  id: string;
  app_id: string;
  user_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  users?: { username: string | null; avatar_url: string | null } | null;
}

export interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}
