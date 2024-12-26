import React from 'react';
import { FileText, Table, Search, Lightbulb } from 'lucide-react';
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
    menuItems: 'Menu Items',
    analysis: 'Additional Insights'
  },
  ja: {
    description: '全体の説明',
    text: '抽出されたテキスト',
    tables: '検出されたテーブル',
    menuItems: 'メニュー項目',
    analysis: '追加の分析'
  }
};

export function AnalysisResult({ result, language, isCached }: AnalysisResultProps) {
  if (!result) return null;

  const t = sectionTitles[language];

  return (
    <div className="space-y-6 p-4">
      {isCached && (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-4">
          {language === 'ja' ? 'キャッシュされた結果を表示しています' : 'Showing cached result'}
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

      {/* Extracted Text */}
      {result.text && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">{t.text}</h3>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{result.text}</p>
        </div>
      )}

      {/* Menu Items */}
      {result.menuItems && result.menuItems.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">{t.menuItems}</h3>
          </div>
          <div className="space-y-4">
            {result.menuItems.map((item, index) => (
              <div key={index} className="border-b pb-2 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                    {item.category && (
                      <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                    )}
                  </div>
                  {item.price && (
                    <span className="font-medium text-gray-900">{item.price}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tables */}
      {result.tables && result.tables.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Table className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">{t.tables}</h3>
          </div>
          <div className="overflow-x-auto">
            {result.tables.map((table, tableIndex) => (
              <table key={tableIndex} className="min-w-full divide-y divide-gray-200 mb-4">
                {table.headers.length > 0 && (
                  <thead>
                    <tr>
                      {table.headers.map((header, headerIndex) => (
                        <th key={headerIndex} className="px-4 py-2 bg-gray-50 text-left text-sm font-medium text-gray-500">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-gray-200">
                  {table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-2 whitespace-pre-wrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Insights */}
      {result.analysis && result.analysis.length > 0 && (
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