import React, { useState, useEffect, useMemo, useRef } from 'react';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import DebtManager from './components/DebtManager';
import AIInsights from './components/AIInsights';
import BudgetPlanner from './components/BudgetPlanner';
import { Transaction, Debt, SummaryData, Budget } from './types';
import { LayoutDashboard, Receipt, Users, BrainCircuit, Menu, X, IndianRupee, Target, Download, Upload, Save } from 'lucide-react';

type Tab = 'dashboard' | 'transactions' | 'debts' | 'budget' | 'ai';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // -- State --
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('rupeeWise_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('rupeeWise_debts');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('rupeeWise_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  // -- Persistence --
  useEffect(() => {
    localStorage.setItem('rupeeWise_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('rupeeWise_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('rupeeWise_budgets', JSON.stringify(budgets));
  }, [budgets]);

  // -- Handlers --
  const handleAddTransaction = (newT: Omit<Transaction, 'id'>) => {
    const t: Transaction = { ...newT, id: crypto.randomUUID() };
    setTransactions(prev => [...prev, t]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAddDebt = (newD: Omit<Debt, 'id' | 'isPaid'>) => {
    const d: Debt = { ...newD, id: crypto.randomUUID(), isPaid: false };
    setDebts(prev => [...prev, d]);
  };

  const handleToggleDebtPaid = (id: string) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, isPaid: !d.isPaid } : d));
  };

  const handleDeleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const handleUpdateBudget = (category: string, limit: number) => {
    setBudgets(prev => {
      const existing = prev.findIndex(b => b.category === category);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { category, limit };
        return updated;
      }
      return [...prev, { category, limit }];
    });
  };

  // -- Data Management (Export/Import) --
  const handleExportData = () => {
    const data = {
      transactions,
      debts,
      budgets,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rupeewise_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.transactions) setTransactions(json.transactions);
        if (json.debts) setDebts(json.debts);
        if (json.budgets) setBudgets(json.budgets);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Invalid file format.');
        console.error(error);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  // -- Computed Summary --
  const summary: SummaryData = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    return { totalIncome, totalExpense, balance, savingsRate };
  }, [transactions]);

  // -- Render Helpers --
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} summary={summary} />;
      case 'transactions':
        return <Transactions transactions={transactions} onAddTransaction={handleAddTransaction} onDeleteTransaction={handleDeleteTransaction} />;
      case 'debts':
        return <DebtManager debts={debts} onAddDebt={handleAddDebt} onTogglePaid={handleToggleDebtPaid} onDeleteDebt={handleDeleteDebt} />;
      case 'budget':
        return <BudgetPlanner transactions={transactions} debts={debts} budgets={budgets} onUpdateBudget={handleUpdateBudget} />;
      case 'ai':
        return <AIInsights transactions={transactions} debts={debts} />;
      default:
        return <Dashboard transactions={transactions} summary={summary} />;
    }
  };

  const NavItem = ({ tab, icon: Icon, label }: { tab: Tab, icon: any, label: string }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        activeTab === tab 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center space-x-2 mb-10 px-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <IndianRupee className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">RupeeWise</h1>
          </div>

          <nav className="space-y-2 flex-1">
            <NavItem tab="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem tab="transactions" icon={Receipt} label="Transactions" />
            <NavItem tab="budget" icon={Target} label="Budget Planner" />
            <NavItem tab="debts" icon={Users} label="Debts & Loans" />
            <NavItem tab="ai" icon={BrainCircuit} label="AI Advisor" />
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="mb-6 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Data Management</p>
              <button 
                onClick={handleExportData}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download size={16} />
                <span>Backup Data</span>
              </button>
              <button 
                onClick={handleImportClick}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Upload size={16} />
                <span>Restore Data</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileImport} 
                accept=".json" 
                className="hidden" 
              />
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl">
              <p className="text-xs text-indigo-600 font-semibold mb-1">PRO TIP</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Download a backup weekly to keep your records safe!
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header (Mobile Only) */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-1.5 rounded-md">
              <IndianRupee className="text-white" size={18} />
            </div>
            <span className="font-bold text-gray-800">RupeeWise</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-bold text-gray-800 capitalize">
                 {activeTab === 'ai' ? 'AI Advisor' : activeTab.replace('-', ' ')}
               </h2>
               <div className="hidden sm:block text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
               </div>
            </div>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;