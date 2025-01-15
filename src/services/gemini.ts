import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileToGenerativePart } from './imageUtils';
import { validateImageFile } from './validation';
import { CONFIG, validateApiKey } from './config';
import { ANALYSIS_PROMPT, ANALYSIS_PROMPT_JA } from './prompts';
import type { AnalysisResult } from './types';
import { calculateImageHash, getCachedResult, setCachedResult, clearAllCache } from './cache';

validateApiKey();

const genAI = new GoogleGenerativeAI(CONFIG.API_KEY);

let currentLanguage: 'en' | 'ja' = 'en';

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
      menuItems: Array.isArray(result.menuItems) ? result.menuItems.map((item: any) => ({
        name: typeof item?.name === 'string' ? item.name : '',
        price: typeof item?.price === 'string' ? item.price : '',
        description: typeof item?.description === 'string' ? item.description : '',
        category: typeof item?.category === 'string' ? item.category : ''
      })) : [],
      tables: Array.isArray(result.tables) ? result.tables.map((table: any) => ({
        headers: Array.isArray(table?.headers) ? table.headers : [],
        rows: Array.isArray(table?.rows) ? table.rows : []
      })) : [],
      analysis: Array.isArray(result.analysis) ? result.analysis.filter((item: any) => typeof item === 'string') : []
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
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: CONFIG.MODEL_NAME
      });

      const imagePart = await fileToGenerativePart(imageFile);
      const prompt = currentLanguage === 'ja' ? ANALYSIS_PROMPT_JA : ANALYSIS_PROMPT;
      
      console.log('Sending request to Gemini API...');
      const result = await model.generateContent([prompt, imagePart]);

      console.log('Received response from Gemini API');
      const response = result.response;
      const text = response.text();
      
      console.log('Raw API Response:', text);
      
      if (!text) {
        console.error('Empty response from Gemini API');
        throw new Error(currentLanguage === 'ja'
          ? 'APIからの応答が空でした。もう一度お試しください。'
          : 'Empty response from API. Please try again.');
      }

      try {
        // Try direct JSON parsing first
        console.log('Attempting to parse response as JSON');
        let jsonResponse;
        try {
          jsonResponse = JSON.parse(text);
        } catch (parseError) {
          console.log('Direct JSON parsing failed, attempting to extract JSON from text');
          const extractedText = extractJsonFromText(text);
          console.log('Extracted text:', extractedText);
          jsonResponse = JSON.parse(extractedText);
        }
        
        const sanitizedResult = validateAndSanitizeResult(jsonResponse);
        
        // Cache the result before returning
        setCachedResult(imageHash, sanitizedResult, currentLanguage);
        
        return sanitizedResult;
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        console.error('Raw text that failed to parse:', text);
        throw new Error(currentLanguage === 'ja'
          ? 'APIからの応答を解析できませんでした。もう一度お試しください。'
          : 'Could not parse API response. Please try again.');
      }
    } catch (apiError: any) {
      console.error('Gemini API error:', apiError);
      if (apiError.message?.includes('API key not valid')) {
        throw new Error(currentLanguage === 'ja'
          ? 'APIキーが無効です。APIキーを確認してください。'
          : 'Invalid API key. Please check your API key.');
      }
      throw new Error(currentLanguage === 'ja'
        ? 'Gemini APIエラー: ' + (apiError.message || 'Unknown error')
        : 'Gemini API error: ' + (apiError.message || 'Unknown error'));
    }
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    throw new Error(currentLanguage === 'ja'
      ? '画像の分析に失敗しました: ' + (error.message || 'もう一度お試しください。')
      : 'Image analysis failed: ' + (error.message || 'Please try again.'));
  }
}

// Re-export clearAllCache for direct access
export { clearAllCache } from './cache';