/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Clock, Bookmark, Soup, Star, ChefHat } from "lucide-react";
import { Recipe } from "./types";
import { useLanguage } from "./contexts/LanguageContext";

interface SavedRecipesViewProps {
  onRecipeClick: (recipe: Recipe) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onExplore: () => void;
  recipes?: Recipe[];
}

export default function SavedRecipesView({ 
  onRecipeClick, 
  savedIds, 
  onToggleSave, 
  onExplore,
  recipes = []
}: SavedRecipesViewProps) {
  const { t } = useLanguage();
  const savedRecipes = recipes.filter(r => savedIds.includes(r.id));

  // Difficulty badge color
  const getDiffClass = (diff: string) => {
    if (diff === "Easy") return "diff-easy";
    if (diff === "Medium") return "diff-medium";
    return "diff-hard";
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <header className="mb-10 pt-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">{t("Saved Recipes")}</h2>
        <p className="text-on-surface-variant font-medium">{t("Your personal collection of Indonesian flavors.")}</p>
      </header>

      {savedRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedRecipes.map((recipe) => (
            <motion.article 
              key={recipe.id}
              layout
              layoutId={`recipe-saved-${recipe.id}`}
              onClick={() => onRecipeClick(recipe)}
              className="group cursor-pointer bg-surface-container-lowest rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_rgba(148,74,0,0.1)] flex flex-col h-full"
            >
              <div className="relative overflow-hidden h-60 w-full">
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                
                <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                  <span className="bg-primary text-on-primary px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    {t(recipe.category)}
                  </span>
                  <span className="bg-white/90 backdrop-blur-md text-on-surface px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    {recipe.region}
                  </span>
                  {recipe.spicy && (
                    <span className="bg-red-500/90 text-white px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                      🌶️
                    </span>
                  )}
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(recipe.id);
                  }}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-xl w-10 h-10 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
                  aria-label="Remove from saved"
                >
                  <Bookmark className="w-5 h-5 fill-white" />
                </button>

                {/* Rating badge */}
                {recipe.rating && recipe.rating > 0 && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold">{recipe.rating}</span>
                    <span className="text-[10px] opacity-70">({recipe.ratingCount || 124})</span>
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col justify-between grow space-y-3">
                <div>
                  <h4 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors mb-2">
                    {recipe.title}
                  </h4>
                  {recipe.authorName && (
                    <p className="text-xs font-medium text-outline flex items-center gap-1.5 mb-3">
                      <ChefHat className="w-3 h-3" />
                      {recipe.authorName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-on-surface-variant text-sm pt-1 flex-wrap mt-auto">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{recipe.cookTime}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getDiffClass(recipe.difficulty)}`}>
                    {t(recipe.difficulty)}
                  </span>
                  {recipe.calories && (
                    <span className="text-xs font-medium text-outline">
                      {recipe.calories}
                    </span>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        <section className="mt-12 py-16 flex flex-col items-center text-center bg-surface-container-low rounded-xl border-dashed border-2 border-outline-variant/30">
          <div className="w-48 h-48 mb-8 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-primary-fixed/20 rounded-full blur-3xl"></div>
            <div className="relative bg-surface-container-lowest p-8 rounded-full shadow-lg">
               <Soup className="w-20 h-20 text-orange-200 stroke-1" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-on-surface mb-3">{t("Your kitchen is quiet")}</h3>
          <p className="text-on-surface-variant max-w-xs mb-10 leading-relaxed">{t("It seems you haven't saved any recipes yet. Start exploring the rich flavors of Indonesia.")}</p>
          <button 
            onClick={onExplore}
            className="bg-linear-to-br from-primary to-primary-container text-on-primary font-bold px-10 py-4 rounded-full transition-all duration-300 hover:shadow-[0_8px_24px_rgba(148,74,0,0.2)] active:scale-95"
          >
            {t("Explore Recipes")}
          </button>
        </section>
      )}
    </motion.div>
  );
}
