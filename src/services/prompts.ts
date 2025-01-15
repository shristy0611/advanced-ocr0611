export const ANALYSIS_PROMPT = `Please analyze this image and respond in English only.
Return your response in this exact JSON format, keeping all field names in English:

{
  "description": "Main description of the image",
  "text": "All visible text from the image",
  "menuItems": [
    {
      "name": "Item name",
      "price": "Item price",
      "description": "Item description",
      "category": "Item category"
    }
  ],
  "tables": [
    {
      "headers": ["Column 1", "Column 2"],
      "rows": [["Data 1", "Data 2"]]
    }
  ],
  "analysis": ["Insight 1", "Insight 2"]
}

Rules:
1. Use English only
2. Keep JSON structure exact
3. Translate any non-English text
4. Always pair related information together (e.g., items with their prices)
5. For menu items, always include both name and price when available
6. Group items by their categories (e.g., "Dessert", "Main Course")
7. If information is missing, use empty string ""`;

export const ANALYSIS_PROMPT_JA = `この画像を分析し、日本語でのみ応答してください。
以下の正確なJSON形式で応答してください。フィールド名は英語のままにしてください：

{
  "description": "画像の主な説明",
  "text": "画像から見えるテキストすべて",
  "menuItems": [
    {
      "name": "項目名",
      "price": "価格",
      "description": "説明",
      "category": "カテゴリ"
    }
  ],
  "tables": [
    {
      "headers": ["列1", "列2"],
      "rows": [["データ1", "データ2"]]
    }
  ],
  "analysis": ["分析1", "分析2"]
}

ルール：
1. 日本語のみを使用
2. JSON構造を正確に維持
3. 英語のテキストを翻訳
4. 関連情報は常にペアにする（例：項目と価格）
5. メニュー項目には、可能な限り名前と価格の両方を含める
6. 項目をカテゴリごとにグループ化する（「デザート」、「メインコース」など）
7. 情報が欠落している場合は空文字列""を使用`;