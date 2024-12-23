import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { fileToGenerativePart } from './imageUtils';
import { validateImageFile, ValidationError } from './validation';
import { CONFIG, validateApiKey } from './config';
import { ANALYSIS_PROMPT, ANALYSIS_PROMPT_JA } from './prompts';
import type { AnalysisResult } from './types';

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
  currentLanguage = language;
}

const logError = (stage: string, error: any, details?: any) => {
  console.error(`Error at ${stage}:`, error);
  if (details) {
    console.error('Additional details:', details);
  }
};

const extractJsonFromText = (text: string): string => {
  try {
    // First try to find a JSON object with our expected fields
    const jsonRegex = /{[\s\S]*?"description"[\s\S]*?"text"[\s\S]*?"tables"[\s\S]*?"graphs"[\s\S]*?"objects"[\s\S]*?"analysis"[\s\S]*?}/;
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
    tables: [],
    graphs: [],
    objects: [],
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
      description: typeof result.description === 'string' ? result.description.trim() : '',
      text: typeof result.text === 'string' ? result.text.trim() : '',
      tables: Array.isArray(result.tables) 
        ? result.tables.map(row => 
            Array.isArray(row) ? row.map(cell => String(cell).trim()) : []
          ).filter(row => row.length > 0)
        : [],
      graphs: Array.isArray(result.graphs)
        ? result.graphs.map(item => String(item).trim()).filter(Boolean)
        : [],
      objects: Array.isArray(result.objects)
        ? result.objects.map(item => String(item).trim()).filter(Boolean)
        : [],
      analysis: Array.isArray(result.analysis)
        ? result.analysis.map(item => String(item).trim()).filter(Boolean)
        : []
    };

    // Verify we have at least some content
    const hasContent = 
      sanitized.description || 
      sanitized.text || 
      sanitized.tables.length > 0 || 
      sanitized.graphs.length > 0 || 
      sanitized.objects.length > 0 || 
      sanitized.analysis.length > 0;

    return hasContent ? sanitized : baseResult;
  } catch (error) {
    console.error('Error sanitizing result:', error);
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
      ...result.objects,
      ...result.graphs,
      ...result.tables.flat()
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
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      validateImageFile(imageFile);

      const model = genAI.getGenerativeModel({ 
        model: CONFIG.MODEL_NAME,
        safetySettings,
        generationConfig: {
          temperature: 0.1,  // Keep temperature low for consistent output
          topK: 16,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      const imagePart = await fileToGenerativePart(imageFile);
      const prompt = currentLanguage === 'ja' ? ANALYSIS_PROMPT_JA : ANALYSIS_PROMPT;
      
      console.log(`Attempt ${attempt} - Analyzing image...`);
      
      const result = await model.generateContent([
        { text: prompt },
        imagePart
      ]);

      const response = result.response;
      const text = response.text();
      
      if (!text) {
        console.warn('Empty response received');
        throw new Error('Empty response from API');
      }

      console.log(`Attempt ${attempt} - Raw response:`, text);

      try {
        // Try direct JSON parsing first
        const jsonResponse = JSON.parse(text);
        const sanitizedResult = validateAndSanitizeResult(jsonResponse);
        
        // Check if we got meaningful content
        const hasContent = 
          sanitizedResult.description || 
          sanitizedResult.text || 
          sanitizedResult.tables.length > 0 || 
          sanitizedResult.objects.length > 0;

        if (!hasContent) {
          console.warn('No meaningful content in response');
          throw new Error('Empty content');
        }

        return sanitizedResult;
      } catch (jsonError) {
        console.warn('Direct JSON parsing failed:', jsonError);

        // Try extracting JSON from text
        const extractedJson = extractJsonFromText(text);
        const jsonResponse = JSON.parse(extractedJson);
        const sanitizedResult = validateAndSanitizeResult(jsonResponse);

        // Check content again
        const hasContent = 
          sanitizedResult.description || 
          sanitizedResult.text || 
          sanitizedResult.tables.length > 0 || 
          sanitizedResult.objects.length > 0;

        if (!hasContent) {
          console.warn('No meaningful content in extracted JSON');
          throw new Error('Empty content');
        }

        return sanitizedResult;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw new Error(currentLanguage === 'ja'
          ? '画像の分析に失敗しました。もう一度お試しください。'
          : 'Image analysis failed. Please try again.');
      }
      
      // Wait before retry, increasing delay with each attempt
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }

  throw lastError || new Error('Unexpected error during analysis');
}