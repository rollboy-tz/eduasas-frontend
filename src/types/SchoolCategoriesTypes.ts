export type SchoolEducationLevel = 
  | 'PRIMARY' 
  | 'O-LEVEL' 
  | 'A-LEVEL' 
  | 'COLLEGE' 
  | 'UNIVERSITY';

export interface SchoolCategory {
    id: string;
    name: string;
    levelOrder: number;
    slug: SchoolEducationLevel;
    description: string | null;
    createdAt: string;
  }
  
  // Inatumika kuelezea state ya store ya categories
  export interface SchoolCategoriesState {
    categories: SchoolCategory[];
    isLoading: boolean;
    error: string | null;
  }