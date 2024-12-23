export interface AnalysisResult {
  description: string;
  text: string;
  tables: string[][];
  graphs: string[];
  objects: string[];
  analysis: string[];
}

export interface GenerativePart {
  inlineData: {
    data: string;
    mimeType: string;
  }
}