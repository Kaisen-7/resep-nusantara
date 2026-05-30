/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { X, ChefHat, Timer, Gauge, Globe, Play, Sparkles, Upload, Youtube } from "lucide-react";
import { Recipe } from "./types";
import { useAuth } from "./contexts/AuthContext";
import { useLanguage } from "./contexts/LanguageContext";
import * as api from "./supabaseService";

interface AddRecipeModalProps {
  onClose: () => void;
  onAdd: (recipe: Recipe) => void;
  recipe?: Recipe;
  darkMode?: boolean;
}

export default function AddRecipeModal({ onClose, onAdd, recipe, darkMode = false }: AddRecipeModalProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [title, setTitle] = useState(recipe?.title || "");
  const [description, setDescription] = useState(recipe?.description || "");
  const [prepTime, setPrepTime] = useState(recipe?.prepTime || "");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(recipe?.difficulty || "Easy");
  const [category, setCategory] = useState<"Appetizer" | "Main Course" | "Dessert" | "Drink">(recipe?.category || "Main Course");
  const [region, setRegion] = useState(recipe?.region || "");
  const [videoUrl, setVideoUrl] = useState(recipe?.videoUrl || "");
  const [ingredients, setIngredients] = useState(
    recipe?.ingredients.map(i => ({ name: i.name, detail: i.detail })) || [{ name: "", detail: "" }]
  );
  const [instructions, setInstructions] = useState(
    recipe?.instructions.map(i => ({ text: i.text })) || [{ text: "" }]
  );

  const [imageUrl, setImageUrl] = useState(recipe?.image || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState(recipe?.youtubeUrl || "");
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const publicUrl = await api.uploadRecipeImage(file);
      if (publicUrl) {
        setImageUrl(publicUrl);
      } else {
        alert("Failed to upload image. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("An error occurred during image upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateImage = () => {
    if (!title) return;
    setIsGenerating(true);
    
    // Create an incredibly evocative culinary prompt based on title, category and region
    const promptDef = `Professional close-up food photography of Indonesian ${title}, a traditional ${category} ${region ? `from ${region}` : ""}. Beautiful culinary plating, fine dining setting, appetizing texture, vibrant warm lighting, bokeh, 4k`;
    
    const randomSeed = Math.floor(Math.random() * 1000000);
    const generatedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptDef)}?width=800&height=450&nologo=true&seed=${randomSeed}`;
    
    // Preload image
    const img = new Image();
    img.src = generatedUrl;
    img.onload = () => {
      setImageUrl(generatedUrl);
      setIsGenerating(false);
    };
    img.onerror = () => {
      setImageUrl(generatedUrl); // fallback
      setIsGenerating(false);
    };
  };

  const addIngredient = () => setIngredients([...ingredients, { name: "", detail: "" }]);
  const addInstruction = () => setInstructions([...instructions, { text: "" }]);

  const updateIngredient = (index: number, field: "name" | "detail", value: string) => {
    const newIngs = [...ingredients];
    newIngs[index][field] = value;
    setIngredients(newIngs);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInst = [...instructions];
    newInst[index].text = value;
    setInstructions(newInst);
  };

  const handleSubmit = () => {
    if (!title || ingredients.some(i => !i.name) || instructions.some(i => !i.text)) return;
    
    const newRecipe: Recipe = {
      id: recipe?.id || '', // PostgreSQL will ignore if generating, but useful for updates
      title,
      image: imageUrl || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop",
      prepTime: prepTime || "20 Mins",
      cookTime: recipe?.cookTime || "15 Mins",
      difficulty,
      calories: recipe?.calories || "350 kcal",
      category,
      region: region || "General",
      videoUrl: videoUrl || undefined,
      youtubeUrl: youtubeUrl || undefined,
      description: description || "A newly added community recipe.",
      servings: recipe?.servings || "2 Servings",
      ingredients: ingredients.map(i => ({ ...i, role: "Required" })),
      instructions: instructions.map((i, idx) => ({ title: `Step ${idx + 1}`, text: i.text })),
      authorName: recipe?.authorName || user?.user_metadata?.full_name || 'Anonymous Chef',
      authorId: recipe?.authorId || user?.id,
    };

    onAdd(newRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden mt-auto md:mt-0 bg-surface-container-lowest border border-outline-variant/10 flex flex-col max-h-[90vh] md:max-h-[85vh]"
      >
        <div className="p-6 md:p-8 border-b flex justify-between items-center border-outline-variant/10 bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-on-surface">{recipe ? t("Edit Recipe") : t("Share Your Recipe")}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                {recipe ? t("Update your culinary creation") : t("Contribute to the archipelago")}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full transition-colors hover:bg-surface-container-high"
          >
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Recipe Meta Info */}
              <div className="space-y-4">
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("Recipe Title (e.g. Soto Ayam)")}
                  className="w-full h-14 px-5 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 outline-none font-bold text-on-surface bg-surface-container placeholder:text-on-surface-variant text-sm" 
                />
                
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("Description...")}
                  rows={3}
                  className="w-full p-5 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 outline-none font-medium text-on-surface bg-surface-container placeholder:text-on-surface-variant text-xs resize-none" 
                />

                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Timer className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input 
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      placeholder={t("Prep (e.g. 15 Mins)")}
                      className="w-full h-11 pl-11 pr-4 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none font-medium bg-surface-container text-on-surface text-xs" 
                    />
                  </div>
                  
                  <div className="flex-1 relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input 
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder={t("Region (e.g. Jakarta)")}
                      className="w-full h-11 pl-11 pr-4 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none font-medium bg-surface-container text-on-surface text-xs" 
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <select 
                      value={difficulty}
                      onChange={(e: any) => setDifficulty(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none font-semibold bg-surface-container text-on-surface text-xs appearance-none"
                    >
                      <option value="Easy">{t("Easy")}</option>
                      <option value="Medium">{t("Medium")}</option>
                      <option value="Hard">{t("Hard")}</option>
                    </select>
                  </div>

                  <div className="flex-1 relative">
                    <ChefHat className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <select 
                      value={category}
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none font-semibold bg-surface-container text-on-surface text-xs appearance-none"
                    >
                      <option value="Appetizer">{t("Appetizer")}</option>
                      <option value="Main Course">{t("Main Course")}</option>
                      <option value="Dessert">{t("Dessert")}</option>
                      <option value="Drink">{t("Drink")}</option>
                    </select>
                  </div>
                </div>

                {/* Multimedia Section */}
                <div className="p-4 rounded-2xl bg-surface-container/50 border border-outline-variant/5 space-y-3">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-outline text-left">{t("Multimedia (Optional)")}</h4>
                  
                  <div className="relative">
                    <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input 
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder={t("YouTube Link (e.g., https://youtube.com/watch?...)")}
                      className="w-full h-11 pl-11 pr-4 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none font-medium bg-surface-container text-on-surface text-xs placeholder:text-on-surface-variant/70 text-left" 
                    />
                  </div>

                  <div className="relative">
                    <Play className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                    <input 
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder={t("Direct Video Link (e.g., .mp4 URL)")}
                      className="w-full h-11 pl-11 pr-4 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none font-medium bg-surface-container text-on-surface text-xs placeholder:text-on-surface-variant/70 text-left" 
                    />
                  </div>
                </div>
              </div>

              {/* Culinary Image Generation or Upload */}
              <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/10 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-outline">{t("Recipe Photo")}</h4>
                  <div className="flex gap-3">
                    {/* Local File Upload Button */}
                    <label className="text-[10px] font-black text-primary hover:underline uppercase flex items-center gap-1 cursor-pointer">
                      <Upload className="w-3 h-3" />
                      {t("Upload Photo")}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden" 
                      />
                    </label>

                    {/* AI Image Gen Button */}
                    <button 
                      onClick={handleGenerateImage}
                      disabled={isGenerating || isUploading || !title}
                      className="text-[10px] font-black text-primary hover:underline uppercase flex items-center gap-1 disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      {imageUrl ? t("Regenerate AI") : t("Generate with AI")}
                    </button>
                  </div>
                </div>

                {/* Paste Image URL Input */}
                <div className="relative">
                  <input 
                    type="text" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder={t("Or paste image URL (e.g., https://...)")}
                    className="w-full h-10 px-4 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none font-medium bg-surface-container text-on-surface text-xs placeholder:text-on-surface-variant/70 text-left" 
                  />
                </div>

                {isGenerating || isUploading ? (
                  <div className="h-40 rounded-xl bg-surface-container-high flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                      {isUploading ? t("Uploading Photo...") : t("Cooking AI Image...")}
                    </span>
                  </div>
                ) : imageUrl ? (
                  <div className="relative h-40 rounded-xl overflow-hidden shadow-inner group">
                    <img src={imageUrl} alt="Recipe preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setImageUrl("")}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="h-40 rounded-xl bg-surface-container-high border-2 border-dashed border-outline-variant/20 flex flex-col items-center justify-center p-6 text-center">
                    <ChefHat className="w-8 h-8 text-outline mb-2 opacity-50" />
                    <p className="text-[10px] font-bold text-outline-variant uppercase tracking-widest">{t("No Photo Added")}</p>
                    <p className="text-[9px] text-outline-variant mt-1">{t("Upload a photo or enter a title to generate custom food art!")}</p>
                  </div>
                )}
              </div>

              {/* Ingredients */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("Ingredients")}</h4>
                  <button onClick={addIngredient} className="text-[10px] font-bold text-primary hover:underline">{t("ADD ITEM")}</button>
                </div>
                <div className="space-y-3">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        value={ing.name}
                        onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                        placeholder={t("Item (e.g. Garlic)")}
                        className="flex-1 h-11 px-4 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none font-medium bg-surface-container text-on-surface text-xs" 
                      />
                      <input 
                        value={ing.detail}
                        onChange={(e) => updateIngredient(idx, "detail", e.target.value)}
                        placeholder={t("Amount")}
                        className="w-24 h-11 px-4 rounded-xl border-none focus:ring-2 focus:ring-primary/20 outline-none font-medium bg-surface-container text-on-surface text-xs" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Instructions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("Cooking Steps")}</h4>
                  <button onClick={addInstruction} className="text-[10px] font-bold text-primary hover:underline">{t("ADD STEP")}</button>
                </div>
                <div className="space-y-4">
                  {instructions.map((inst, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-2 -top-2 w-5 h-5 bg-primary text-on-primary text-[10px] font-black flex items-center justify-center rounded-full shadow-sm z-10">{idx + 1}</span>
                      <textarea 
                        value={inst.text}
                        onChange={(e) => updateInstruction(idx, e.target.value)}
                        placeholder={t("Describe the process...")}
                        rows={3}
                        className="w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 outline-none font-medium bg-surface-container text-on-surface text-xs resize-none" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-outline-variant/10 bg-surface-container-low">
          <button 
            onClick={handleSubmit}
            className="w-full py-4 bg-primary text-on-primary rounded-2xl font-black shadow-lg shadow-primary/20 transition-all active:scale-95 px-6"
          >
            {recipe ? t("Save Changes") : t("Submit Recipe")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
