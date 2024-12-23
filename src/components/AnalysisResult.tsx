import React from 'react';
import { FileText, Table, BarChart, Package, Search, Lightbulb } from 'lucide-react';
import type { AnalysisResult as AnalysisResultType } from '../services/types';

interface AnalysisResultProps {
  result: AnalysisResultType | null;
  language: 'en' | 'ja';
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

export function AnalysisResult({ result, language }: AnalysisResultProps) {
  if (!result) return null;

  const t = sectionTitles[language];

  const formatObject = (obj: any): string => {
    if (typeof obj === 'string') return obj;
    try {
      const parsed = typeof obj === 'string' ? JSON.parse(obj) : obj;
      if (language === 'ja') {
        // Format Japanese objects nicely
        if (parsed.name || parsed.price) {
          return `${parsed.name || ''} ${parsed.price || ''}`.trim();
        }
      }
      return JSON.stringify(parsed, null, 2);
    } catch {
      return String(obj);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Description */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">{t.description}</h3>
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">{result.description}</p>
      </div>

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
            {result.objects.map((obj, index) => (
              <li key={index} className="text-gray-700">
                {formatObject(obj)}
              </li>
            ))}
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