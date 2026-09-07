// types/school/grading.types.ts

export interface GradingRange {
    id: string;
    gradingRuleId: string;
    grade: string;
    minMark: string;
    maxMark: string;
    points: number | null;
    remark: string;
    isPass: boolean;
  }
  
  export interface CompatibleGradingRule {
    id: string;
    name: string;
    code: string;
    schoolCategory: "PRIMARY" | "O-LEVEL" | "A-LEVEL" | "KINDERGATEN";
    maxScore: number;
    scoringType: "AVERAGE" | "POINTS";
    minPasses: number;
    isDefault: boolean;
    enforceCriteria: boolean;
    createdAt: string;
    ranges: GradingRange[];
  }
  
  export interface GradingStore {
    globalRules: CompatibleGradingRule[];
    isLoading: boolean;
    setGlobalRules: (rules: CompatibleGradingRule[]) => void;
    setLoading: (loading: boolean) => void;
  }