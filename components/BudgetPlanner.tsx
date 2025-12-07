import React, { useState, useMemo } from 'react';
import { Transaction, Debt, Budget, TRANSACTION_CATEGORIES } from '../types';
import { Target, TrendingUp, AlertCircle, Save, Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface BudgetPlannerProps {
  transactions: Transaction[];
  debts: Debt[];
  budgets: Budget[];
  onUpdateBudget: (category: string, limit: number) => void;
}

const BudgetPlanner: React.FC<BudgetPlannerProps> = ({ transactions, debts, budgets, onUpdateBudget }) => {
  // Default to current month YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Editing state for categories
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  // Filter out income-specific categories for budgeting
  const expenseCategories = useMemo(() => 
    TRANSACTION_CATEGORIES.filter(c => !['Salary', 'Freelance'].includes(c)), 
  []);

  // --- Derived Data for Selected Month ---
  const monthData = useMemo(() => {
    const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
    
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = income - expense;

    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    return { income, expense, savings, expensesByCategory };
  }, [transactions, selectedMonth]);

  // --- Derived Data for Debts (All time) ---
  const debtData = useMemo(() => {
    const iOwe = debts
      .filter(d => d.type === 'i_owe' && !d.isPaid)
      .reduce((sum, d) => sum + d.amount, 0);
    
    const owesMe = debts
      .filter(d => d.type === 'owe_me' && !d.isPaid)
      .reduce((sum, d) => sum + d.amount, 0);

    return { iOwe, owesMe };
  }, [debts]);

  // --- Handlers ---
  const handleMonthChange = (offset: number) => {
    const date = new Date(selectedMonth + "-01");
    date.setMonth(date.getMonth() + offset);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const startEditing = (category: string, currentLimit: number) => {
    setEditingCategory(category);
    setEditAmount(currentLimit.toString());
  };

  const saveBudget = (category: string) => {
    const limit = parseFloat(editAmount);
    if (!isNaN(limit) && limit >= 0) {
      onUpdateBudget(category, limit);
    }
    setEditingCategory(null);
  };

  const getCategoryLimit = (cat: string) => {
    return budgets.find(b => b.category === cat)?.limit || 0;
  };

  // Format month for display
  const formattedMonth = new Date(selectedMonth + "-01").toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Month Selector */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">{formattedMonth}</h2>
        </div>
        <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Saved */}
        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
          <p className="text-sm font-medium text-indigo-600 mb-1">Total Savings (Income - Expenses)</p>
          <p className={`text-2xl font-bold ${monthData.savings >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>
            ₹{monthData.savings.toLocaleString()}
          </p>
          <p className="text-xs text-indigo-400 mt-2">
             Income: ₹{monthData.income.toLocaleString()} | Expense: ₹{monthData.expense.toLocaleString()}
          </p>
        </div>

        {/* Debt: I Owe */}
        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
          <p className="text-sm font-medium text-red-600 mb-1">Total I Owe Others</p>
          <p className="text-2xl font-bold text-red-700">₹{debtData.iOwe.toLocaleString()}</p>
          <p className="text-xs text-red-400 mt-2">Pending payables</p>
        </div>

        {/* Debt: Owes Me */}
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
          <p className="text-sm font-medium text-emerald-600 mb-1">Total Others Owe Me</p>
          <p className="text-2xl font-bold text-emerald-700">₹{debtData.owesMe.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 mt-2">Pending receivables</p>
        </div>
      </div>

      {/* Budget List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Target size={20} className="text-indigo-600" />
              Category Budgets
            </h3>
            <p className="text-sm text-gray-500">Set limits and track spending per category</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {expenseCategories.map(cat => {
            const limit = getCategoryLimit(cat);
            const spent = monthData.expensesByCategory[cat] || 0;
            const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const isOverBudget = limit > 0 && spent > limit;

            return (
              <div key={cat} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isOverBudget ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isOverBudget ? <AlertCircle size={20} /> : <TrendingUp size={20} />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{cat}</h4>
                      <p className="text-xs text-gray-500">
                        Spent: <span className={isOverBudget ? 'text-red-600 font-bold' : 'text-gray-800'}>
                          ₹{spent.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {editingCategory === cat ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-24 px-2 py-1 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          autoFocus
                        />
                        <button 
                          onClick={() => saveBudget(cat)}
                          className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-right cursor-pointer group" onClick={() => startEditing(cat, limit)}>
                        <p className="text-sm font-medium text-gray-600 group-hover:text-indigo-600 flex items-center justify-end gap-1">
                          Target: ₹{limit.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full transition-all duration-500 rounded-full ${
                      isOverBudget ? 'bg-red-500' : spent > limit * 0.8 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {limit > 0 && (
                  <p className="text-xs text-right mt-1 text-gray-400">
                    {Math.round(percentage)}% used
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;