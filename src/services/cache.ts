import { AnalysisResult } from './types';

const CACHE_PREFIX = 'ocr_cache_';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface CacheEntry {
  result: AnalysisResult;
  timestamp: number;
  language: string;
}

export async function calculateImageHash(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as ArrayBuffer;
      const array = new Uint8Array(content);
      let hash = 0;
      
      for (let i = 0; i < array.length; i++) {
        hash = ((hash << 5) - hash) + array[i];
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      resolve(Math.abs(hash).toString(16));
    };
    reader.readAsArrayBuffer(file);
  });
}

export function getCachedResult(hash: string, language: string): AnalysisResult | null {
  try {
    const cacheKey = `${CACHE_PREFIX}${hash}_${language}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const entry: CacheEntry = JSON.parse(cached);
    
    // Check if cache has expired
    if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return entry.result;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

export function setCachedResult(hash: string, result: AnalysisResult, language: string): void {
  try {
    const cacheKey = `${CACHE_PREFIX}${hash}_${language}`;
    const entry: CacheEntry = {
      result,
      timestamp: Date.now(),
      language
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(entry));
    
    // Clean up old cache entries
    cleanupOldCache();
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
}

function cleanupOldCache(): void {
  try {
    const now = Date.now();
    
    // Get all keys from localStorage that start with our prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry: CacheEntry = JSON.parse(cached);
            if (now - entry.timestamp > CACHE_EXPIRY) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // If we can't parse the entry, remove it
          localStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning cache:', error);
  }
}

export function clearAllCache(): void {
  try {
    // Get all keys from localStorage that start with our prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}
