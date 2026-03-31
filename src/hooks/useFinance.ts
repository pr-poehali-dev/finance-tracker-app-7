import { useState, useEffect, useCallback } from 'react';

export type TransactionType = 'expense' | 'income';

export type ExpenseCategory = 'food' | 'transport' | 'cafe' | 'shopping' | 'entertainment' | 'bills' | 'other';
export type IncomeCategory = 'salary' | 'freelance' | 'gift' | 'other';
export type Category = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  note: string;
  date: string;
}

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; emoji: string; color: string }[] = [
  { value: 'food', label: 'Еда', emoji: '🛒', color: '#22c55e' },
  { value: 'transport', label: 'Транспорт', emoji: '🚌', color: '#3b82f6' },
  { value: 'cafe', label: 'Кафе', emoji: '☕', color: '#f97316' },
  { value: 'shopping', label: 'Покупки', emoji: '🛍️', color: '#ec4899' },
  { value: 'entertainment', label: 'Развлечения', emoji: '🎮', color: '#a855f7' },
  { value: 'bills', label: 'Счета', emoji: '⚡', color: '#06b6d4' },
  { value: 'other', label: 'Другое', emoji: '📦', color: '#6b7280' },
];

export const INCOME_CATEGORIES: { value: IncomeCategory; label: string; emoji: string; color: string }[] = [
  { value: 'salary', label: 'Зарплата', emoji: '💼', color: '#22c55e' },
  { value: 'freelance', label: 'Фриланс', emoji: '💻', color: '#3b82f6' },
  { value: 'gift', label: 'Подарок', emoji: '🎁', color: '#ec4899' },
  { value: 'other', label: 'Другое', emoji: '💰', color: '#a855f7' },
];

export const FINANCIAL_TIPS: Record<ExpenseCategory, string> = {
  food: 'Вы много тратите на продукты. Составляйте список покупок заранее и экономьте до 3 000₽ в месяц.',
  transport: 'Транспорт — крупная статья расходов. Рассмотрите проездной или каршеринг — экономия до 2 000₽/мес.',
  cafe: 'Вы часто ходите в кафе. Готовьте дома 2 раза в неделю и экономьте до 5 000₽ в месяц.',
  shopping: 'Много трат на покупки. Используйте правило 24 часов: отложите покупку до завтра и сэкономьте до 8 000₽/мес.',
  entertainment: 'Развлечения — важно, но в меру. Ищите бесплатные мероприятия и сэкономьте до 4 000₽ в месяц.',
  bills: 'Счета растут? Проверьте подписки и отключите ненужные — экономия до 2 500₽ в месяц.',
  other: 'Много неклассифицированных трат. Начните вести детальный учёт и вы удивитесь результату!',
};

const STORAGE_KEY = 'finance_pro_transactions';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTransactions(transactions: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function isToday(dateStr: string): boolean {
  const today = new Date();
  const d = new Date(dateStr);
  return d.toDateString() === today.toDateString();
}

function isThisWeek(dateStr: string): boolean {
  const now = new Date();
  const d = new Date(dateStr);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  return d >= weekStart;
}

function isThisMonth(dateStr: string): boolean {
  const now = new Date();
  const d = new Date(dateStr);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function useFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  const addTransaction = useCallback((data: Omit<Transaction, 'id' | 'date'>) => {
    const tx: Transaction = {
      ...data,
      id: generateId(),
      date: new Date().toISOString(),
    };
    setTransactions(prev => [tx, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateTransaction = useCallback((id: string, data: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);

  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');

  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const todayExpenses = expenses.filter(t => isToday(t.date)).reduce((s, t) => s + t.amount, 0);
  const weekExpenses = expenses.filter(t => isThisWeek(t.date)).reduce((s, t) => s + t.amount, 0);
  const monthExpenses = expenses.filter(t => isThisMonth(t.date)).reduce((s, t) => s + t.amount, 0);

  const todayIncome = incomes.filter(t => isToday(t.date)).reduce((s, t) => s + t.amount, 0);
  const monthIncome = incomes.filter(t => isThisMonth(t.date)).reduce((s, t) => s + t.amount, 0);

  const expenseByCategory = EXPENSE_CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(t => t.category === cat.value).reduce((s, t) => s + t.amount, 0),
  })).filter(c => c.total > 0);

  const topCategory = expenseByCategory.sort((a, b) => b.total - a.total)[0];
  const financialTip = topCategory ? FINANCIAL_TIPS[topCategory.value as ExpenseCategory] : null;

  return {
    transactions,
    expenses,
    incomes,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    totalExpenses,
    totalIncome,
    balance,
    todayExpenses,
    weekExpenses,
    monthExpenses,
    todayIncome,
    monthIncome,
    expenseByCategory,
    topCategory,
    financialTip,
  };
}
