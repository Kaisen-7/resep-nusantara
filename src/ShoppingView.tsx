/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, ChevronLeft, Trash2, CheckCircle2, Circle, Plus, ListChecks, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { ShoppingItem } from "./types";
import { useLanguage } from "./contexts/LanguageContext";

interface ShoppingViewProps {
  items: ShoppingItem[];
  onToggleCheck: (id: string) => void;
  onRemove: (id: string) => void;
  onClearChecked: () => void;
  onAddCustomItem: (name: string) => void;
  onBack: () => void;
  darkMode?: boolean;
}

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
}

export default function ShoppingView({ 
  items, 
  onToggleCheck, 
  onRemove, 
  onClearChecked, 
  onAddCustomItem,
  onBack,
  darkMode = false 
}: ShoppingViewProps) {
  const { t } = useLanguage();
  const [newItemName, setNewItemName] = React.useState("");
  const [collapsedGroups, setCollapsedGroups] = React.useState<Record<string, boolean>>({});
  const [particles, setParticles] = React.useState<ConfettiParticle[]>([]);
  
  const prevCompletedGroupsRef = React.useRef<string[]>([]);

  // Group items by recipe title
  const groups = React.useMemo(() => {
    const map: Record<string, ShoppingItem[]> = {};
    items.forEach(item => {
      const title = item.recipeTitle || t("Personal List");
      if (!map[title]) {
        map[title] = [];
      }
      map[title].push(item);
    });
    return Object.entries(map).map(([title, list]) => {
      const total = list.length;
      const checked = list.filter(i => i.checked).length;
      const isDone = total > 0 && checked === total;
      const progressPercent = total > 0 ? (checked / total) * 100 : 0;
      return { title, list, total, checked, isDone, progressPercent };
    });
  }, [items]);

  // Trigger confetti burst
  const triggerConfetti = () => {
    const colors = ["#ff5964", "#35a7ff", "#38618c", "#f3c969", "#59cd90", "#e28413", "#c62828", "#cea700", "#e67e22"];
    const newParticles: ConfettiParticle[] = [];
    
    // Spawn centered on screen
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2 - 100;

    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: Math.random() + i,
        x: startX,
        y: startY,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 6,
        angle: Math.random() * 360,
        speed: Math.random() * 7 + 4,
      });
    }
    setParticles(newParticles);
    setTimeout(() => {
      setParticles([]);
    }, 1800);
  };

  // Watch for group completion changes to launch confetti
  React.useEffect(() => {
    const currentCompleted = groups
      .filter(g => g.isDone)
      .map(g => g.title);
    
    // Check if any group newly finished
    const newlyCompleted = currentCompleted.filter(
      title => !prevCompletedGroupsRef.current.includes(title)
    );

    if (newlyCompleted.length > 0 && prevCompletedGroupsRef.current.length > 0) {
      triggerConfetti();
    }
    
    prevCompletedGroupsRef.current = currentCompleted;
  }, [groups]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      onAddCustomItem(newItemName.trim());
      setNewItemName("");
    }
  };

  const toggleGroupCollapse = (title: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const checkedCount = items.filter(i => i.checked).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="max-w-2xl mx-auto pb-16"
    >
      {/* Interactive Confetti overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ 
                x: p.x, 
                y: p.y, 
                scale: 1, 
                opacity: 1,
                rotate: 0 
              }}
              animate={{ 
                x: p.x + Math.cos((p.angle * Math.PI) / 180) * (p.speed * 30),
                y: p.y + Math.sin((p.angle * Math.PI) / 180) * (p.speed * 30) + 180, // fall physics
                scale: 0.3, 
                opacity: 0,
                rotate: p.angle * 3
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                backgroundColor: p.color,
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-full transition-colors hover:bg-surface-container-high text-on-surface shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-black text-on-surface truncate">{t("Market List")}</h2>
            <p className="text-xs sm:text-sm font-medium text-on-surface-variant">
              {items.length} {t("items to pick up")}
            </p>
          </div>
        </div>
        {checkedCount > 0 && (
          <button 
            onClick={onClearChecked}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all active:scale-95 shrink-0"
          >
            {t("Clear Checked")}
          </button>
        )}
      </header>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex items-center gap-3 p-2 rounded-2xl border transition-all focus-within:ring-2 focus-within:ring-primary/20 bg-surface-container-lowest border-outline-variant/10 shadow-sm">
          <input 
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={t("Add custom item...")}
            className="flex-1 px-4 py-2 bg-transparent outline-none font-medium text-on-surface placeholder:text-on-surface-variant text-base md:text-sm"
          />
          <button 
            type="submit"
            disabled={!newItemName.trim()}
            className="p-3 bg-primary text-on-primary rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </form>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-surface-container-low">
            <ShoppingBag className="w-10 h-10 text-outline-variant" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-on-surface">{t("Your list is empty")}</h3>
          <p className="max-w-xs text-sm text-on-surface-variant">
            {t("Explore recipes and add ingredients directly to your list, or add custom items above.")}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            const isCollapsed = !!collapsedGroups[group.title];
            
            return (
              <div 
                key={group.title}
                className={`border border-outline-variant/10 rounded-3xl overflow-hidden transition-all bg-surface-container-low/50 shadow-sm`}
              >
                {/* Group Header Card */}
                <div 
                  onClick={() => toggleGroupCollapse(group.title)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-surface-container-high/40 transition-colors select-none"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className="font-extrabold text-sm text-on-surface truncate">
                        {group.title}
                      </h4>
                      {group.isDone && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-2.5 h-2.5" /> {t("All Got")}
                        </span>
                      )}
                    </div>
                    
                    {/* Progress Bar & Status Text */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full rounded-full ${group.isDone ? 'bg-emerald-500' : 'bg-primary'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${group.progressPercent}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant min-w-[32px] text-right">
                        {group.checked}/{group.total}
                      </span>
                    </div>
                  </div>

                  <button className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors">
                    {isCollapsed ? <ChevronDown className="w-5 h-5 text-outline" /> : <ChevronUp className="w-5 h-5 text-outline" />}
                  </button>
                </div>

                {/* Group Items Accordion */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden bg-surface-container-lowest/60 border-t border-outline-variant/5"
                    >
                      <div className="p-4 space-y-2">
                        {group.list.map((item) => (
                          <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className={`group/item flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                              item.checked 
                                ? 'bg-surface-container-low border-transparent opacity-65'
                                : 'bg-surface-container-lowest border-outline-variant/5 hover:border-outline-variant/10 shadow-xs'
                            }`}
                          >
                            <button 
                              onClick={() => onToggleCheck(item.id)}
                              className={`shrink-0 transition-transform active:scale-90 ${item.checked ? 'text-primary' : 'text-outline-variant'}`}
                            >
                              {item.checked ? (
                                <CheckCircle2 className="w-5 h-5 fill-current" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onToggleCheck(item.id)}>
                              <p className={`font-bold text-xs truncate ${item.checked ? 'line-through text-on-surface/40' : 'text-on-surface'}`}>
                                {item.name}
                              </p>
                              {item.detail && (
                                <p className="text-[10px] font-medium truncate text-on-surface-variant mt-0.5">
                                  {item.detail}
                                </p>
                              )}
                            </div>

                            <button 
                              onClick={() => onRemove(item.id)}
                              className="p-1.5 rounded-full opacity-0 group-hover/item:opacity-100 transition-all hover:bg-secondary/10 text-secondary"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-10 p-6 rounded-4xl border bg-primary/5 border-primary/10 text-primary">
          <div className="flex items-center gap-4 mb-2">
            <ListChecks className="w-6 h-6" />
            <p className="font-black">{t("Total Progress")}</p>
          </div>
          <p className="text-sm font-medium opacity-80">
            {t("You've completed {checked} out of {total} items. Ready to head to the store!")
              .replace("{checked}", String(checkedCount))
              .replace("{total}", String(items.length))}
          </p>
        </div>
      )}
    </motion.div>
  );
}
