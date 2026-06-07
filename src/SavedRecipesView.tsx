import { motion } from "motion/react";
import { Clock, Bookmark, Soup, Star, ChefHat, ArrowUpRight, Sparkles } from "lucide-react";
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
      <header className="mb-8 pt-2">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-on-surface mb-2">{t("Saved Recipes")}</h2>
        <p className="text-on-surface-variant font-bold text-xs sm:text-sm">{t("Your personal collection of Indonesian flavors.")}</p>
      </header>

      {savedRecipes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {savedRecipes.map((recipe) => (
            <motion.article 
              key={recipe.id}
              layout
              layoutId={`recipe-saved-${recipe.id}`}
              onClick={() => onRecipeClick(recipe)}
              className="group cursor-pointer bg-surface-container-lowest rounded-4xl overflow-hidden transition-all duration-500 hover:shadow-[0_24px_48px_rgba(140,45,25,0.08)] flex flex-col h-full"
            >
              <div className="relative overflow-hidden h-40 sm:h-56 w-full shrink-0">
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                
                {/* Badges — top-left */}
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap max-w-[calc(100%-44px)] z-10">
                  <span className="bg-secondary text-on-secondary px-2.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest leading-tight shadow-xs">
                    {t(recipe.category)}
                  </span>
                  <span className="bg-white dark:bg-[#121210] text-on-surface px-2.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest leading-tight shadow-xs border border-outline-variant/10">
                    {t(recipe.region)}
                  </span>
                  {recipe.spicy && (
                    <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold shadow-xs">
                      🌶️
                    </span>
                  )}
                </div>

                {/* Bookmark button — top-right */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(recipe.id);
                  }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-secondary text-white shadow-md flex items-center justify-center transition-all active:scale-90 z-10"
                  aria-label="Remove from saved"
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>

                {/* Floating Action Buttons — bottom-right */}
                <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRecipeClick(recipe);
                    }}
                    className="w-9 h-9 rounded-full bg-secondary hover:bg-secondary-container text-white flex items-center justify-center shadow-lg transition-all active:scale-90"
                    aria-label="View Recipe Details"
                  >
                    <ArrowUpRight className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRecipeClick(recipe);
                    }}
                    className="w-9 h-9 rounded-full bg-primary hover:bg-primary-container text-white flex items-center justify-center shadow-lg transition-all active:scale-90"
                    aria-label="Ask AI about this recipe"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Rating badge — bottom-left */}
                {recipe.rating && recipe.rating > 0 && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/55 backdrop-blur-xs text-white px-2.5 py-1.5 rounded-full border border-white/10 shadow-md">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] font-extrabold">{recipe.rating}</span>
                    <span className="text-[9px] opacity-80">({recipe.ratingCount || 124})</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex flex-col justify-between grow space-y-2 sm:space-y-3">
                <div>
                  <h4 className="text-xs sm:text-base font-black text-secondary leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {recipe.title}
                  </h4>
                  {recipe.authorName && (
                    <p className="text-[10px] font-bold text-on-surface-variant/70 flex items-center gap-1.5 mt-2">
                      <ChefHat className="w-3.5 h-3.5 text-secondary" />
                      {recipe.authorName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2.5 text-on-surface-variant flex-wrap pt-2 border-t border-outline-variant/10 mt-auto">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 text-secondary" />
                    <span>{recipe.cookTime}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wide ${getDiffClass(recipe.difficulty)}`}>
                    {t(recipe.difficulty)}
                  </span>
                  {recipe.calories && (
                    <span className="text-[9px] sm:text-[10px] font-bold text-outline">
                      {recipe.calories}
                    </span>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        <section className="mt-8 py-16 flex flex-col items-center text-center bg-surface-container-low rounded-4xl border-dashed border-2 border-outline-variant/30">
          <div className="w-40 h-40 mb-6 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-primary-fixed/20 rounded-full blur-2xl"></div>
            <div className="relative bg-surface-container-lowest p-6 rounded-full shadow-md">
               <Soup className="w-16 h-16 text-secondary stroke-1" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-on-surface mb-2">{t("Your kitchen is quiet")}</h3>
          <p className="text-on-surface-variant text-xs sm:text-sm max-w-xs mb-8 leading-relaxed">{t("It seems you haven't saved any recipes yet. Start exploring the rich flavors of Indonesia.")}</p>
          <button 
            onClick={onExplore}
            className="bg-primary hover:bg-primary-container text-on-primary font-black px-8 py-3.5 rounded-full transition-all duration-300 active:scale-95 shadow-md shadow-primary/15"
          >
            {t("Explore Recipes")}
          </button>
        </section>
      )}
    </motion.div>
  );
}
