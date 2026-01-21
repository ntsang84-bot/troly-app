
export interface SolutionMethod {
  title: string;
  steps: string[];
  conclusion: string;
}

export interface TheoryPoint {
  formula: string;
  note: string;
}

export interface AnalysisResult {
  problemStatement: string;
  // Bước 1: Phân tích & Lý thuyết (Gộp)
  analysisAndTheory: {
    logic: string[];
    formulas: TheoryPoint[];
  };
  // Bước 2: Giải pháp Tối ưu
  optimalMethod: SolutionMethod;
  // Bước 3: Trình bày Chi tiết
  detailedMethod: SolutionMethod;
  // Bước 4: Lưu ý & Cảnh báo
  summaryNotes: {
    wrong: string;
    right: string;
    tip: string;
  }[];
}

export type AppStatus = 'idle' | 'loading' | 'success' | 'error';

export interface FileData {
  base64?: string;
  mimeType?: string;
  previewUrl?: string;
  name?: string;
}
