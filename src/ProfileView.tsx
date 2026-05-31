import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { User, Bookmark, ShoppingBag, Settings, ChevronRight, PieChart, Heart, LogOut, ChefHat, Globe, Info, ChevronLeft, Clock, Star } from "lucide-react";
import { Recipe, Profile } from "./types";
import { useAuth } from "./contexts/AuthContext";
import { useLanguage } from "./contexts/LanguageContext";
import * as api from "./supabaseService";

interface ProfileViewProps {
  savedCount: number;
  shoppingCount: number;
  onNavigate: (view: any) => void;
  recipes: Recipe[];
  viewingUserId?: string | null;
  onBackToRecipe?: () => void;
  onRecipeClick?: (recipe: Recipe) => void;
}

export default function ProfileView({
  savedCount,
  shoppingCount,
  onNavigate,
  recipes,
  viewingUserId = null,
  onBackToRecipe,
  onRecipeClick
}: ProfileViewProps) {
  const { user, signInWithGoogle, logout, isGuest } = useAuth();
  const { t } = useLanguage();

  const [isMobile, setIsMobile] = useState(false);
  const [targetProfile, setTargetProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (viewingUserId && (!user || viewingUserId !== user.id)) {
      setProfileLoading(true);
      api.getProfile(viewingUserId).then((prof) => {
        if (prof) {
          setTargetProfile(prof);
        } else {
          const authorRecipes = recipes.filter(r => r.authorId === viewingUserId);
          const name = authorRecipes[0]?.authorName || "Anonymous Chef";
          setTargetProfile({
            id: viewingUserId,
            display_name: name,
            email: "",
          });
        }
        setProfileLoading(false);
      });
    } else {
      setTargetProfile(null);
    }
  }, [viewingUserId, user, recipes]);

  const isPublicView = !!(viewingUserId && (!user || viewingUserId !== user.id));

  const targetRecipes = isPublicView 
    ? recipes.filter(r => r.authorId === viewingUserId)
    : recipes.filter(r => r.authorId === user?.id);

  const publicRecipesCount = targetRecipes.length;
  const myRecipesCount = isGuest ? 0 : recipes.filter(r => r.authorId === user?.id).length;

  const stats = isPublicView ? [
    { label: t("My Shared Recipes"), value: publicRecipesCount, icon: ChefHat, color: "text-primary", bg: "bg-primary/10" }
  ] : [
    { label: t("My Recipes"), value: myRecipesCount, icon: ChefHat, color: "text-primary", bg: "bg-primary/10" },
    { label: t("Saved Collection"), value: savedCount, icon: Bookmark, color: "text-secondary", bg: "bg-secondary/10" },
    { label: t("Market List"), value: shoppingCount, icon: ShoppingBag, color: "text-tertiary", bg: "bg-tertiary/10" },
  ];

  const quickLinks = [
    { label: t("My Shared Recipes"), icon: ChefHat, description: t("Manage recipes you shared with the community"), view: "my-recipes" },
    { label: t("My Saved Collection"), icon: Bookmark, description: t("Saved Collection Description"), view: "saved" },
    { label: t("Market List"), icon: ShoppingBag, description: t("Ingredients you need to buy"), view: "shopping" },
    { label: t("App Preferences"), icon: Settings, description: t("Change theme, language, and dietary settings"), view: "preferences" },
    { label: t("About Nusa Culinary"), icon: Info, description: t("Mission, quality policies, and contact info"), view: "about" },
  ];

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-outline">{t("Loading Profile...")}</p>
      </div>
    );
  }

  const displayName = isPublicView 
    ? (targetProfile?.display_name || t("Chef Explorer"))
    : (user?.user_metadata?.full_name || t("Guest Explorer"));

  const displayEmail = isPublicView 
    ? "" 
    : (user?.email || t("Guest Account"));

  const photoURL = isPublicView
    ? targetProfile?.avatar_url
    : (user?.user_metadata?.avatar_url || user?.user_metadata?.picture);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Back Button for Public Profile View */}
      {isPublicView && onBackToRecipe && (
        <button 
          onClick={onBackToRecipe}
          className="flex items-center gap-2 mb-6 text-primary font-bold text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer bg-transparent border-none p-0"
        >
          <ChevronLeft className="w-4.5 h-4.5" />
          {t("Back to Recipe")}
        </button>
      )}

      {/* Profile Header */}
      <section className="mb-12 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-linear-to-br from-primary to-primary-container p-1 shadow-xl">
            <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden border-4 border-surface">
              {photoURL ? (
                <img src={photoURL} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-16 h-16 text-primary" />
              )}
            </div>
          </div>

        </div>
        <h2 className="text-3xl font-black text-on-surface mb-1">{displayName}</h2>
        {displayEmail && <p className="text-sm font-bold uppercase tracking-widest text-outline">{displayEmail}</p>}
        
        {!isPublicView && (
          isGuest ? (
            <button 
              onClick={signInWithGoogle}
              className="mt-6 px-8 py-3 bg-primary text-on-primary rounded-full font-black shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all"
            >
              <User className="w-5 h-5" />
              {t("Login with Google")}
            </button>
          ) : (
            <button 
              onClick={logout}
              className="mt-6 px-8 py-3 bg-surface-container-high text-on-surface rounded-full font-bold shadow-sm flex items-center gap-2 active:scale-90 transition-all border border-outline-variant/10"
            >
              <LogOut className="w-4 h-4" />
              {t("Sign Out")}
            </button>
          )
        )}
      </section>

      {/* Guest Nudge */}
      {isGuest && !isPublicView && (
        <section className="mb-10 p-6 bg-secondary/5 rounded-[2.5rem] border border-secondary/10 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-on-secondary shadow-lg shadow-secondary/30 shrink-0">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-secondary uppercase tracking-wider text-xs">{t("Unlock Chef Features")}</h4>
              <p className="text-sm text-on-surface-variant leading-tight">{t("Sign in to share your own recipes and join the community discussion!")}</p>
            </div>
          </div>
        </section>
      )}

      {/* Stats Cards */}
      <section className={`grid ${isPublicView ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-1 sm:grid-cols-3'} gap-4 mb-10`}>
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface-container-low p-4 sm:p-5 rounded-3xl border border-outline-variant/10 flex flex-row sm:flex-col items-center gap-4 sm:gap-2 text-left sm:text-center shadow-sm w-full">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex flex-col sm:items-center min-w-0 flex-1">
              <span className="text-2xl font-black text-on-surface leading-none">{stat.value}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline mt-1 truncate w-full">{stat.label}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Shared Recipes Grid for Public Profile View */}
      {isPublicView && (
        <section className="mt-10 border-t border-outline-variant/10 pt-8 text-left">
          <h3 className="text-xl font-black text-on-surface mb-6 ml-2">{t("My Shared Recipes")}</h3>
          {targetRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {targetRecipes.map((recipe) => (
                <article
                  key={recipe.id}
                  onClick={() => onRecipeClick && onRecipeClick(recipe)}
                  className="group cursor-pointer bg-surface-container-low rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-outline-variant/10 flex flex-col h-full text-left"
                >
                  <div className="relative h-44 w-full overflow-hidden">
                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <span className="bg-primary text-on-primary px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                        {t(recipe.category)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col justify-between grow space-y-2">
                    <h4 className="font-bold text-sm text-on-surface leading-snug group-hover:text-primary transition-colors line-clamp-1">
                      {recipe.title}
                    </h4>
                    <div className="flex items-center gap-2 text-on-surface-variant text-xs pt-1 flex-wrap mt-auto">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-outline" />
                        <span>{recipe.cookTime}</span>
                      </div>
                      <span className="bg-secondary/10 text-secondary px-1.5 py-0.5 rounded text-[9px] font-bold">
                        {t(recipe.difficulty)}
                      </span>
                      {recipe.rating && recipe.rating > 0 ? (
                        <div className="flex items-center gap-1 text-tertiary">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-[10px] font-bold">{recipe.rating}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant italic ml-2">{t("No recipes shared by this chef yet.")}</p>
          )}
        </section>
      )}

      {/* Navigation Sections - Mobile Only & Filtered (Hidden on Public View) */}
      {isMobile && !isPublicView && (
        <section className="space-y-4 text-left">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-outline mb-4 ml-2">{t("Quick Management")}</h3>
          <div className="space-y-3">
            {quickLinks
              .filter(link => ["preferences", "about"].includes(link.view))
              .map((link) => (
                <button
                  key={link.label}
                  onClick={() => onNavigate(link.view)}
                  className="w-full flex items-center gap-4 p-5 rounded-3xl bg-surface-container-low hover:bg-surface-container-high transition-all border border-outline-variant/10 group shadow-sm text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center shadow-sm text-primary group-hover:scale-110 transition-transform shrink-0">
                    <link.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-black text-on-surface truncate">{link.label}</p>
                    <p className="text-xs text-on-surface-variant font-medium truncate">{link.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-outline group-hover:translate-x-1 transition-transform shrink-0" />
                </button>
              ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
