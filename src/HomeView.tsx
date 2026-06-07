/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { Clock, Bookmark, FilterX, Star, Sparkles, ChefHat, ArrowUpRight } from "lucide-react";
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
    <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-xs">
      <div className="skeleton h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex gap-3 pt-2">
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-4 w-12" />
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="pb-[env(safe-area-inset-bottom,0px)]"
    >
      {/* ── Header ── */}
      <header className="mb-6 pt-2">
        <p className="text-on-surface-variant font-bold tracking-tight text-xs sm:text-sm">
          {greeting.emoji} {greeting.text},{" "}
          {language === "id" ? "Pencinta Kuliner!" : "Foodie!"}
        </p>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-on-surface tracking-tighter leading-tight mt-1">
          {t("Ready for a spice adventure?")}
        </h2>
        {!isLoading && recipes.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mt-2.5 text-[10px] sm:text-xs font-extrabold text-outline uppercase tracking-widest">
            <span>{recipes.length} {t("Recipes")}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-outline/40" />
            <span>{new Set(recipes.map(r => r.region)).size} {t("Regions")}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-outline/40" />
            <span>{new Set(recipes.map(r => r.category)).size} {t("Categories")}</span>
          </div>
        )}
      </header>

      {/* ── Quick Filter Chips ── */}
      <div className="flex flex-wrap items-center gap-2 mb-6 no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 pb-1 scroll-smooth">
        {[
          { key: "all" as const, label: "All Recipes" },
          { key: "trending" as const, label: "🔥 Trending" },
          { key: "top-rated" as const, label: "⭐ Top Rated" },
          { key: "spicy" as const, label: "🌶️ Spicy" },
        ].map(chip => (
          <button
            key={chip.key}
            onClick={() => setQuickFilter(chip.key)}
            className={`shrink-0 px-4 sm:px-6 py-2 rounded-full text-[11px] sm:text-xs font-extrabold whitespace-nowrap transition-all active:scale-95 ${quickFilter === chip.key
              ? "bg-primary text-on-primary shadow-md shadow-primary/15"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
          >
            {t(chip.label)}
          </button>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="space-y-5">
        {/* Category */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-outline">
              {t("Filter by Course")}
            </h3>
            {activeCategory !== "All" && (
              <button
                onClick={() => setActiveCategory("All")}
                className="text-[10px] font-extrabold text-primary uppercase tracking-widest"
              >
                {t("Clear")}
              </button>
            )}
          </div>
          <div className="-mx-4 px-4 sm:-mx-6 sm:px-6 no-scrollbar flex flex-wrap items-center gap-2 pb-1 scroll-smooth">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 sm:px-6 py-2 rounded-full font-extrabold text-[11px] sm:text-xs transition-all whitespace-nowrap active:scale-95 ${activeCategory === cat
                  ? "bg-primary text-on-primary shadow-md shadow-primary/15"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
              >
                {t(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Region */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-outline">
              {t("Filter by Region")}
            </h3>
            {activeRegion !== "All" && (
              <button
                onClick={() => setActiveRegion("All")}
                className="text-[10px] font-extrabold text-primary uppercase tracking-widest"
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
                className={`shrink-0 px-4 sm:px-6 py-2 rounded-full font-extrabold text-[11px] sm:text-xs transition-all whitespace-nowrap active:scale-95 ${activeRegion === region
                  ? "bg-secondary text-on-secondary shadow-md shadow-secondary/15"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
              >
                {t(region)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recipe Grid ── */}
      <section className="space-y-4 mt-8">
        <div className="flex justify-between items-center">
          <h3 className="text-base sm:text-2xl font-black tracking-tight text-on-surface">
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
            className="text-[11px] sm:text-sm font-extrabold text-primary hover:underline shrink-0 ml-2"
          >
            {t("Reset All")}
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {filteredRecipes.map((recipe, idx) => {
              const isWide = idx === 0 && filteredRecipes.length > 3;
              const isSaved = savedIds.includes(recipe.id);

              return (
                <motion.article
                  key={recipe.id}
                  layout
                  layoutId={`recipe-${recipe.id}`}
                  onClick={() => onRecipeClick(recipe)}
                  className={`group cursor-pointer bg-surface-container-lowest rounded-4xl overflow-hidden transition-all duration-500 hover:shadow-[0_24px_48px_rgba(140,45,25,0.08)] flex flex-col ${isWide
                    ? "col-span-2 sm:col-span-2 lg:col-span-1 xl:col-span-2 xl:flex-row xl:h-[280px]"
                    : "h-full"
                    }`}
                >
                  {/* Image Container */}
                  <div
                    className={`relative overflow-hidden shrink-0 ${isWide
                      ? "w-full xl:w-1/2 h-44 sm:h-56 xl:h-full"
                      : "h-40 sm:h-56"
                      }`}
                  >
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Overlaid Badges — top-left */}
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap max-w-[calc(100%-44px)] z-10">
                      <span className="bg-secondary text-on-secondary px-2.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest leading-tight shadow-xs">
                        {t(recipe.category)}
                      </span>
                      <span className="hidden sm:inline-block bg-white dark:bg-[#121210] text-on-surface px-2.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest leading-tight shadow-xs border border-outline-variant/10">
                        {t(recipe.region)}
                      </span>
                      {recipe.spicy && (
                        <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold shadow-xs">
                          🌶️
                        </span>
                      )}
                    </div>

                    {/* Bookmark Save Button — top-right */}
                    <button
                      onClick={e => { e.stopPropagation(); onToggleSave(recipe.id); }}
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 z-10 ${
                        isSaved 
                          ? "bg-secondary text-white shadow-md" 
                          : "bg-black/45 hover:bg-black/60 text-white"
                      }`}
                      aria-label={isSaved ? "Remove from saved" : "Save recipe"}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                    </button>

                    {/* Floating Circular Action Buttons — bottom-right */}
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

                    {/* Rating overlay — bottom-left */}
                    {recipe.rating && recipe.rating > 0 && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/55 backdrop-blur-xs text-white px-2.5 py-1.5 rounded-full border border-white/10 shadow-md">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] font-extrabold">{recipe.rating}</span>
                        <span className="hidden sm:inline text-[9px] opacity-80">({recipe.ratingCount})</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div
                    className={`p-4 sm:p-5 flex flex-col justify-between grow space-y-2 sm:space-y-3 ${isWide ? "xl:w-1/2" : ""
                      }`}
                  >
                    <div>
                      <h4 className="text-xs sm:text-base font-black text-secondary leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {recipe.title}
                      </h4>
                      {(isWide || filteredRecipes.length === 1) && (
                        <p className="text-on-surface-variant text-[11px] sm:text-xs mt-2 line-clamp-3 leading-relaxed">
                          {recipe.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 mt-auto">
                      {recipe.authorName && (
                        <p className="text-[10px] font-bold text-on-surface-variant/70 flex items-center gap-1.5 truncate">
                          <ChefHat className="w-3.5 h-3.5 shrink-0 text-secondary" />
                          <span className="truncate">{recipe.authorName}</span>
                        </p>
                      )}

                      <div className="flex items-center gap-2.5 text-on-surface-variant flex-wrap pt-2 border-t border-outline-variant/10">
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5 shrink-0 text-secondary" />
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