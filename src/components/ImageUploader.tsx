import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import { analyzeImage } from '../services/gemini';
import type { AnalysisResult as AnalysisResultType } from '../services/types';
import { AnalysisResult } from './AnalysisResult';

interface ImageUploaderProps {
  language: 'en' | 'ja';
}

const texts = {
  en: {
    dragDrop: 'Drag and drop an image here, or click to select',
    analyzing: 'Analyzing image...',
    error: 'Error occurred while analyzing the image'
  },
  ja: {
    dragDrop: '画像をドラッグ＆ドロップ、またはクリックして選択',
    analyzing: '画像を分析中...',
    error: '画像の分析中にエラーが発生しました'
  }
};

export function ImageUploader({ language }: ImageUploaderProps) {
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={isLoading} />
        <div className="flex flex-col items-center justify-center gap-4">
          {isLoading ? (
            <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          <p className="text-lg text-gray-600">
            {isLoading ? t.analyzing : t.dragDrop}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {selectedImage && !isLoading && !error && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <img
            src={selectedImage}
            alt="Uploaded"
            className="max-h-96 mx-auto object-contain"
          />
        </div>
      )}

      {result && (
        <AnalysisResult 
          result={result} 
          language={language}
          isCached={isCached}
        />
      )}
    </div>
  );
}