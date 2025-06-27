"use client";

import React from "react";
import {
  useLanguage,
  languages,
  type Language,
} from "../providers/LanguageProvider";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <Globe className="h-4 w-4 text-gray-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-32 p-1 space-y-2" align="end">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={currentLanguage === lang.code ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start text-sm"
            onClick={() => changeLanguage(lang.code)}
          >
            {lang.name}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export function LanguageSwitcherDropdown() {
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <select
      value={currentLanguage}
      onChange={(e) => changeLanguage(e.target.value as Language)}
      className="text-sm border rounded px-2 py-1"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
