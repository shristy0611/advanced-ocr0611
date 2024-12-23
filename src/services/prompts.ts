export const ANALYSIS_PROMPT = `Please analyze this image and respond in English only.
Return your response in this exact JSON format, keeping all field names in English:

{
  "description": "",  // Main description
  "text": "",        // All visible text
  "tables": [],      // Table data as arrays
  "graphs": [],      // Graph descriptions
  "objects": [],     // List of objects
  "analysis": []     // Key insights
}

Rules:
1. Use English only
2. Keep JSON structure exact
3. Translate any non-English text
4. Use empty arrays [] for missing data
5. Use empty string "" for missing text`;

export const ANALYSIS_PROMPT_JA = `この画像を分析し、日本語でのみ応答してください。
以下の正確なJSON形式で応答してください。フィールド名は英語のままにしてください：

{
  "description": "",  // メインの説明
  "text": "",        // 見えるテキストすべて
  "tables": [],      // テーブルデータ
  "graphs": [],      // グラフの説明
  "objects": [],     // オブジェクトリスト
  "analysis": []     // 重要な洞察
}

ルール：
1. 日本語のみを使用
2. JSON構造を正確に維持
3. 英語のテキストを翻訳
4. データがない場合は空配列[]を使用
5. テキストがない場合は空文字列""を使用`;