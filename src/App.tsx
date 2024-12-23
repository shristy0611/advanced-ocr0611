import { useState } from 'react';
import { WelcomePage } from './components/WelcomePage';
import { ImageUploader } from './components/ImageUploader';
import { setAPILanguage } from './services/gemini';

type Language = 'en' | 'ja';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [userName, setUserName] = useState<string | null>(null);

  const handleLanguageSelect = (selectedLanguage: Language, name: string) => {
    setLanguage(selectedLanguage);
    setUserName(name);
    setAPILanguage(selectedLanguage);
  };

  if (!userName) {
    return <WelcomePage onLanguageSelect={handleLanguageSelect} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            {language === 'ja' ? 
              `${userName}さん、ようこそ！` : 
              `Welcome, ${userName}!`}
          </h1>
        </header>
        <ImageUploader language={language} />
      </div>
    </div>
  );
}