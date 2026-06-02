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
  onSearchChange = () => { },
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
      const matchesSearch =
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesQuick = true;
      if (quickFilter === "trending") matchesQuick = (recipe.ratingCount || 0) > 100;
      if (quickFilter === "top-rated") matchesQuick = (recipe.rating || 0) >= 4.5;
      if (quickFilter === "spicy") matchesQuick = recipe.spicy === true;

      let matchesDiet = true;
      if (dietaryPreference === "Vegetarian" || dietaryPreference === "Vegan") {
        const nonVegKeywords = ['chicken', 'beef', 'meat', 'fish', 'prawn', 'lamb', 'egg'];
        matchesDiet =
          !recipe.ingredients.some(ing => nonVegKeywords.some(kw => ing.name.toLowerCase().includes(kw))) &&
          !recipe.title.toLowerCase().includes('meat') &&
          !recipe.title.toLowerCase().includes('chicken') &&
          !recipe.title.toLowerCase().includes('beef') &&
          recipe.category !== "Main Course";
      } else if (dietaryPreference === "Halal") {
        const nonHalalKeywords = ['pork', 'lard', 'alcohol', 'wine', 'mirin'];
        matchesDiet = !recipe.ingredients.some(ing =>
          nonHalalKeywords.some(kw => ing.name.toLowerCase().includes(kw))
        );
      }

      return matchesRegion && matchesCategory && matchesSearch && matchesDiet && matchesQuick;
    });
  }, [activeRegion, activeCategory, searchQuery, dietaryPreference, recipes, quickFilter]);

  const getDiffClass = (diff: string) => {
    if (diff === "Easy") return "diff-easy";
    if (diff === "Medium") return "diff-medium";
    return "diff-hard";
  };

  const SkeletonCard = () => (
    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden">
      <div className="skeleton h-44 w-full rounded-none" />
      <div className="p-3 space-y-2.5">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex gap-3 pt-1">
          <div className="skeleton h-3 w-16" />
          <div className="skeleton h-3 w-12" />
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      /* safe-area bottom so content clears the fixed bottom nav */
      className="pb-[env(safe-area-inset-bottom,0px)]"
    >
      {/* ── Header ── */}
      <header className="mb-4 sm:mb-6 pt-2 sm:pt-4">
        <p className="text-on-surface-variant font-medium tracking-tight text-xs sm:text-sm">
          {greeting.emoji} {greeting.text},{" "}
          {language === "id" ? "Pencinta Kuliner!" : "Foodie!"}
        </p>
        <h2 className="text-xl sm:text-3xl font-extrabold text-on-surface tracking-tighter leading-tight mt-0.5">
          {t("Ready for a spice adventure?")}
        </h2>
        {!isLoading && recipes.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 sm:mt-3 text-[9px] sm:text-xs font-bold text-outline uppercase tracking-wider">
            <span>{recipes.length} {t("Recipes")}</span>
            <span className="w-1 h-1 rounded-full bg-outline" />
            <span>{new Set(recipes.map(r => r.region)).size} {t("Regions")}</span>
            <span className="w-1 h-1 rounded-full bg-outline" />
            <span>{new Set(recipes.map(r => r.category)).size} {t("Categories")}</span>
          </div>
        )}
      </header>

      {/* ── Quick Filter Chips ──
           Key fix: negative margin pulls chips flush to screen edge so
           they scroll properly and don't appear clipped. */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4 sm:mb-6  no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 pb-0.5 scroll-smooth">
        {[
          { key: "all" as const, label: "All Recipes" },
          { key: "trending" as const, label: "🔥 Trending" },
          { key: "top-rated" as const, label: "⭐ Top Rated" },
          { key: "spicy" as const, label: "🌶️ Spicy" },
        ].map(chip => (
          <button
            key={chip.key}
            onClick={() => setQuickFilter(chip.key)}
            className={`flex-shrink-0 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${quickFilter === chip.key
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/15"
              }`}
          >
            {t(chip.label)}
          </button>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="space-y-4 sm:space-y-6">
        {/* Category */}
        <div>
          <div className="mb-2 sm:mb-3 flex items-center justify-between">
            <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-outline">
              {t("Filter by Course")}
            </h3>
            {activeCategory !== "All" && (
              <button
                onClick={() => setActiveCategory("All")}
                className="text-[9px] font-bold text-primary uppercase tracking-wider"
              >
                {t("Clear")}
              </button>
            )}
          </div>
          {/* flex-shrink-0 on each pill keeps long translated labels from wrapping */}
          <div className="-mx-4 px-4 sm:-mx-6 sm:px-6 no-scrollbar flex flex-wrap items-center gap-2 pb-1 scroll-smooth">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold text-[10px] sm:text-sm transition-all shadow-sm whitespace-nowrap active:scale-95 ${activeCategory === cat
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
              >
                {t(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Region */}
        <div>
          <div className="mb-2 sm:mb-3 flex items-center justify-between">
            <h3 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-outline">
              {t("Filter by Region")}
            </h3>
            {activeRegion !== "All" && (
              <button
                onClick={() => setActiveRegion("All")}
                className="text-[9px] font-bold text-primary uppercase tracking-wider"
              >
                {t("Clear")}
              </button>
            )}
          </div>
          <div className="-mx-4 px-4 sm:-mx-6 sm:px-6 flex-wrap no-scrollbar flex items-center gap-2 pb-1 scroll-smooth">
            {regions.map(region => (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                className={`flex-shrink-0 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold text-[10px] sm:text-sm transition-all shadow-sm whitespace-nowrap active:scale-95 ${activeRegion === region
                  ? "bg-secondary text-white shadow-md shadow-secondary/20"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
              >
                {t(region)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recipe Grid ── */}
      <section className="space-y-3 sm:space-y-5 mt-6 sm:mt-8">
        <div className="flex justify-between items-center">
          <h3 className="text-sm sm:text-xl font-bold tracking-tight">
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
            className="text-[10px] sm:text-sm font-bold text-primary hover:underline shrink-0 ml-2"
          >
            {t("Reset All")}
          </button>
        </div>

        {isLoading ? (
          /* 2-col skeleton on mobile, 3-col on lg */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-7">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>

        ) : filteredRecipes.length > 0 ? (
          /* 2-col on mobile keeps cards reasonably sized without overflow */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-7">
            {filteredRecipes.map((recipe, idx) => {
              const isWide = idx === 0 && filteredRecipes.length > 3;
              const isSaved = savedIds.includes(recipe.id);

              return (
                <motion.article
                  key={recipe.id}
                  layout
                  layoutId={`recipe-${recipe.id}`}
                  onClick={() => onRecipeClick(recipe)}
                  className={`group cursor-pointer bg-surface-container-lowest rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_16px_32px_rgba(148,74,0,0.10)] flex flex-col ${isWide
                    ? "col-span-2 sm:col-span-2 lg:col-span-1 xl:col-span-2 xl:flex-row xl:h-[260px]"
                    : "h-full"
                    }`}
                >
                  {/* Image */}
                  <div
                    className={`relative overflow-hidden ${isWide
                      ? "w-full xl:w-1/2 h-40 sm:h-52 xl:h-full"
                      : "h-36 sm:h-52"
                      }`}
                  >
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Badges — hide region badge on very small cards to avoid overlap */}
                    <div className="absolute top-2 left-2 flex gap-1 flex-wrap max-w-[calc(100%-44px)]">
                      <span className="bg-primary text-on-primary px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-bold uppercase tracking-wide leading-tight">
                        {t(recipe.category)}
                      </span>
                      <span className="hidden sm:inline-block bg-white/90 dark:bg-black/60 backdrop-blur-md text-on-surface px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                        {t(recipe.region)}
                      </span>
                      {recipe.spicy && (
                        <span className="bg-red-500/90 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">
                          🌶️
                        </span>
                      )}
                    </div>

                    {/* Save button — smaller on mobile */}
                    <button
                      onClick={e => { e.stopPropagation(); onToggleSave(recipe.id); }}
                      className="absolute top-2 right-2 bg-white/20 backdrop-blur-xl w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
                    >
                      <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? "fill-white" : ""}`} />
                    </button>

                    {/* Rating */}
                    {recipe.rating && recipe.rating > 0 && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-full">
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] font-bold">{recipe.rating}</span>
                        {/* Hide count on tiny cards */}
                        <span className="hidden sm:inline text-[9px] opacity-70">({recipe.ratingCount})</span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div
                    className={`p-2.5 sm:p-4 flex flex-col justify-between grow space-y-1.5 sm:space-y-2 ${isWide ? "xl:w-1/2" : ""
                      }`}
                  >
                    <h4 className="text-[11px] sm:text-base font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {recipe.title}
                    </h4>

                    {(isWide || filteredRecipes.length === 1) && (
                      <p className="text-on-surface-variant text-[10px] sm:text-sm line-clamp-2">
                        {recipe.description}
                      </p>
                    )}

                    {recipe.authorName && (
                      <p className="text-[9px] sm:text-[10px] font-medium text-outline flex items-center gap-1 truncate">
                        <ChefHat className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{recipe.authorName}</span>
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 sm:gap-2 text-on-surface-variant flex-wrap pt-0.5">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span className="text-[9px] sm:text-xs">{recipe.cookTime}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase tracking-wide ${getDiffClass(recipe.difficulty)}`}>
                        {t(recipe.difficulty)}
                      </span>
                      {recipe.calories && (
                        <span className="hidden sm:inline text-[9px] sm:text-[10px] font-medium text-outline">
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
            className="py-14 sm:py-20 text-center space-y-3"
          >
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4">
              <FilterX className="w-7 h-7 sm:w-10 sm:h-10 text-on-surface-variant" />
            </div>
            <h4 className="text-base sm:text-xl font-bold text-on-surface">{t("No recipes found.")}</h4>
            <p className="text-xs sm:text-base text-on-surface-variant">
              {t("Try adjusting your filters or search keywords.")}
            </p>
            <button
              onClick={() => {
                setActiveRegion("All");
                setActiveCategory("All");
                setQuickFilter("all");
                onSearchChange("");
              }}
              className="text-primary font-bold hover:underline text-sm"
            >
              {t("Show all recipes")}
            </button>
          </motion.div>
        )}
      </section>
    </motion.div>
  );
}