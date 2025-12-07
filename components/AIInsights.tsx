import React, { useState } from 'react';
import { Transaction, Debt } from '../types';
import { analyzeFinances } from '../services/geminiService';
import { Brain, RefreshCcw, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIInsightsProps {
  transactions: Transaction[];
  debts: Debt[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ transactions, debts }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const result = await analyzeFinances(transactions, debts, currentMonth);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="animate-fade-in bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Brain className="text-indigo-600" /> AI Financial Advisor
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Get personalized insights and actionable advice on your budget.
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || (transactions.length === 0 && debts.length === 0)}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
            loading || (transactions.length === 0 && debts.length === 0)
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
          }`}
        >
          {loading ? (
            <RefreshCcw className="animate-spin" size={18} />
          ) : (
            <Sparkles size={18} />
          )}
          {loading ? 'Analyzing...' : 'Generate Insights'}
        </button>
      </div>

      <div className="p-8 min-h-[300px] bg-slate-50">
        {analysis ? (
          <div className="prose prose-indigo max-w-none prose-p:text-gray-700 prose-headings:text-gray-800 prose-li:text-gray-700">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
               <Brain size={32} className="text-indigo-200" />
            </div>
            <p className="max-w-md">
              Tap "Generate Insights" to let Gemini analyze your spending patterns, debts, and savings opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;