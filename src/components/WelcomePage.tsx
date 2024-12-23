import React, { useState } from 'react';
import { Languages, Check } from 'lucide-react';

interface WelcomePageProps {
  onLanguageSelect: (language: 'en' | 'ja', name: string) => void;
}

const texts = {
  en: {
    title: 'Welcome to Advanced OCR',
    subtitle: 'Please enter your name to get started',
    placeholder: 'Enter your name',
    button: 'Start',
    language: 'Language',
    selected: 'Selected',
  },
  ja: {
    title: 'OCRアプリへようこそ',
    subtitle: 'お名前を入力してください',
    placeholder: 'お名前',
    button: '開始',
    language: '言語',
    selected: '選択中',
  }
};

export function WelcomePage({ onLanguageSelect }: WelcomePageProps) {
  const [name, setName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ja'>('en');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLanguageSelect(selectedLanguage, name.trim());
    }
  };

  // Detect if input contains Japanese characters
  const detectLanguage = (input: string) => {
    const hasJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(input);
    setSelectedLanguage(hasJapanese ? 'ja' : 'en');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    detectLanguage(newName);
  };

  const handleLanguageClick = (language: 'en' | 'ja') => {
    setSelectedLanguage(language);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-4xl w-full p-8">
        <div className="flex justify-center mb-8">
          <Languages className="h-16 w-16 text-blue-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* English Section */}
          <button
            onClick={() => handleLanguageClick('en')}
            className={`p-8 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl 
              ${selectedLanguage === 'en' 
                ? 'ring-2 ring-blue-500 transform scale-[1.02]' 
                : 'hover:scale-[1.01]'}`}
          >
            <div className="text-center relative">
              {selectedLanguage === 'en' && (
                <div className="absolute -top-4 -right-4 bg-blue-500 text-white rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}
              <h2 className="text-3xl font-bold text-gray-900">
                {texts.en.title}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {texts.en.subtitle}
              </p>
              <p className="mt-4 text-xs text-blue-500 font-medium">
                {selectedLanguage === 'en' ? texts.en.selected : 'Click to select English'}
              </p>
            </div>
          </button>

          {/* Japanese Section */}
          <button
            onClick={() => handleLanguageClick('ja')}
            className={`p-8 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl
              ${selectedLanguage === 'ja' 
                ? 'ring-2 ring-blue-500 transform scale-[1.02]' 
                : 'hover:scale-[1.01]'}`}
          >
            <div className="text-center relative">
              {selectedLanguage === 'ja' && (
                <div className="absolute -top-4 -right-4 bg-blue-500 text-white rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}
              <h2 className="text-3xl font-bold text-gray-900">
                {texts.ja.title}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {texts.ja.subtitle}
              </p>
              <p className="mt-4 text-xs text-blue-500 font-medium">
                {selectedLanguage === 'ja' ? texts.ja.selected : 'クリックして日本語を選択'}
              </p>
            </div>
          </button>
        </div>

        {/* Centered Form */}
        <div className="mt-8 max-w-md mx-auto">
          <form className="space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {texts[selectedLanguage].placeholder}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={`${texts.en.placeholder} / ${texts.ja.placeholder}`}
                value={name}
                onChange={handleNameChange}
              />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-700">
              <span>{texts.en.language}: {selectedLanguage === 'en' ? 'English' : '日本語'}</span>
              <span>{texts.ja.language}: {selectedLanguage === 'en' ? 'English' : '日本語'}</span>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {texts.en.button} / {texts.ja.button}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
