/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Nutrition {
  protein: string;
  fat: string;
  carbs: string;
}

export interface Variation {
  title: string;
  description: string;
  icon?: string;
}

export interface Ingredient {
  name: string;
  detail: string;
  role: string;
}

export interface Instruction {
  title: string;
  text: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  detail: string;
  checked: boolean;
  recipeTitle?: string;
}

export interface Comment {
  id: string;
  name: string;
  time: string;
  timestamp: number;
  text: string;
  avatar?: string;
  initial?: string;
  helpfulCount: number;
  repliesCount: number;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  prepTime: string;
  cookTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  calories: string;
  category: "Appetizer" | "Main Course" | "Dessert" | "Drink";
  region: string;
  spicy?: boolean;
  description: string;
  servings: string;
  nutrition?: Nutrition;
  youtubeUrl?: string;
  videoUrl?: string;
  variations?: Variation[];
  ingredients: Ingredient[];
  instructions: Instruction[];
  comments?: Comment[];
  rating?: number;
  ratingCount?: number;
  authorId?: string;
  authorName?: string;
  isDefault?: boolean;
}

export interface Profile {
  id: string;
  display_name: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
}

/**
 * Helper to map a Supabase DB row into a Recipe object.
 * Column names from PostgreSQL use snake_case; our frontend uses camelCase.
 */
export function mapDbRowToRecipe(row: any): Recipe {
  return {
    id: row.id,
    title: row.title,
    image: row.image || '',
    prepTime: row.prep_time || '',
    cookTime: row.cook_time || '',
    difficulty: row.difficulty || 'Easy',
    calories: row.calories || '',
    category: row.category || 'Main Course',
    region: row.region || '',
    spicy: row.spicy || false,
    description: row.description || '',
    servings: row.servings || '',
    nutrition: row.nutrition || undefined,
    youtubeUrl: row.youtube_url || undefined,
    videoUrl: row.video_url || undefined,
    variations: row.variations || undefined,
    ingredients: row.ingredients || [],
    instructions: row.instructions || [],
    rating: row.rating || 0,
    ratingCount: row.rating_count || 0,
    authorId: row.author_id || undefined,
    authorName: row.author_name || 'Nusa Culinary',
    isDefault: row.is_default || false,
  };
}

/**
 * Helper to map a Supabase DB comment row into a Comment object.
 */
export function mapDbRowToComment(row: any): Comment {
  const createdAt = new Date(row.created_at);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let timeStr = 'Just now';
  if (diffDays > 0) timeStr = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  else if (diffHours > 0) timeStr = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  else if (diffMins > 0) timeStr = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

  return {
    id: row.id,
    name: row.author_name,
    time: timeStr,
    timestamp: createdAt.getTime(),
    text: row.text,
    avatar: row.author_avatar || undefined,
    initial: row.author_name?.charAt(0) || 'U',
    helpfulCount: row.helpful_count || 0,
    repliesCount: row.replies_count || 0,
  };
}
