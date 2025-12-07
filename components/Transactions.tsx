import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, TRANSACTION_CATEGORIES } from '../types';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Filter, X } from 'lucide-react';

interface TransactionsProps {
  transactions: Transaction[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, onAddTransaction, onDeleteTransaction }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState(TRANSACTION_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter state
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  // State for success feedback
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    onAddTransaction({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date
    });

    setDescription('');
    setAmount('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterStartDate && t.date < filterStartDate) return false;
      if (filterEndDate && t.date > filterEndDate) return false;
      return true;
    });
  }, [transactions, filterStartDate, filterEndDate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Add Transaction Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Transaction</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    type === 'income' 
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500' 
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <ArrowDownCircle size={16} className="mr-2" /> Income
                </button>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    type === 'expense' 
                      ? 'bg-red-100 text-red-700 border-2 border-red-500' 
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <ArrowUpCircle size={16} className="mr-2" /> Expense
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TRANSACTION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Grocery shopping"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium relative"
            >
              <Plus size={18} className="mr-2" /> Add Transaction
              {showSuccess && (
                <span className="absolute inset-0 flex items-center justify-center bg-green-500 text-white rounded-lg transition-opacity duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Transactions List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-800">History</h3>
          
          {/* Date Range Filter */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500">
               <Filter size={14} />
               <span className="text-xs font-medium">Filter:</span>
            </div>
            <input 
              type="date" 
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="text-xs border-gray-200 rounded px-2 py-1.5 bg-gray-50 focus:bg-white transition-colors outline-none border focus:ring-1 focus:ring-indigo-500"
              placeholder="Start Date"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input 
              type="date" 
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="text-xs border-gray-200 rounded px-2 py-1.5 bg-gray-50 focus:bg-white transition-colors outline-none border focus:ring-1 focus:ring-indigo-500"
              placeholder="End Date"
            />
            {(filterStartDate || filterEndDate) && (
              <button 
                onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
                className="ml-1 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                title="Clear filters"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-400">
              {transactions.length === 0 
                ? "No transactions recorded yet." 
                : "No transactions found in this date range."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Amount</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.slice().reverse().map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{t.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{t.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {t.category}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onDeleteTransaction(t.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;