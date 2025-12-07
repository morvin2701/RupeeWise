
export type TransactionType = 'income' | 'expense';
export type DebtType = 'owe_me' | 'i_owe'; // owe_me = others take from me (I gave), i_owe = I need to pay others

export const TRANSACTION_CATEGORIES = [
  'Food', 
  'Transport', 
  'Rent', 
  'Utilities', 
  'Entertainment', 
  'Shopping', 
  'Healthcare',
  'Education',
  'Salary', 
  'Freelance', 
  'Other'
];

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

export interface Debt {
  id: string;
  personName: string;
  description?: string;
  amount: number;
  type: DebtType;
  dueDate?: string;
  isPaid: boolean;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
}
