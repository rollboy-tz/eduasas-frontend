/**
 * @fileoverview Class Profile Context Engine
 * @description Context inayoweka data ya Class Profile kwa ajili ya sub-routes zote za darasa husika.
 */

import React, { createContext, useContext } from "react";
import { ClassProfile } from "@/types";

interface ClassContextType {
  classProfile?: ClassProfile;
  refreshProfile?: () => void;
  isUpdating?: boolean;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export interface ClassProviderProps {
  children: React.ReactNode;
  value: ClassContextType;
}

/**
 * ### ClassProvider
 * Provider inayozunguka sub-components/routes zote za darasa.
 */
export function ClassProvider({ children, value }: ClassProviderProps) {
  return (
    <ClassContext.Provider value={value}>
      {children}
    </ClassContext.Provider>
  );
}

/**
 * ### useClassContext
 * Hook ya kusoma data ya Class Profile kutoka mahali popote ndani ya sub-routes (`/sections`, `/subjects`, `/students`, etc.).
 */
export function useClassContext(): ClassContextType {
  const context = useContext(ClassContext);
  
  if (!context) {
    throw new Error(
      "useClassContext must be used within a ClassProvider inside the ClassValidationLayout."
    );
  }

  return context;
}