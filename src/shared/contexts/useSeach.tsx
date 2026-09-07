import React, { createContext, useContext, useState, useCallback } from "react";

interface SearchContextType {
  isSearchOpen: boolean;
  toggleSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = useCallback(() => setIsSearchOpen((prev) => !prev), []);
  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  return (
    <SearchContext.Provider
      value={{ isSearchOpen, toggleSearch, openSearch, closeSearch }}
    >
      {children}
      {/* Tutaiweka Modal hapa hapa ili isambae mfumo mzima */}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch lazima itumike ndani ya SearchProvider");
  }
  return context;
}