import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisResult } from './components/AnalysisResult';
import { WelcomePage } from './components/WelcomePage';
import { analyzeImage, setAPILanguage } from './services/gemini';
import { Scan, Loader2 } from 'lucide-react';
import type { AnalysisResult as AnalysisResultType } from './services/types';

type Language = 'en' | 'ja';

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  const handleLanguageSelect = (selectedLanguage: Language, name: string) => {
    setLanguage(selectedLanguage);
    setUserName(name);
    // Set the API language immediately when user selects language
    setAPILanguage(selectedLanguage);
  };

  const handleImageSelect = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setAnalysisResult(null);
      setSelectedImage(URL.createObjectURL(file));
      
      const result = await analyzeImage(file);
      setAnalysisResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : language === 'ja'
          ? '画像分析中に予期せぬエラーが発生しました'
          : 'An unexpected error occurred during image analysis';
      setError(errorMessage);
      console.error('Error analyzing image:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userName) {
    return <WelcomePage onLanguageSelect={handleLanguageSelect} />;
  }

  const texts = {
    en: {
      welcome: 'Welcome',
      title: 'Advanced OCR Analysis',
      subtitle: 'Upload an image to analyze its content',
      loading: 'Analyzing image...',
      error: 'Error',
      tryAgain: 'Please try again'
    },
    ja: {
      welcome: 'ようこそ',
      title: 'OCR画像分析',
      subtitle: '分析する画像をアップロードしてください',
      loading: '画像を分析中...',
      error: 'エラー',
      tryAgain: 'もう一度お試しください'
    }
  };

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">
            {t.welcome}, {userName}!
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-4 text-gray-600">
            {t.subtitle}
          </p>
        </div>

        <ImageUploader 
          onImageSelect={handleImageSelect} 
          isLoading={isLoading}
          language={language}
        />

        {isLoading && (
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
            <p className="mt-2 text-gray-600">{t.loading}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {t.error}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  <p className="mt-1">{t.tryAgain}</p>
                </div>
              </div>
            </div>
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

        {analysisResult && <AnalysisResult result={analysisResult} language={language} />}
      </div>
    </div>
  );
}

export default App;