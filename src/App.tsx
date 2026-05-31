/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, Search, Compass, Bookmark, Plus, X, Globe, Settings, LogOut, Info, ShoppingBag, User, Sparkles, MessageSquare, ArrowUp, ChefHat } from "lucide-react";
import HomeView from "./HomeView";
import SavedRecipesView from "./SavedRecipesView";
import MyRecipesView from "./MyRecipesView";
import RecipeDetailView from "./RecipeDetailView";
import AboutView from "./AboutView";
import PreferencesView from "./PreferencesView";
import AddRecipeModal from "./AddRecipeModal";
import ShoppingView from "./ShoppingView";
import ProfileView from "./ProfileView";
import AIChatbot from "./AIChatbot";
import NotificationToast, { ToastType } from "./components/NotificationToast";
import { Recipe, ShoppingItem } from "./types";
import { useAuth } from "./contexts/AuthContext";
import { useLanguage } from "./contexts/LanguageContext";
import * as api from "./supabaseService";

type ViewState = "home" | "saved" | "detail" | "about" | "preferences" | "shopping" | "profile" | "my-recipes";

export interface UserPreferences {
  darkMode: boolean;
  notifications: boolean;
  soundEnabled: boolean;
  region: string;
  selectedDiet: string;
  language?: "id" | "en";
}

export default function App() {
  const { user, signInWithGoogle, logout, isGuest } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [currentView, setCurrentView] = useState<ViewState>("home");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState<ViewState | null>(null);

  // Recipes — loaded from Supabase
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);

  // Saved recipe IDs — loaded from Supabase for logged-in users
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Shopping list — loaded from Supabase for logged-in users
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  // Fetch recipes from Supabase on mount
  useEffect(() => {
    const loadRecipes = async () => {
      setRecipesLoading(true);
      const recipes = await api.fetchRecipes();
      setAllRecipes(recipes);
      setRecipesLoading(false);
    };
    loadRecipes();
  }, []);

  // Fetch saved IDs and shopping list when user logs in
  useEffect(() => {
    if (user) {
      api.fetchSavedRecipeIds(user.id).then(setSavedIds);
      api.fetchShoppingItems(user.id).then(setShoppingList);
    } else {
      setSavedIds([]);
      setShoppingList([]);
    }
  }, [user]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVisibleAddModal, setIsVisibleAddModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: ToastType }[]>([]);

  const addToast = (message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem("culinary_prefs");
    return saved ? JSON.parse(saved) : {
      darkMode: false,
      notifications: true,
      soundEnabled: true,
      region: "Indonesia (Bahasa)",
      selectedDiet: "None"
    };
  });

  // Persist preferences (local-only, lightweight)
  useEffect(() => {
    localStorage.setItem("culinary_prefs", JSON.stringify(preferences));
  }, [preferences]);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Deep linking for shared recipes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('recipe');
    if (recipeId && allRecipes.length > 0) {
      const recipe = allRecipes.find(r => r.id === recipeId);
      if (recipe) {
        setSelectedRecipe(recipe);
        setCurrentView("detail");
      }
    }
  }, [allRecipes]);

  // Dark Mode side effect
  useEffect(() => {
    if (preferences.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [preferences.darkMode]);

  const toggleSave = async (id: string) => {
    const isSaving = !savedIds.includes(id);

    // Optimistic UI update
    setSavedIds(prev => isSaving ? [...prev, id] : prev.filter(i => i !== id));
    addToast(isSaving ? "Recipe saved to collection" : "Recipe removed from collection", isSaving ? "success" : "info");

    // Sync with Supabase
    if (user) {
      if (isSaving) {
        await api.saveRecipe(user.id, id);
      } else {
        await api.unsaveRecipe(user.id, id);
      }
    }
  };

  const handleAddIngredient = async (name: string, detail: string) => {
    if (user) {
      const newItem = await api.addShoppingItem(user.id, name, detail, selectedRecipe?.title);
      if (newItem) {
        setShoppingList(prev => [...prev, newItem]);
        addToast(`Added ${name} to Market List`);
      }
    } else {
      // Guest: local-only
      const newItem: ShoppingItem = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        detail,
        checked: false,
        recipeTitle: selectedRecipe?.title
      };
      setShoppingList(prev => [...prev, newItem]);
      addToast(`Added ${name} to Market List`);
    }
  };

  const handleAddRecipe = async (recipe: Recipe) => {
    if (user) {
      const created = await api.createRecipe(recipe, user.id);
      if (created) {
        setAllRecipes(prev => [created, ...prev]);
        addToast("Recipe submitted! It's now visible in your collection.");
      } else {
        addToast("Failed to submit recipe. Please try again.", "error");
      }
    }
  };

  const updateRecipe = async (updatedRecipe: Recipe) => {
    // Optimistic UI update
    setAllRecipes(prev => prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
    setSelectedRecipe(updatedRecipe);

    // Sync rating to Supabase (only rating updates for now)
    if (updatedRecipe.rating !== undefined) {
      await api.updateRecipe(updatedRecipe.id, {
        rating: updatedRecipe.rating,
        ratingCount: updatedRecipe.ratingCount,
      });
    }
  };

  const handleUpdateRecipeFull = async (updatedRecipe: Recipe) => {
    // Optimistic UI update
    setAllRecipes(prev => prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
    setSelectedRecipe(updatedRecipe);

    // Call Supabase update
    const result = await api.updateRecipe(updatedRecipe.id, updatedRecipe);
    if (result) {
      addToast("Recipe updated successfully!");
    } else {
      addToast("Failed to update recipe", "error");
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    // Optimistic UI update
    setAllRecipes(prev => prev.filter(r => r.id !== id));
    setCurrentView("home");
    setSelectedRecipe(null);

    // Call Supabase delete
    const success = await api.deleteRecipe(id);
    if (success) {
      addToast("Recipe deleted successfully");
    } else {
      addToast("Failed to delete recipe", "error");
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentView("detail");
  };

  const sidebarItems = [
    { icon: Compass, label: "Explore Recipes", view: "home" as const },
    { icon: User, label: "My Profile", view: "profile" as const },
    { icon: Plus, label: "Share Recipe", onClick: () => {
      if (isGuest) {
        addToast("Please login to share recipes", "info");
        setCurrentView("profile");
      } else {
        setIsVisibleAddModal(true);
      }
    }},
    { icon: Bookmark, label: "Saved Collection", view: "saved" as const },
    { icon: ChefHat, label: "My Recipes", view: "my-recipes" as const },
    { icon: ShoppingBag, label: "Market List", view: "shopping" as const },
    { icon: Settings, label: "Preferences", view: "preferences" as const },
    { icon: Info, label: "About Nusa Culinary", view: "about" as const },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 bg-surface text-on-surface flex flex-col md:flex-row">
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-container-low border-r border-outline-variant/10 h-screen sticky top-0 z-30 shrink-0">
        <div className="p-8 border-b space-y-6 border-outline-variant/10">
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-on-surface">Nusa</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Culinary Arts</p>
          </div>

          <button 
            onClick={() => {
              setViewingProfileId(null);
              setCurrentView("profile");
            }}
            className="w-full flex items-center gap-4 p-4 rounded-4xl bg-surface-container-high hover:bg-primary transition-all duration-300 group shadow-sm text-left"
          >
            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border-2 border-outline-variant/10 group-hover:border-white/20 transition-colors overflow-hidden">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt={user.user_metadata?.full_name || ""} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-5 h-5 text-primary group-hover:text-primary-container" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-xs text-on-surface group-hover:text-white truncate">
                {user?.user_metadata?.full_name || "Guest Explorer"}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-primary group-hover:text-white/80">
                {isGuest ? "Sign In" : "View Profile"}
              </p>
            </div>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6">
          <div className="px-4 space-y-1.5">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setViewingProfileId(null);
                  if (item.view) {
                    setCurrentView(item.view);
                    if (item.view === "home") setActiveCategory("All");
                  } else if (item.onClick) {
                    item.onClick();
                  }
                }}
                className={`w-full flex items-center gap-4 px-6 py-3 rounded-2xl transition-all duration-300 group ${
                  item.view === currentView 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
              >
                <item.icon className={`w-4 h-4 ${item.view === currentView ? "text-white" : "text-outline group-hover:text-primary"}`} />
                <span className="font-bold text-xs">{t(item.label)}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-6 border-t space-y-4 border-outline-variant/10 bg-surface-container-lowest">
          {!isGuest ? (
            <button 
              onClick={() => {
                logout();
                addToast("Signed out successfully", "info");
              }}
              className="w-full flex items-center justify-between px-6 py-3.5 rounded-2xl transition-all group bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            >
              <span className="font-bold text-xs">Sign Out</span>
              <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-between px-6 py-3.5 rounded-2xl transition-all group bg-primary text-white shadow-lg shadow-primary/20"
            >
              <span className="font-bold text-xs">Sign In</span>
              <User className="w-4 h-4" />
            </button>
          )}
          <p className="text-[9px] text-center text-outline font-medium">v2.0.0 • Supabase Powered ❤️</p>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Bar - Only on Main Pages */}
        {currentView !== "detail" && (
          <header className="sticky top-0 z-40 backdrop-blur-xl border-b bg-surface/70 border-outline-variant/10">
            <div className="flex justify-between items-center px-6 h-16">
              <h1 className="text-xl font-black text-on-surface md:hidden">Nusa Culinary</h1>
              <h1 className="text-xl font-black text-on-surface hidden md:block capitalize">
                {currentView === "home" ? t("Explore") : 
                 currentView === "saved" ? t("Saved Collection") :
                 currentView === "my-recipes" ? t("My Shared Recipes") :
                 currentView === "shopping" ? t("Market List") :
                 currentView === "preferences" ? t("Preferences") :
                 currentView === "about" ? t("About Nusa Culinary") : t("Profile")}
              </h1>

              {/* Unified Desktop Search Bar */}
              <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-6">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (currentView !== "home") setCurrentView("home");
                    }}
                    placeholder={t("Search recipes, ingredients, regions...")}
                    className="w-full h-10 pl-11 pr-10 bg-surface-container-high rounded-full outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold transition-all border border-outline-variant/10 text-on-surface placeholder:text-on-surface-variant/70"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary hover:text-primary/80 transition-colors"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Search Toggle Button */}
              <div className="flex items-center gap-2 md:hidden">
                <button 
                  onClick={() => setIsSearchVisible(!isSearchVisible)}
                  className={`p-2 rounded-full active:scale-95 transition-all ${isSearchVisible ? 'bg-primary text-white' : 'hover:bg-surface-container text-on-surface'}`}
                  aria-label="Toggle search"
                >
                  <Search className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <AnimatePresence>
              {isSearchVisible && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-4 overflow-hidden md:hidden"
                >
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input 
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (currentView !== "home") setCurrentView("home");
                      }}
                      placeholder={t("Search recipes, ingredients, regions...")}
                      className="w-full h-11 pl-12 pr-4 bg-surface-container-high rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-base md:text-sm text-on-surface placeholder:text-on-surface-variant/70"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-primary"
                      >
                        CLEAR
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>
        )}

        {/* Main Content Area */}
        <main className={`max-w-5xl mx-auto px-4 sm:px-6 pb-28 md:pb-12 ${currentView === "detail" ? "pt-0" : "pt-6"}`}>
        <AnimatePresence mode="wait">
          {currentView === "home" && (
            <HomeView 
              onRecipeClick={handleRecipeClick} 
              savedIds={savedIds} 
              onToggleSave={toggleSave}
              initialCategory={activeCategory}
              dietaryPreference={preferences.selectedDiet}
              recipes={allRecipes}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isLoading={recipesLoading}
            />
          )}
          {currentView === "saved" && (
            <SavedRecipesView 
              onRecipeClick={handleRecipeClick} 
              savedIds={savedIds} 
              onToggleSave={toggleSave}
              onExplore={() => {
                setActiveCategory("All");
                setCurrentView("home");
              }}
              recipes={allRecipes}
            />
          )}
          {currentView === "my-recipes" && (
            <MyRecipesView 
              onRecipeClick={handleRecipeClick} 
              savedIds={savedIds} 
              onToggleSave={toggleSave}
              onShare={() => {
                if (isGuest) {
                  addToast("Please login to share recipes", "info");
                  setCurrentView("profile");
                } else {
                  setIsVisibleAddModal(true);
                }
              }}
              recipes={allRecipes}
            />
          )}

          {currentView === "preferences" && (
            <PreferencesView 
              initialPreferences={{
                ...preferences,
                language: language
              }}
              onApply={(newPrefs) => {
                if (newPrefs.language) {
                  setLanguage(newPrefs.language);
                }
                setPreferences(newPrefs);
                addToast(t("Preferences updated successfully"));
                setCurrentView("home");
              }}
              onCancel={() => setCurrentView("home")}
            />
          )}
          {currentView === "shopping" && (
            <ShoppingView 
              items={shoppingList}
              onToggleCheck={async (id) => {
                const item = shoppingList.find(i => i.id === id);
                if (item) {
                  setShoppingList(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
                  if (user) {
                    await api.updateShoppingItem(id, { checked: !item.checked });
                  }
                }
              }}
              onRemove={async (id) => {
                setShoppingList(prev => prev.filter(i => i.id !== id));
                if (user) {
                  await api.deleteShoppingItem(id);
                }
              }}
              onClearChecked={async () => {
                setShoppingList(prev => prev.filter(i => !i.checked));
                if (user) {
                  await api.clearCheckedItems(user.id);
                }
                addToast("Completed items cleared");
              }}
              onAddCustomItem={async (name) => {
                if (user) {
                  const newItem = await api.addShoppingItem(user.id, name, "Custom item");
                  if (newItem) {
                    setShoppingList(prev => [...prev, newItem]);
                    addToast(`Added ${name}`);
                  }
                } else {
                  setShoppingList(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name, detail: "Custom item", checked: false }]);
                  addToast(`Added ${name}`);
                }
              }}
              onBack={() => setCurrentView("home")}
              darkMode={preferences.darkMode}
            />
          )}
          {currentView === "about" && (
            <AboutView />
          )}
          {currentView === "profile" && (
            <ProfileView 
              savedCount={savedIds.length}
              shoppingCount={shoppingList.length}
              recipes={allRecipes}
              onNavigate={(view) => {
                setViewingProfileId(null);
                setCurrentView(view);
              }}
              viewingUserId={viewingProfileId}
              onBackToRecipe={() => {
                setViewingProfileId(null);
                if (previousView) {
                  setCurrentView(previousView);
                } else {
                  setCurrentView("home");
                }
              }}
              onRecipeClick={(recipe) => {
                setSelectedRecipe(recipe);
                setCurrentView("detail");
              }}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Recipe Detail Overlay */}
      <AnimatePresence>
    {currentView === "detail" && selectedRecipe && (
      <RecipeDetailView 
        recipe={selectedRecipe} 
        onBack={() => setCurrentView("home")} 
        isSaved={savedIds.includes(selectedRecipe.id)}
        onToggleSave={toggleSave}
        onAddIngredient={handleAddIngredient}
        onUpdateRecipe={updateRecipe}
        onDeleteRecipe={handleDeleteRecipe}
        onEditRecipe={(recipe) => setEditingRecipe(recipe)}
        addToast={addToast}
        soundEnabled={preferences.soundEnabled}
        onViewProfile={(authorId) => {
          setViewingProfileId(authorId);
          setPreviousView(currentView);
          setCurrentView("profile");
        }}
      />
    )}
      </AnimatePresence>

      {/* AI Chat FAB */}
      <button 
        onClick={() => setIsAIChatOpen(!isAIChatOpen)}
        className={`fixed ${currentView === "detail" ? "bottom-6" : "bottom-24"} md:bottom-8 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90 hover:shadow-xl z-80 ${
          isAIChatOpen 
            ? 'bg-surface-container-highest text-primary rotate-90' 
            : 'bg-primary text-on-primary'
        }`}
      >
        {isAIChatOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-7 h-7" />}
      </button>

      {/* AI Chatbot Component */}
      <AIChatbot 
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        isBottomBarVisible={currentView !== "detail"}
      />

      {/* Add Recipe Modal */}
      <AnimatePresence>
        {isVisibleAddModal && (
          <AddRecipeModal 
            onClose={() => setIsVisibleAddModal(false)} 
            onAdd={handleAddRecipe}
            darkMode={preferences.darkMode}
          />
        )}
      </AnimatePresence>

      {/* Edit Recipe Modal */}
      <AnimatePresence>
        {editingRecipe && (
          <AddRecipeModal 
            recipe={editingRecipe}
            onClose={() => setEditingRecipe(null)} 
            onAdd={handleUpdateRecipeFull}
            darkMode={preferences.darkMode}
          />
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-100 flex flex-col gap-2 w-full max-w-xs px-4">
        <AnimatePresence>
          {toasts.map(toast => (
            <NotificationToast 
              key={toast.id}
              {...toast}
              onClose={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Scroll-to-Top Button */}
      <AnimatePresence>
        {showScrollTop && currentView !== "detail" && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-40 right-6 w-12 h-12 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center transition-all hover:bg-primary/95 active:scale-95 z-80"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom Navigation - Mobile Only */}
      {currentView !== "detail" && (
        <nav className="fixed bottom-0 left-0 w-full h-20 backdrop-blur-xl flex justify-around items-center px-4 pb-4 z-40 rounded-t-3xl shadow-[0_-8px_24px_rgba(148,74,0,0.08)] transition-colors duration-500 bg-surface-container/80 border-t border-outline-variant/10 md:hidden">
          <button 
            onClick={() => {
              setViewingProfileId(null);
              setActiveCategory("All");
              setCurrentView("home");
            }}
            className={`flex flex-col items-center justify-center px-3 py-1 transition-all duration-300 rounded-full ${currentView === "home" ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <Compass className={`w-5 h-5 ${currentView === "home" ? 'fill-current' : ''}`} />
            <span className="font-bold text-[9px] uppercase tracking-wider mt-1">{t("Explore")}</span>
          </button>
          <button 
            onClick={() => {
              setViewingProfileId(null);
              setCurrentView("saved");
            }}
            className={`relative flex flex-col items-center justify-center px-3 py-1 transition-all duration-300 rounded-full ${currentView === "saved" ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <div className="relative">
              <Bookmark className={`w-5 h-5 ${currentView === "saved" ? 'fill-current' : ''}`} />
              {savedIds.length > 0 && <span className="badge-counter">{savedIds.length}</span>}
            </div>
            <span className="font-bold text-[9px] uppercase tracking-wider mt-1">{t("Saved Collection")}</span>
          </button>
          <button 
            onClick={() => {
              setViewingProfileId(null);
              if (isGuest) {
                addToast("Please login to see your recipes", "info");
                setCurrentView("profile");
              } else {
                setCurrentView("my-recipes");
              }
            }}
            className={`flex flex-col items-center justify-center px-3 py-1 transition-all duration-300 rounded-full ${currentView === "my-recipes" ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <ChefHat className={`w-5 h-5 ${currentView === "my-recipes" ? 'fill-current' : ''}`} />
            <span className="font-bold text-[9px] uppercase tracking-wider mt-1">{t("My Recipes")}</span>
          </button>
          <button 
            onClick={() => {
              setViewingProfileId(null);
              setCurrentView("shopping");
            }}
            className={`relative flex flex-col items-center justify-center px-3 py-1 transition-all duration-300 rounded-full ${currentView === "shopping" ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <div className="relative">
              <ShoppingBag className={`w-5 h-5 ${currentView === "shopping" ? 'fill-current' : ''}`} />
              {shoppingList.length > 0 && <span className="badge-counter">{shoppingList.length}</span>}
            </div>
            <span className="font-bold text-[9px] uppercase tracking-wider mt-1">{t("Market List")}</span>
          </button>
          <button 
            onClick={() => {
              setViewingProfileId(null);
              setCurrentView("profile");
            }}
            className={`flex flex-col items-center justify-center px-3 py-1 transition-all duration-300 rounded-full ${currentView === "profile" ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <User className={`w-5 h-5 ${currentView === "profile" ? 'fill-current' : ''}`} />
            <span className="font-bold text-[9px] uppercase tracking-wider mt-1">{t("Profile")}</span>
          </button>
        </nav>
      )}
      </div>
    </div>
  );
}
