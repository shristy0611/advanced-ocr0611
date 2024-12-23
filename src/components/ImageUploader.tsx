import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  isLoading: boolean;
  language: 'en' | 'ja';
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

export function ImageUploader({ onImageSelect, isLoading, language }: ImageUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

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
    </div>
  );
}