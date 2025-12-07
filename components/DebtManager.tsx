
import React, { useState, useMemo } from 'react';
import { Debt, DebtType } from '../types';
import { UserPlus, CheckCircle, Circle, Trash2, ArrowUpRight, ArrowDownLeft, ChevronDown, ChevronUp, User } from 'lucide-react';

interface DebtManagerProps {
  debts: Debt[];
  onAddDebt: (d: Omit<Debt, 'id' | 'isPaid'>) => void;
  onTogglePaid: (id: string) => void;
  onDeleteDebt: (id: string) => void;
}

const DebtManager: React.FC<DebtManagerProps> = ({ debts, onAddDebt, onTogglePaid, onDeleteDebt }) => {
  const [personName, setPersonName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<DebtType>('i_owe');
  const [dueDate, setDueDate] = useState('');
  
  // State for expanded person card
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName || !amount) return;

    onAddDebt({
      personName,
      description,
      amount: parseFloat(amount),
      type,
      dueDate: dueDate || undefined,
    });

    setPersonName('');
    setDescription('');
    setAmount('');
    setDueDate('');
  };

  const totalOwedByMe = debts.filter(d => d.type === 'i_owe' && !d.isPaid).reduce((acc, curr) => acc + curr.amount, 0);
  const totalOwedToMe = debts.filter(d => d.type === 'owe_me' && !d.isPaid).reduce((acc, curr) => acc + curr.amount, 0);

  // Group debts by person name (case insensitive)
  const groupedDebts = useMemo(() => {
    const groups: Record<string, Debt[]> = {};
    debts.forEach(d => {
      // Normalize name key
      const key = d.personName.trim();
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    return groups;
  }, [debts]);

  const personKeys = Object.keys(groupedDebts).sort();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-red-600 font-medium">Total I Need to Pay</p>
            <p className="text-2xl font-bold text-red-700">₹{totalOwedByMe.toLocaleString()}</p>
          </div>
          <ArrowUpRight className="text-red-400" size={32} />
        </div>
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-600 font-medium">Total Others Owe Me</p>
            <p className="text-2xl font-bold text-emerald-700">₹{totalOwedToMe.toLocaleString()}</p>
          </div>
          <ArrowDownLeft className="text-emerald-400" size={32} />
        </div>
      </div>

      {/* Add Debt Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Record</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('i_owe')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    type === 'i_owe' 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  I Owe Others
                </button>
                <button
                  type="button"
                  onClick={() => setType('owe_me')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    type === 'owe_me' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  Others Owe Me
                </button>
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Person Name</label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="e.g. Rahul"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Dinner bill split"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <UserPlus size={18} className="mr-2" /> Add Record
            </button>
          </form>
        </div>
      </div>

      {/* People List */}
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">Track by Person</h3>
        
        {debts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
             <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
               <User className="text-gray-400" size={24} />
             </div>
            <p className="text-gray-500">No debts recorded yet.</p>
            <p className="text-xs text-gray-400 mt-1">Add a record to start tracking.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {personKeys.map(person => {
              const personDebts = groupedDebts[person];
              
              // Calculate specific totals for this person
              const iOweThisPerson = personDebts
                .filter(d => d.type === 'i_owe' && !d.isPaid)
                .reduce((sum, d) => sum + d.amount, 0);
                
              const thisPersonOwesMe = personDebts
                .filter(d => d.type === 'owe_me' && !d.isPaid)
                .reduce((sum, d) => sum + d.amount, 0);

              const isSettled = iOweThisPerson === 0 && thisPersonOwesMe === 0;
              const isExpanded = expandedPerson === person;

              return (
                <div key={person} className={`bg-white rounded-xl shadow-sm border transition-all ${isSettled ? 'border-gray-100 opacity-75' : 'border-gray-200'}`}>
                  {/* Card Header */}
                  <div 
                    onClick={() => setExpandedPerson(isExpanded ? null : person)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        isSettled ? 'bg-gray-300' : (iOweThisPerson > 0 ? 'bg-red-500' : 'bg-emerald-500')
                      }`}>
                        {person.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{person}</h4>
                        <div className="flex gap-2 text-xs">
                          {isSettled ? (
                            <span className="text-gray-500">All settled up!</span>
                          ) : (
                            <>
                              {iOweThisPerson > 0 && <span className="text-red-600 font-medium">I owe: ₹{iOweThisPerson.toLocaleString()}</span>}
                              {thisPersonOwesMe > 0 && <span className="text-emerald-600 font-medium">Owes me: ₹{thisPersonOwesMe.toLocaleString()}</span>}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      {isExpanded ? <ChevronUp className="text-gray-400" size={20} /> : <ChevronDown className="text-gray-400" size={20} />}
                    </div>
                  </div>

                  {/* Expanded List */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-3">
                      {personDebts.map(debt => (
                        <div key={debt.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-3">
                             <button 
                                onClick={() => onTogglePaid(debt.id)}
                                className={`transition-colors ${debt.isPaid ? 'text-green-500' : 'text-gray-300 hover:text-green-500'}`}
                                title={debt.isPaid ? "Mark as unpaid" : "Mark as paid"}
                              >
                                {debt.isPaid ? <CheckCircle size={20} /> : <Circle size={20} />}
                              </button>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                    debt.type === 'i_owe' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    {debt.type === 'i_owe' ? 'Pay' : 'Get'}
                                  </span>
                                  {debt.description && <span className="text-sm text-gray-700">{debt.description}</span>}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {debt.dueDate ? `Due ${debt.dueDate}` : 'No date'} • {debt.isPaid ? 'Paid' : 'Pending'}
                                </p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-semibold ${debt.isPaid ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                              ₹{debt.amount.toLocaleString()}
                            </span>
                            <button
                              onClick={() => onDeleteDebt(debt.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtManager;
