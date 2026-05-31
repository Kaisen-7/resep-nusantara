/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Info, Globe, Shield, CreditCard, Mail } from "lucide-react";
import { useLanguage } from "./contexts/LanguageContext";

export default function AboutView() {
  const { t } = useLanguage();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-12"
    >
      <header className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Info className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight">{t("About Nusa Culinary")}</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto">{t("Connecting you to the hidden gems of Indonesian cuisine, from the spice islands to the mountain peaks.")}</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 sm:p-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xl text-on-surface">{t("Our Mission")}</h3>
          <p className="text-on-surface-variant leading-relaxed">{t("To preserve and promote traditional Indonesian cooking methods and recipes that have been passed down through generations.")}</p>
        </div>

        <div className="p-6 sm:p-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm space-y-4">
          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-xl text-on-surface">{t("Quality Verified")}</h3>
          <p className="text-on-surface-variant leading-relaxed">{t("Every recipe on our platform is tested by local culinary experts to ensure authenticity and flavor accuracy.")}</p>
        </div>
      </section>

      <section className="p-6 sm:p-8 bg-surface-container-low rounded-[2rem] sm:rounded-[2.5rem] text-on-surface overflow-hidden relative border border-outline-variant/10">
        <div className="relative z-10 space-y-6">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{t("Join the Movement")}</h3>
          <p className="text-on-surface-variant max-w-md">{t("Help us document the thousands of untold recipes from across the archipelago.")}</p>
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-3 bg-primary text-white rounded-full font-bold text-sm transition-transform active:scale-95">{t("Support Us")}</button>
            <button className="px-8 py-3 bg-surface-container-lowest rounded-full font-bold text-sm transition-transform active:scale-95 flex items-center gap-2 border border-outline-variant/10">
              <Mail className="w-4 h-4" />
              {t("Contact Team")}
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32"></div>
      </section>

      <footer className="pt-10 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs text-on-surface-variant font-medium tracking-widest uppercase">© 2026 Nusa Culinary Arts</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <button className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">{t("Privacy Policy")}</button>
          <button className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">{t("Terms of Use")}</button>
          <button className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors uppercase flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            {t("Licenses")}
          </button>
        </div>
      </footer>
    </motion.div>
  );
}
