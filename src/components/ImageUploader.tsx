import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, Trash2 } from 'lucide-react';
import { analyzeImage, clearAllCache } from '../services/gemini';
import type { AnalysisResult as AnalysisResultType } from '../services/types';
import { AnalysisResult } from './AnalysisResult';

interface ImageUploaderProps {
  language: 'en' | 'ja';
}

const texts = {
  en: {
    dragDrop: 'Drag and drop an image here, or click to select',
    analyzing: 'Analyzing image...',
    error: 'Error occurred while analyzing the image',
    clearCache: 'Clear Cache',
    cacheCleared: 'Cache cleared successfully'
  },
  ja: {
    dragDrop: '画像をドラッグ＆ドロップ、またはクリックして選択',
    analyzing: '画像を分析中...',
    error: '画像の分析中にエラーが発生しました',
    clearCache: 'キャッシュを削除',
    cacheCleared: 'キャッシュを削除しました'
  }
};

export function ImageUploader({ language }: ImageUploaderProps) {
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCacheClearedMessage, setShowCacheClearedMessage] = useState(false);

  const handleClearCache = () => {
    clearAllCache();
    setShowCacheClearedMessage(true);
    setTimeout(() => setShowCacheClearedMessage(false), 3000); // Hide message after 3 seconds
  };

  const handleImageUpload = async (file: File) => {
    setError(null);
    setIsLoading(true);
    setResult(null);
    setIsCached(false);
    setSelectedImage(URL.createObjectURL(file));

    try {
      const startTime = Date.now();
      const result = await analyzeImage(file);
      const endTime = Date.now();
      
      // If the response was too fast, it was probably cached
      setIsCached(endTime - startTime < 1000);
      setResult(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleImageUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1
  });

  const t = texts[language];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Clear Cache Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleClearCache}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {t.clearCache}
        </button>
      </div>

      {/* Cache Cleared Message */}
      {showCacheClearedMessage && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg text-center">
          {t.cacheCleared}
        </div>
      )}

      {/* Image Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <Upload className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-gray-600">{t.dragDrop}</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t.analyzing}</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Selected Image Preview */}
      {selectedImage && !isLoading && !error && (
        <div className="mt-8">
          <img
            src={selectedImage}
            alt="Selected"
            className="max-h-[300px] mx-auto rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Analysis Result */}
      {result && !isLoading && (
        <div className="mt-8">
          <AnalysisResult result={result} language={language} isCached={isCached} />
        </div>
      )}
    </div>
  );
}