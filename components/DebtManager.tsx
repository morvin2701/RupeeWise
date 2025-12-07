
import React, { useState, useMemo } from 'react';
import { Debt, DebtType } from '../types';
import { UserPlus, CheckCircle, Circle, Trash2, ArrowUpRight, ArrowDownLeft, ChevronDown, ChevronUp, User } from 'lucide-react';

interface DebtManagerProps {
  debts: Debt[];
  onAddDebt: (d: Omit<Debt, 'id' | 'isPaid'>) => void;
  onEditDebt: (id: string, updates: Partial<Omit<Debt, 'id'>>) => void;
  onTogglePaid: (id: string) => void;
  onDeleteDebt: (id: string) => void;
}

const DebtManager: React.FC<DebtManagerProps> = ({ debts, onAddDebt, onEditDebt, onTogglePaid, onDeleteDebt }) => {
  const [personName, setPersonName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<DebtType>('i_owe');
  const [dueDate, setDueDate] = useState('');
  
  // State for expanded person card
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  
  // State for editing debts
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Debt>>({});

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
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Generate share message
                          let shareMessage = `Hi ${person},\n\nHere's our current debt summary:\n`;
                          
                          if (isSettled) {
                            shareMessage += "We're all settled up! 🎉";
                          } else {
                            if (iOweThisPerson > 0) {
                              shareMessage += `I currently owe you ₹${iOweThisPerson.toLocaleString()}\n`;
                            }
                            if (thisPersonOwesMe > 0) {
                              shareMessage += `You currently owe me ₹${thisPersonOwesMe.toLocaleString()}\n`;
                            }
                            
                            const netAmount = thisPersonOwesMe - iOweThisPerson;
                            if (netAmount > 0) {
                              shareMessage += `\nNet: You owe me ₹${Math.abs(netAmount).toLocaleString()}`;
                            } else if (netAmount < 0) {
                              shareMessage += `\nNet: I owe you ₹${Math.abs(netAmount).toLocaleString()}`;
                            }
                          }
                          
                          shareMessage += "\n\nLet's settle this soon! 😊";
                          
                          // Copy to clipboard
                          navigator.clipboard.writeText(shareMessage);
                          
                          // Show temporary confirmation
                          const button = e.currentTarget;
                          const originalText = button.innerHTML;
                          button.innerHTML = 'Copied!';
                          setTimeout(() => {
                            button.innerHTML = originalText;
                          }, 2000);
                        }}
                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Share debt summary"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                      </button>
                      {isExpanded ? <ChevronUp className="text-gray-400" size={20} /> : <ChevronDown className="text-gray-400" size={20} />}
                    </div>
                  </div>

                  {/* Expanded List */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-3">
                      {personDebts.map(debt => (
                        editingDebtId === debt.id ? (
                          <div key={debt.id} className="flex flex-col gap-3 bg-white p-3 rounded-lg border border-indigo-200">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Amount</label>
                                <input
                                  type="number"
                                  value={editFormData.amount || ''}
                                  onChange={(e) => setEditFormData({...editFormData, amount: parseFloat(e.target.value) || 0})}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Type</label>
                                <select
                                  value={editFormData.type || debt.type}
                                  onChange={(e) => setEditFormData({...editFormData, type: e.target.value as DebtType})}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                  <option value="i_owe">I Owe</option>
                                  <option value="owe_me">Owes Me</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Description</label>
                              <input
                                type="text"
                                value={editFormData.description || debt.description || ''}
                                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Description"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Due Date</label>
                              <input
                                type="date"
                                value={editFormData.dueDate || debt.dueDate || ''}
                                onChange={(e) => setEditFormData({...editFormData, dueDate: e.target.value})}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  onEditDebt(debt.id, editFormData);
                                  setEditingDebtId(null);
                                  setEditFormData({});
                                }}
                                className="flex-1 px-2 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingDebtId(null);
                                  setEditFormData({});
                                }}
                                className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
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
                                onClick={() => {
                                  setEditingDebtId(debt.id);
                                  setEditFormData({
                                    amount: debt.amount,
                                    type: debt.type,
                                    description: debt.description,
                                    dueDate: debt.dueDate
                                  });
                                }}
                                className="text-gray-300 hover:text-indigo-500 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                </svg>
                              </button>
                              <button
                                onClick={() => onDeleteDebt(debt.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )
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
