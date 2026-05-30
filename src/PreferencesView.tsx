/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { Settings, Moon, Sun, Bell, Volume2, Globe, Heart, Save } from "lucide-react";
import { UserPreferences } from "./App";
import { useLanguage } from "./contexts/LanguageContext";

interface PreferencesViewProps {
  initialPreferences: UserPreferences;
  onApply: (prefs: UserPreferences) => void;
  onCancel: () => void;
}

export default function PreferencesView({ initialPreferences, onApply, onCancel }: PreferencesViewProps) {
  const { t, setLanguage } = useLanguage();
  const [darkMode, setDarkMode] = useState(initialPreferences.darkMode);
  const [notifications, setNotifications] = useState(initialPreferences.notifications);
  const [soundEnabled, setSoundEnabled] = useState(initialPreferences.soundEnabled);
  const [region, setRegion] = useState(initialPreferences.region);
  const [selectedLanguage, setSelectedLanguage] = useState(initialPreferences.language || (initialPreferences.region === "International (English)" ? "en" : "id"));
  
  const dietOptions = ["None", "Vegetarian", "Vegan", "Gluten Free", "Halal"];
  const [selectedDiet, setSelectedDiet] = useState(initialPreferences.selectedDiet);

  const handleApply = () => {
    onApply({
      darkMode,
      notifications,
      soundEnabled,
      region,
      selectedDiet,
      language: selectedLanguage
    });
  };

  const handleLanguageChange = (lang: "id" | "en") => {
    setSelectedLanguage(lang);
    if (lang === "id") {
      setRegion("Indonesia (Bahasa)");
    } else {
      setRegion("International (English)");
    }
  };

  const handleRegionChange = (reg: string) => {
    setRegion(reg);
    if (reg === "International (English)") {
      setSelectedLanguage("en");
    } else {
      setSelectedLanguage("id");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="max-w-2xl mx-auto space-y-10"
    >
      <header className="flex items-center gap-6 mb-12">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-primary/10">
          <Settings className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-on-surface">{t("Preferences")}</h2>
          <p className="text-on-surface-variant font-medium">{t("Personalize your culinary experience")}</p>
        </div>
      </header>

      <section className="space-y-8">
        <div className="p-8 rounded-4xl border shadow-sm space-y-6 bg-surface-container-low border-outline-variant/10">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-outline">{t("Application")}</h3>
          
          {/* Appearance Toggle */}
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl shadow-sm bg-surface-container-lowest text-on-surface">
                {darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
              </div>
              <div>
                <p className="font-bold text-on-surface">{t("Appearance")}</p>
                <p className="text-sm text-on-surface-variant">{t("Switch between light and dark modes")}</p>
              </div>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-14 h-8 rounded-full relative transition-colors duration-300 shrink-0 ${darkMode ? 'bg-primary' : 'bg-outline-variant/30'}`}
            >
              <motion.div 
                animate={{ x: darkMode ? 24 : 4 }}
                className="absolute top-1 w-6 h-6 bg-surface-container-lowest rounded-full shadow-sm"
              />
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between group border-t border-outline-variant/10 pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl shadow-sm bg-surface-container-lowest text-on-surface">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-on-surface">{t("Language")}</p>
                <p className="text-sm text-on-surface-variant">{t("SelectLanguage")}</p>
              </div>
            </div>
            <div className="flex gap-2 bg-surface-container-lowest p-1 rounded-xl border border-outline-variant/10 shrink-0">
              <button
                onClick={() => handleLanguageChange("id")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedLanguage === "id"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                Indonesia
              </button>
              <button
                onClick={() => handleLanguageChange("en")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedLanguage === "en"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between border-t border-outline-variant/10 pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl shadow-sm bg-surface-container-lowest text-on-surface">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-on-surface">{t("Notifications")}</p>
                <p className="text-sm text-on-surface-variant">{t("Daily recipe picks and community updates")}</p>
              </div>
            </div>
            <button 
              onClick={() => setNotifications(!notifications)}
              className={`w-14 h-8 rounded-full relative transition-colors duration-300 shrink-0 ${notifications ? 'bg-primary' : 'bg-outline-variant/30'}`}
            >
              <motion.div 
                animate={{ x: notifications ? 24 : 4 }}
                className="absolute top-1 w-6 h-6 bg-surface-container-lowest rounded-full shadow-sm"
              />
            </button>
          </div>

          {/* Sounds Toggle */}
          <div className="flex items-center justify-between border-t border-outline-variant/10 pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl shadow-sm bg-surface-container-lowest text-on-surface">
                <Volume2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-on-surface">{t("Instruction Sounds")}</p>
                <p className="text-sm text-on-surface-variant">{t("Audio cues during cooking steps")}</p>
              </div>
            </div>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-14 h-8 rounded-full relative transition-colors duration-300 shrink-0 ${soundEnabled ? 'bg-primary' : 'bg-outline-variant/30'}`}
            >
              <motion.div 
                animate={{ x: soundEnabled ? 24 : 4 }}
                className="absolute top-1 w-6 h-6 bg-surface-container-lowest rounded-full shadow-sm"
              />
            </button>
          </div>
        </div>

      </section>

      <div className="flex gap-4">
        <button 
          onClick={handleApply}
          className="flex-1 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <Save className="w-5 h-5" />
          {t("Apply Changes")}
        </button>
        <button 
          onClick={onCancel}
          className="px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
        >
          {t("Cancel")}
        </button>
      </div>
    </motion.div>
  );
}
