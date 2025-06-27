"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../../lib/i18n"; // Initialize i18n

export type Language = "en" | "fr" | "ar";

const LanguageContext = createContext<
  | {
      currentLanguage: Language;
      changeLanguage: (lang: Language) => void;
      isRTL: boolean;
    }
  | undefined
>(undefined);

const languages = [
  { code: "en" as Language, name: "English" },
  { code: "fr" as Language, name: "Français" },
  { code: "ar" as Language, name: "العربية" },
];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");

  useEffect(() => {
    const lang = i18n.language.slice(0, 2) as Language;
    if (["en", "fr", "ar"].includes(lang)) {
      setCurrentLanguage(lang);
    }

    // Set RTL and document attributes
    const isRTL = lang === "ar";
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [i18n.language]);

  const changeLanguage = (language: Language) => {
    i18n.changeLanguage(language);
    setCurrentLanguage(language);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        isRTL: currentLanguage === "ar",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export { languages };
