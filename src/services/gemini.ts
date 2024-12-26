import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { fileToGenerativePart } from './imageUtils';
import { validateImageFile, ValidationError } from './validation';
import { CONFIG, validateApiKey } from './config';
import { ANALYSIS_PROMPT, ANALYSIS_PROMPT_JA } from './prompts';
import type { AnalysisResult } from './types';
import { calculateImageHash, getCachedResult, setCachedResult, clearAllCache } from './cache';

validateApiKey();

const genAI = new GoogleGenerativeAI(CONFIG.API_KEY);

let currentLanguage: 'en' | 'ja' = 'en';

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export function setAPILanguage(language: 'en' | 'ja') {
  if (currentLanguage !== language) {
    currentLanguage = language;
    clearAllCache(); // Clear all cached results when language changes
  }
}

const logError = (stage: string, error: any, details?: any) => {
  console.error(`Error at ${stage}:`, error);
  if (details) {
    console.error('Additional details:', details);
  }
};

const extractJsonFromText = (text: string): string => {
  try {
    // Remove markdown code block syntax and any surrounding whitespace
    text = text.replace(/```json\s*|\s*```/g, '').trim();
    
    // First try to find a JSON object with our expected fields
    const jsonRegex = /{[\s\S]*?"description"[\s\S]*?"text"[\s\S]*?"menuItems"[\s\S]*?"tables"[\s\S]*?"analysis"[\s\S]*?}/;
    const match = text.match(jsonRegex);
    if (match) return match[0];

    // If that fails, try to find any JSON object
    const anyJsonRegex = /{[\s\S]*?}/;
    const anyMatch = text.match(anyJsonRegex);
    if (anyMatch) return anyMatch[0];

    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('Error extracting JSON:', error);
    throw error;
  }
};

const validateAndSanitizeResult = (result: any): AnalysisResult => {
  // Create empty base result
  const baseResult: AnalysisResult = {
    description: '',
    text: '',
    menuItems: [],
    tables: [],
    analysis: []
  };

  try {
    // Ensure we have an object
    if (!result || typeof result !== 'object') {
      console.warn('Invalid result object, using base result');
      return baseResult;
    }

    // Safely extract and convert each field
    const sanitized: AnalysisResult = {
      description: typeof result.description === 'string' ? result.description : '',
      text: typeof result.text === 'string' ? result.text : '',
      menuItems: Array.isArray(result.menuItems) ? result.menuItems.map(item => ({
        name: typeof item?.name === 'string' ? item.name : '',
        price: typeof item?.price === 'string' ? item.price : '',
        description: typeof item?.description === 'string' ? item.description : '',
        category: typeof item?.category === 'string' ? item.category : ''
      })) : [],
      tables: Array.isArray(result.tables) ? result.tables.map(table => ({
        headers: Array.isArray(table?.headers) ? table.headers : [],
        rows: Array.isArray(table?.rows) ? table.rows : []
      })) : [],
      analysis: Array.isArray(result.analysis) ? result.analysis.filter(item => typeof item === 'string') : []
    };

    return sanitized;
  } catch (error) {
    console.warn('Error sanitizing result:', error);
    return baseResult;
  }
};

const hasJapanese = (text: string): boolean => {
  try {
    return /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
  } catch (error) {
    logError('hasJapanese', error, { text });
    return false;
  }
};

const validateLanguage = (result: AnalysisResult): void => {
  try {
    const mainTexts = [
      result.description,
      result.text,
      ...result.analysis,
      ...result.menuItems.map(item => item.name + item.description + item.price + item.category),
      ...result.tables.flatMap(table => table.headers.concat(table.rows.flat()))
    ].filter(Boolean);

    if (mainTexts.length === 0) {
      throw new Error(currentLanguage === 'ja'
        ? 'テキストコンテンツが見つかりません'
        : 'No text content found');
    }

    const containsJapanese = mainTexts.some(text => hasJapanese(text));
    
    // Only validate if we have meaningful content
    if (mainTexts.some(text => text.length > 10)) {
      if (currentLanguage === 'ja' && !containsJapanese) {
        throw new Error('応答が日本語ではありません。再度分析を行います。');
      }
      if (currentLanguage === 'en' && containsJapanese) {
        throw new Error('Response contains Japanese characters. Retrying analysis.');
      }
    }
  } catch (error) {
    logError('validateLanguage', error, { result });
    throw error;
  }
};

export async function analyzeImage(imageFile: File): Promise<AnalysisResult> {
  try {
    validateImageFile(imageFile);

    // Calculate image hash
    const imageHash = await calculateImageHash(imageFile);
    
    // Check cache first
    const cachedResult = getCachedResult(imageHash, currentLanguage);
    if (cachedResult) {
      console.log('Using cached result for image');
      return cachedResult;
    }

    console.log('No cache found, analyzing image...');
    
    const model = genAI.getGenerativeModel({ 
      model: CONFIG.MODEL_NAME,
      safetySettings,
      generationConfig: {
        temperature: 0.1,
        topK: 16,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = currentLanguage === 'ja' ? ANALYSIS_PROMPT_JA : ANALYSIS_PROMPT;
    
    const result = await model.generateContent([
      { text: prompt },
      imagePart
    ]);

    const response = result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('Empty response from API');
    }

    try {
      // Try direct JSON parsing first
      const jsonResponse = JSON.parse(text);
      const sanitizedResult = validateAndSanitizeResult(jsonResponse);
      
      // Cache the result before returning
      setCachedResult(imageHash, sanitizedResult, currentLanguage);
      
      return sanitizedResult;
    } catch (jsonError) {
      console.warn('Direct JSON parsing failed:', jsonError);

      // Try extracting JSON from text
      const extractedJson = extractJsonFromText(text);
      const jsonResponse = JSON.parse(extractedJson);
      const sanitizedResult = validateAndSanitizeResult(jsonResponse);

      // Cache the result before returning
      setCachedResult(imageHash, sanitizedResult, currentLanguage);

      return sanitizedResult;
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error(currentLanguage === 'ja'
      ? '画像の分析に失敗しました。もう一度お試しください。'
      : 'Image analysis failed. Please try again.');
  }
}

// Re-export clearAllCache for direct access
export { clearAllCache } from './cache';