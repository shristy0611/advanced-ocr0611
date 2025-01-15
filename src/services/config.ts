type SupportedMimeType = 'image/jpeg' | 'image/png' | 'image/webp';

export const CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as SupportedMimeType[],
  API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  MODEL_NAME: 'gemini-1.5-flash'
} as const;

export function validateApiKey(): void {
  if (!CONFIG.API_KEY) {
    throw new Error('Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your .env file.');
  }
  
  if (CONFIG.API_KEY.length < 30) {
    throw new Error('Invalid Gemini API key format. Please check your API key.');
  }
}