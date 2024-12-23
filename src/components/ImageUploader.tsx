import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { analyzeImage } from '../services/gemini';
import { AnalysisResult } from '../services/types';

interface ImageUploaderProps {
  language: 'en' | 'ja';
}

const texts = {
  en: {
    dragDrop: 'Drag and drop an image here, or click to select',
    analyzing: 'Analyzing image...'
  },
  ja: {
    dragDrop: '画像をドラッグ＆ドロップ、またはクリックして選択',
    analyzing: '画像を分析中...'
  }
};

export function ImageUploader({ language }: ImageUploaderProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);

  const handleImageUpload = async (file: File) => {
    setError(null);
    setIsLoading(true);
    setResult(null);
    setIsCached(false);

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
    if (acceptedFiles[0]) {
      handleImageUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const t = texts[language];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4">
          <Upload className="w-12 h-12 text-gray-400" />
          <p className="text-lg text-gray-600">
            {isLoading ? t.analyzing : t.dragDrop}
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8">
          <AnalysisResult 
            result={result} 
            language={language}
            isCached={isCached}
          />
        </div>
      )}
    </div>
  );
}