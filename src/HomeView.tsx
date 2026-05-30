/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Utensils, Bookmark, FilterX, Star, Flame, TrendingUp, Sparkles, ChefHat } from "lucide-react";
import { Recipe } from "./types";
import { useLanguage } from "./contexts/LanguageContext";

interface HomeViewProps {
  onRecipeClick: (recipe: Recipe) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  initialCategory?: string;
  dietaryPreference?: string;
  recipes?: Recipe[];
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  isLoading?: boolean;
}

export default function HomeView({ 
  onRecipeClick, 
  savedIds, 
  onToggleSave, 
  initialCategory = "All",
  dietaryPreference = "None",
  recipes = [],
  searchQuery = "",
  onSearchChange = () => {},
  isLoading = false
}: HomeViewProps) {
  const { t, language } = useLanguage();
  const [activeRegion, setActiveRegion] = useState("All");
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [quickFilter, setQuickFilter] = useState<"all" | "trending" | "top-rated" | "spicy">("all");

  const regions = ["All", "Sumatra", "Jawa", "Bali", "Sulawesi", "Kalimantan", "Papua"];
  const categories = ["All", "Appetizer", "Main Course", "Dessert", "Drink"];
  
  useEffect(() => {
    if (initialCategory && categories.includes(initialCategory as any)) {
      setActiveCategory(initialCategory);
    } else if (initialCategory && regions.includes(initialCategory)) {
       setActiveRegion(initialCategory);
       setActiveCategory("All");
    }
  }, [initialCategory]);

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === "id") {
      if (hour < 11) return { text: "Selamat pagi", emoji: "☀️" };
      if (hour < 15) return { text: "Selamat siang", emoji: "🌤️" };
      if (hour < 18) return { text: "Selamat sore", emoji: "🌅" };
      return { text: "Selamat malam", emoji: "🌙" };
    } else {
      if (hour < 11) return { text: "Good morning", emoji: "☀️" };
      if (hour < 15) return { text: "Good afternoon", emoji: "🌤️" };
      if (hour < 18) return { text: "Good evening", emoji: "🌅" };
      return { text: "Good night", emoji: "🌙" };
    }
  };

  const greeting = getGreeting();

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesRegion = activeRegion === "All" || recipe.region === activeRegion;
      const matchesCategory = activeCategory === "All" || recipe.category === activeCategory;
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Quick filter logic
      let matchesQuick = true;
      if (quickFilter === "trending") matchesQuick = (recipe.ratingCount || 0) > 100;
      if (quickFilter === "top-rated") matchesQuick = (recipe.rating || 0) >= 4.5;
      if (quickFilter === "spicy") matchesQuick = recipe.spicy === true;

      // Dietary filtering
      let matchesDiet = true;
      if (dietaryPreference === "Vegetarian" || dietaryPreference === "Vegan") {
        const nonVegKeywords = ['chicken', 'beef', 'meat', 'fish', 'prawn', 'lamb', 'egg'];
        matchesDiet = !recipe.ingredients.some(ing => 
          nonVegKeywords.some(kw => ing.name.toLowerCase().includes(kw))
        ) && !recipe.title.toLowerCase().includes('meat') && !recipe.title.toLowerCase().includes('chicken') && !recipe.title.toLowerCase().includes('beef') && recipe.category !== "Main Course";
      } else if (dietaryPreference === "Halal") {
        const nonHalalKeywords = ['pork', 'lard', 'alcohol', 'wine', 'mirin'];
        matchesDiet = !recipe.ingredients.some(ing => 
          nonHalalKeywords.some(kw => ing.name.toLowerCase().includes(kw))
        );
      }

      return matchesRegion && matchesCategory && matchesSearch && matchesDiet && matchesQuick;
    });
  }, [activeRegion, activeCategory, searchQuery, dietaryPreference, recipes, quickFilter]);

  // Difficulty badge color
  const getDiffClass = (diff: string) => {
    if (diff === "Easy") return "diff-easy";
    if (diff === "Medium") return "diff-medium";
    return "diff-hard";
  };

  // Skeleton Cards
  const SkeletonCard = () => (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
      <div className="skeleton h-60 w-full rounded-none" />
      <div className="p-6 space-y-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="flex gap-4 pt-2">
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-4 w-16" />
        </div>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <header className="mb-8 pt-4">
        <p className="text-on-surface-variant font-medium tracking-tight">{greeting.emoji} {greeting.text}, {language === "id" ? "Pencinta Kuliner!" : "Foodie!"}</p>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tighter leading-tight mt-1">{t("Ready for a spice adventure?")}</h2>
        {!isLoading && recipes.length > 0 && (
          <div className="flex items-center gap-3 mt-3 text-xs font-bold text-outline uppercase tracking-wider">
            <span>{recipes.length} {t("Recipes")}</span>
            <span className="w-1 h-1 rounded-full bg-outline" />
            <span>{new Set(recipes.map(r => r.region)).size} {t("Regions")}</span>
            <span className="w-1 h-1 rounded-full bg-outline" />
            <span>{new Set(recipes.map(r => r.category)).size} {t("Categories")}</span>
          </div>
        )}
      </header>

      {/* Quick Filter Chips */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar -mx-6 px-6 pb-1">
        {[
          { key: "all" as const, label: "All Recipes", icon: ChefHat },
          { key: "trending" as const, label: "🔥 Trending", icon: TrendingUp },
          { key: "top-rated" as const, label: "⭐ Top Rated", icon: Sparkles },
          { key: "spicy" as const, label: "🌶️ Spicy", icon: Flame },
        ].map(chip => (
          <button
            key={chip.key}
            onClick={() => setQuickFilter(chip.key)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              quickFilter === chip.key 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/10'
            }`}
          >
            {t(chip.label)}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-outline">{t("Filter by Course")}</h3>
            {activeCategory !== "All" && (
              <button 
                onClick={() => setActiveCategory("All")}
                className="text-[10px] font-bold text-primary uppercase tracking-wider"
              >
                {t("Clear Category")}
              </button>
            )}
          </div>
          <section className="-mx-6 overflow-x-auto no-scrollbar flex items-center gap-3 px-6 pb-2">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm whitespace-nowrap active:scale-95 ${activeCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {t(cat)}
              </button>
            ))}
          </section>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-outline">{t("Filter by Region")}</h3>
            {activeRegion !== "All" && (
              <button 
                onClick={() => setActiveRegion("All")}
                className="text-[10px] font-bold text-primary uppercase tracking-wider"
              >
                {t("Clear Region")}
              </button>
            )}
          </div>
          <section className="-mx-6 overflow-x-auto no-scrollbar flex items-center gap-3 px-6 pb-2">
            {regions.map((region) => (
              <button 
                key={region}
                onClick={() => setActiveRegion(region)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm whitespace-nowrap active:scale-95 ${activeRegion === region ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {t(region)}
              </button>
            ))}
          </section>
        </div>
      </div>

      <section className="space-y-6 mt-10">
        <div className="flex justify-between items-end">
          <h3 className="text-xl font-bold tracking-tight">
            {quickFilter === "trending" ? t("🔥 Trending Now") : 
             quickFilter === "top-rated" ? t("⭐ Top Rated") : 
             quickFilter === "spicy" ? t("🌶️ Spicy Collection") : 
             t("Today's Signature Dishes")}
          </h3>
          <button 
            onClick={() => {
              setActiveRegion("All");
              setActiveCategory("All");
              setQuickFilter("all");
              onSearchChange("");
            }}
            className="text-sm font-bold text-primary hover:underline"
          >
            {t("Reset All")}
          </button>
        </div>

        {isLoading ? (
          /* Skeleton Loading Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredRecipes.map((recipe, idx) => {
              const isWide = idx === 0 && filteredRecipes.length > 3;
              const isSaved = savedIds.includes(recipe.id);

              return (
                <motion.article 
                  key={recipe.id}
                  layout
                  layoutId={`recipe-${recipe.id}`}
                  onClick={() => onRecipeClick(recipe)}
                  className={`group cursor-pointer bg-surface-container-lowest rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_rgba(148,74,0,0.1)] flex flex-col ${isWide ? 'sm:col-span-2 lg:col-span-1 xl:col-span-2 sm:flex-row lg:flex-col xl:flex-row sm:h-[280px] lg:h-auto xl:h-[280px] h-auto' : 'h-full'}`}
                >
                  <div className={`relative overflow-hidden ${isWide ? 'w-full sm:w-1/2 lg:w-full xl:w-1/2 h-64 sm:h-full lg:h-64 xl:h-full' : 'h-60'}`}>
                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                      <span className="bg-primary text-on-primary px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {t(recipe.category)}
                      </span>
                      <span className="bg-white/90 backdrop-blur-md text-on-surface px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {t(recipe.region)}
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
                    >
                      <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
                    </button>
                    {/* Rating badge */}
                    {recipe.rating && recipe.rating > 0 && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold">{recipe.rating}</span>
                        <span className="text-[10px] opacity-70">({recipe.ratingCount})</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-6 flex flex-col justify-between grow space-y-3 ${isWide ? 'w-full sm:w-1/2 lg:w-full xl:w-1/2' : ''}`}>
                    <h4 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                      {recipe.title}
                    </h4>
                    {(isWide || filteredRecipes.length === 1) && <p className="text-on-surface-variant text-sm line-clamp-2">{recipe.description}</p>}
                    {recipe.authorName && (
                      <p className="text-xs font-medium text-outline flex items-center gap-1.5">
                        <ChefHat className="w-3 h-3" />
                        {recipe.authorName}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-on-surface-variant text-sm pt-1 flex-wrap">
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
              );
            })}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center space-y-4"
          >
            <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6">
              <FilterX className="w-10 h-10 text-on-surface-variant" />
            </div>
            <h4 className="text-xl font-bold text-on-surface">{t("No recipes found.")}</h4>
            <p className="text-on-surface-variant">{t("Try adjusting your filters or search keywords.")}</p>
            <button 
              onClick={() => {
                setActiveRegion("All");
                setActiveCategory("All");
                setQuickFilter("all");
                onSearchChange("");
              }}
              className="text-primary font-bold hover:underline"
            >
              {t("Show all recipes")}
            </button>
          </motion.div>
        )}
      </section>
    </motion.div>
  );
}
