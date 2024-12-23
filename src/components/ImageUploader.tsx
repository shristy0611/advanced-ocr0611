import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  isLoading: boolean;
  language: 'en' | 'ja';
}

interface AnalysisResult {
  // Add the properties of the AnalysisResult type here
}

const texts = {
  en: {
    dragDrop: 'Drag and drop an image here, or click to select',
    dragActive: 'Drop the image here...',
    supportedFormats: 'Supports PNG, JPG, JPEG, GIF, BMP'
  },
  ja: {
    dragDrop: '画像をドラッグ＆ドロップ、またはクリックして選択',
    dragActive: 'ここに画像をドロップしてください...',
    supportedFormats: '対応フォーマット：PNG、JPG、JPEG、GIF、BMP'
  }
};

const analyzeImage = async (file: File): Promise<AnalysisResult> => {
  // Implement the image analysis logic here
  // For demonstration purposes, a dummy implementation is provided
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ /* dummy analysis result */ });
    }, 1000);
  });
};

interface AnalysisResultProps {
  result: AnalysisResult;
  language: 'en' | 'ja';
  isCached: boolean;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, language, isCached }) => {
  // Implement the AnalysisResult component here
  // For demonstration purposes, a dummy implementation is provided
  return (
    <div>
      <p>Analysis Result:</p>
      <p>Is Cached: {isCached ? 'Yes' : 'No'}</p>
    </div>
  );
};

export function ImageUploader({ onImageSelect, isLoading, language }: ImageUploaderProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    },
    multiple: false,
    disabled: isLoading
  });

  const t = texts[language];

  return (
    <div
      {...getRootProps()}
      className={`w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} disabled={isLoading} />
      <div className="flex flex-col items-center justify-center space-y-4">
        <Upload className="w-12 h-12 text-gray-400" />
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            {isDragActive ? t.dragActive : t.dragDrop}
          </p>
          <p className="text-xs text-gray-500">
            {t.supportedFormats}
          </p>
        </div>
      </div>
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