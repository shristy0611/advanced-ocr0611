export const ANALYSIS_PROMPT = `Please analyze this image and respond in English only.
Return your response in this exact JSON format, keeping all field names in English:

{
  "description": "",  // Main description
  "text": "",        // All visible text
  "menuItems": [     // Array of menu items with their details
    {
      "name": "",    // Item name
      "price": "",   // Price (if available)
      "description": "", // Description (if available)
      "category": ""    // Category like "Dessert", "Main Course" etc.
    }
  ],
  "tables": [        // For any tabular data, ensure each row contains related information together
    {
      "headers": [], // Column headers
      "rows": []     // Each row should contain related data (e.g., [item, price, description])
    }
  ],
  "analysis": []     // Key insights
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
  "description": "",  // メインの説明
  "text": "",        // 見えるテキストすべて
  "menuItems": [     // メニュー項目の配列（詳細付き）
    {
      "name": "",    // 項目名
      "price": "",   // 価格（存在する場合）
      "description": "", // 説明（存在する場合）
      "category": ""    // カテゴリ（「デザート」、「メインコース」など）
    }
  ],
  "tables": [        // 表形式データの場合、各行に関連情報をまとめて含める
    {
      "headers": [], // 列見出し
      "rows": []     // 各行は関連データを含む（例：[項目, 価格, 説明]）
    }
  ],
  "analysis": []     // 重要な洞察
}

ルール：
1. 日本語のみを使用
2. JSON構造を正確に維持
3. 英語のテキストを翻訳
4. 関連情報は常にペアにする（例：項目と価格）
5. メニュー項目には、可能な限り名前と価格の両方を含める
6. 項目をカテゴリごとにグループ化する（「デザート」、「メインコース」など）
7. 情報が欠落している場合は空文字列""を使用`;