import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Transaction, SummaryData } from '../types';
import { ArrowUpRight, ArrowDownLeft, Wallet, PiggyBank } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  summary: SummaryData;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard: React.FC<DashboardProps> = ({ transactions, summary }) => {
  
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categories: Record<string, number> = {};
    expenses.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    return Object.keys(categories).map(key => ({
      name: key,
      value: categories[key]
    }));
  }, [transactions]);

  const monthlyData = useMemo(() => {
     // Simple grouping by date (just using current data for demo)
     const data = [
       { name: 'Income', value: summary.totalIncome },
       { name: 'Expense', value: summary.totalExpense },
       { name: 'Savings', value: Math.max(0, summary.balance) }
     ];
     return data;
  }, [summary]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Income</p>
            <p className="text-2xl font-bold text-emerald-600">₹{summary.totalIncome.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
            <ArrowDownLeft size={24} />
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">₹{summary.totalExpense.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <ArrowUpRight size={24} />
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Current Balance</p>
            <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
              ₹{summary.balance.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-gray-100 rounded-full text-gray-600">
            <Wallet size={24} />
          </div>
        </div>

         {/* Savings Rate Card */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Savings Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {summary.savingsRate.toFixed(1)}%
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <PiggyBank size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Breakdown</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => `₹${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No expense data yet
            </div>
          )}
        </div>

        {/* Financial Overview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Overview</h3>
           <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{fill: 'transparent'}} formatter={(value: number) => `₹${value}`} />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;