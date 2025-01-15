import { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { setAPILanguage } from './services/gemini';

type Language = 'en' | 'ja';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');

  const handleLanguageChange = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    setAPILanguage(selectedLanguage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            {language === 'ja' ? 'OCRアプリケーション' : 'OCR Application'}
          </h1>
          <div className="mt-4">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </header>
        <ImageUploader language={language} />
      </div>
    </div>
  );
}