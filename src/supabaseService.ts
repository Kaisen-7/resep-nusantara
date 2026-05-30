/**
 * Supabase Service Layer
 * Semua fungsi CRUD untuk berkomunikasi dengan Supabase PostgreSQL.
 */

import { supabase } from './supabase';
import { Recipe, Comment, ShoppingItem, Profile, mapDbRowToRecipe, mapDbRowToComment } from './types';

// ============================
// RECIPES
// ============================

export async function fetchRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }

  return (data || []).map(mapDbRowToRecipe);
}

export async function fetchRecipeById(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }

  return data ? mapDbRowToRecipe(data) : null;
}

export async function createRecipe(recipe: Omit<Recipe, 'id'>, userId: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .insert({
      title: recipe.title,
      description: recipe.description,
      image: recipe.image,
      prep_time: recipe.prepTime,
      cook_time: recipe.cookTime,
      difficulty: recipe.difficulty,
      calories: recipe.calories,
      category: recipe.category,
      region: recipe.region,
      spicy: recipe.spicy || false,
      servings: recipe.servings,
      youtube_url: recipe.youtubeUrl || null,
      video_url: recipe.videoUrl || null,
      nutrition: recipe.nutrition || null,
      variations: recipe.variations || null,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      author_id: userId,
      author_name: recipe.authorName || 'Anonymous Chef',
      is_default: false,
      rating: 0,
      rating_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating recipe:', error);
    return null;
  }

  return data ? mapDbRowToRecipe(data) : null;
}

export async function updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe | null> {
  const dbUpdates: any = {};

  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.image !== undefined) dbUpdates.image = updates.image;
  if (updates.prepTime !== undefined) dbUpdates.prep_time = updates.prepTime;
  if (updates.cookTime !== undefined) dbUpdates.cook_time = updates.cookTime;
  if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty;
  if (updates.calories !== undefined) dbUpdates.calories = updates.calories;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.region !== undefined) dbUpdates.region = updates.region;
  if (updates.spicy !== undefined) dbUpdates.spicy = updates.spicy;
  if (updates.servings !== undefined) dbUpdates.servings = updates.servings;
  if (updates.youtubeUrl !== undefined) dbUpdates.youtube_url = updates.youtubeUrl;
  if (updates.videoUrl !== undefined) dbUpdates.video_url = updates.videoUrl;
  if (updates.nutrition !== undefined) dbUpdates.nutrition = updates.nutrition;
  if (updates.variations !== undefined) dbUpdates.variations = updates.variations;
  if (updates.ingredients !== undefined) dbUpdates.ingredients = updates.ingredients;
  if (updates.instructions !== undefined) dbUpdates.instructions = updates.instructions;
  if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
  if (updates.ratingCount !== undefined) dbUpdates.rating_count = updates.ratingCount;

  const { data, error } = await supabase
    .from('recipes')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating recipe:', error);
    return null;
  }

  return data ? mapDbRowToRecipe(data) : null;
}

export async function deleteRecipe(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting recipe:', error);
    return false;
  }

  return true;
}

// ============================
// COMMENTS
// ============================

export async function fetchComments(recipeId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  return (data || []).map(mapDbRowToComment);
}

export async function createComment(
  recipeId: string,
  authorId: string,
  authorName: string,
  text: string,
  authorAvatar?: string
): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      recipe_id: recipeId,
      author_id: authorId,
      author_name: authorName,
      author_avatar: authorAvatar || null,
      text,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    return null;
  }

  return data ? mapDbRowToComment(data) : null;
}

export async function deleteComment(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting comment:', error);
    return false;
  }

  return true;
}

// ============================
// SAVED RECIPES (Bookmarks)
// ============================

export async function fetchSavedRecipeIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('saved_recipes')
    .select('recipe_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching saved recipe IDs:', error);
    return [];
  }

  return (data || []).map((row: any) => row.recipe_id);
}

export async function saveRecipe(userId: string, recipeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('saved_recipes')
    .insert({ user_id: userId, recipe_id: recipeId });

  if (error) {
    // Might be a duplicate, ignore UNIQUE constraint violations
    if (error.code === '23505') return true;
    console.error('Error saving recipe:', error);
    return false;
  }

  return true;
}

export async function unsaveRecipe(userId: string, recipeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('saved_recipes')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId);

  if (error) {
    console.error('Error unsaving recipe:', error);
    return false;
  }

  return true;
}

// ============================
// SHOPPING LIST
// ============================

export async function fetchShoppingItems(userId: string): Promise<ShoppingItem[]> {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching shopping items:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    detail: row.detail || '',
    checked: row.checked || false,
    recipeTitle: row.recipe_title || undefined,
  }));
}

export async function addShoppingItem(
  userId: string,
  name: string,
  detail: string,
  recipeTitle?: string
): Promise<ShoppingItem | null> {
  const { data, error } = await supabase
    .from('shopping_items')
    .insert({
      user_id: userId,
      name,
      detail,
      recipe_title: recipeTitle || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding shopping item:', error);
    return null;
  }

  return data ? {
    id: data.id,
    name: data.name,
    detail: data.detail || '',
    checked: data.checked || false,
    recipeTitle: data.recipe_title || undefined,
  } : null;
}

export async function updateShoppingItem(id: string, updates: { checked?: boolean; name?: string; detail?: string }): Promise<boolean> {
  const { error } = await supabase
    .from('shopping_items')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating shopping item:', error);
    return false;
  }

  return true;
}

export async function deleteShoppingItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting shopping item:', error);
    return false;
  }

  return true;
}

export async function clearCheckedItems(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('user_id', userId)
    .eq('checked', true);

  if (error) {
    console.error('Error clearing checked items:', error);
    return false;
  }

  return true;
}

// ============================
// PROFILES
// ============================

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // Profile might not exist yet, not an error
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as Profile;
}

export async function upsertProfile(profile: Profile): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: profile.id,
      display_name: profile.display_name,
      email: profile.email,
      avatar_url: profile.avatar_url || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting profile:', error);
    return null;
  }

  return data as Profile;
}

// ============================
// STORAGE (Recipe Images)
// ============================

export async function uploadRecipeImage(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `recipes/${fileName}`;

  const { error } = await supabase.storage
    .from('recipe-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  return getPublicImageUrl(filePath);
}

export function getPublicImageUrl(path: string): string {
  const { data } = supabase.storage
    .from('recipe-images')
    .getPublicUrl(path);

  return data.publicUrl;
}
