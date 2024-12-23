import React from 'react';
import { FileText, Table, BarChart, Package, Search, Lightbulb } from 'lucide-react';
import type { AnalysisResult as AnalysisResultType } from '../services/types';

interface AnalysisResultProps {
  result: AnalysisResultType | null;
  language: 'en' | 'ja';
  isCached?: boolean;
}

const sectionTitles = {
  en: {
    description: 'Overall Description',
    text: 'Extracted Text',
    tables: 'Detected Tables',
    graphs: 'Charts and Graphs',
    objects: 'Detected Objects',
    analysis: 'Additional Insights'
  },
  ja: {
    description: '全体の説明',
    text: '抽出されたテキスト',
    tables: '検出されたテーブル',
    graphs: 'チャートとグラフ',
    objects: '検出されたオブジェクト',
    analysis: '追加の分析'
  }
};

export function AnalysisResult({ result, language, isCached }: AnalysisResultProps) {
  if (!result) return null;

  const t = sectionTitles[language];

  const formatObject = (obj: any): string => {
    try {
      // If it's already a string, try to parse it as JSON
      const parsed = typeof obj === 'string' ? JSON.parse(obj) : obj;
      
      if (language === 'ja' && parsed && typeof parsed === 'object') {
        if (parsed.name) {
          // If there's a description, add it in a smaller font
          if (parsed.description) {
            return parsed.name;  // Only show the name for cleaner display
          }
          // If there's a price, show it
          if (parsed.price) {
            const price = parsed.price.replace('$', '¥');
            return `${parsed.name} ${price}`;
          }
          return parsed.name;
        }
      }
      return typeof obj === 'string' ? obj : JSON.stringify(parsed);
    } catch {
      // If parsing fails, return the original string
      return String(obj);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Cache Indicator */}
      {isCached && (
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>
            {language === 'ja' 
              ? 'キャッシュされた結果を表示しています'
              : 'Showing cached results'}
          </span>
        </div>
      )}

      {/* Description */}
      {result.description && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">{t.description}</h3>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{result.description}</p>
        </div>
      )}

      {/* Text Content */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">{t.text}</h3>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">{result.text}</p>
      </div>

      {/* Tables */}
      {result.tables.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Table className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">{t.tables}</h3>
          </div>
          <div className="overflow-x-auto">
            {result.tables.map((table, tableIndex) => (
              <table key={tableIndex} className="min-w-full divide-y divide-gray-200 mb-4">
                <tbody className="divide-y divide-gray-200">
                  {table.map((cell, cellIndex) => (
                    <tr key={cellIndex}>
                      <td className="px-4 py-2 whitespace-pre-wrap">{cell}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        </div>
      )}

      {/* Graphs */}
      {result.graphs.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">{t.graphs}</h3>
          </div>
          <ul className="list-disc pl-5 space-y-2">
            {result.graphs.map((graph, index) => (
              <li key={index} className="text-gray-700">{graph}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Objects */}
      {result.objects && result.objects.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold">
              {language === 'ja' ? '検出されたオブジェクト' : 'Detected Objects'}
            </h2>
          </div>
          <ul className="list-disc pl-5 space-y-2">
            {result.objects.map((obj, index) => {
              try {
                const parsed = typeof obj === 'string' ? JSON.parse(obj) : obj;
                return (
                  <li key={index} className="text-gray-700">
                    <div className="font-medium">{parsed.name}</div>
                    {parsed.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {parsed.description}
                      </div>
                    )}
                  </li>
                );
              } catch {
                return (
                  <li key={index} className="text-gray-700">
                    {String(obj)}
                  </li>
                );
              }
            })}
          </ul>
        </div>
      )}

      {/* Analysis */}
      {result.analysis.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">{t.analysis}</h3>
          </div>
          <ul className="list-disc pl-5 space-y-2">
            {result.analysis.map((insight, index) => (
              <li key={index} className="text-gray-700">{insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}