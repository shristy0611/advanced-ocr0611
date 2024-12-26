export interface MenuItem {
  name: string;
  price: string;
  description: string;
  category: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface AnalysisResult {
  description: string;
  text: string;
  menuItems: MenuItem[];
  tables: TableData[];
  analysis: string[];
}

export interface GenerativePart {
  inlineData: {
    data: string;
    mimeType: string;
  }
}