import { useState } from 'react';
import { useFinance, EXPENSE_CATEGORIES, INCOME_CATEGORIES, ExpenseCategory, IncomeCategory } from '@/hooks/useFinance';
import Icon from '@/components/ui/icon';

type Tab = 'expense' | 'income';

export default function AddTransaction() {
  const { addTransaction } = useFinance();
  const [tab, setTab] = useState<Tab>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | IncomeCategory>('food');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = tab === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleTabChange(t: Tab) {
    setTab(t);
    setCategory(t === 'expense' ? 'food' : 'salary');
    setAmount('');
    setNote('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount.replace(',', '.'));
    if (!num || num <= 0) return;
    addTransaction({ type: tab, amount: num, category, note: note.trim() });
    setAmount('');
    setNote('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  const selectedCat = categories.find(c => c.value === category);

  return (
    <div className="pb-24 px-4 pt-4 animate-fade-in">
      {/* Tab Switcher */}
      <div className="glass rounded-2xl p-1.5 flex gap-1 mb-6">
        <button
          onClick={() => handleTabChange('expense')}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            tab === 'expense'
              ? 'bg-red-500 text-white shadow-lg'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Icon name="TrendingDown" size={16} />
          Расход
        </button>
        <button
          onClick={() => handleTabChange('income')}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            tab === 'income'
              ? 'bg-green-500 text-white shadow-lg'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <Icon name="TrendingUp" size={16} />
          Доход
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Input */}
        <div className="glass rounded-2xl p-5">
          <label className="text-xs text-white/50 font-medium mb-3 block uppercase tracking-wider">Сумма</label>
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-black ${tab === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
              {tab === 'expense' ? '−' : '+'}
            </span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              required
              min="1"
              step="any"
              className="flex-1 bg-transparent text-4xl font-black text-white placeholder-white/20 outline-none w-full"
            />
            <span className="text-2xl font-bold text-white/30">₽</span>
          </div>
        </div>

        {/* Category Grid */}
        <div className="glass rounded-2xl p-4">
          <label className="text-xs text-white/50 font-medium mb-3 block uppercase tracking-wider">Категория</label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value as ExpenseCategory | IncomeCategory)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 ${
                  category === cat.value ? 'scale-105' : 'opacity-60 hover:opacity-90'
                }`}
                style={{
                  background: category === cat.value ? cat.color + '33' : 'rgba(255,255,255,0.04)',
                  border: category === cat.value ? `2px solid ${cat.color}` : '2px solid transparent',
                }}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-medium text-white leading-tight text-center">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="glass rounded-2xl p-4">
          <label className="text-xs text-white/50 font-medium mb-3 block uppercase tracking-wider">Заметка (необязательно)</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Например: обед в офисе"
            maxLength={80}
            className="w-full bg-transparent text-white placeholder-white/25 outline-none text-sm"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
            success ? 'bg-green-500 scale-95' : ''
          }`}
          style={!success ? {
            background: tab === 'expense'
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #22c55e, #16a34a)',
            boxShadow: tab === 'expense'
              ? '0 4px 24px rgba(239,68,68,0.35)'
              : '0 4px 24px rgba(34,197,94,0.35)',
          } : undefined}
        >
          {success ? (
            <>
              <Icon name="Check" size={20} />
              Добавлено!
            </>
          ) : (
            <>
              <Icon name="Plus" size={20} />
              {tab === 'expense' ? `Добавить расход${selectedCat ? ` · ${selectedCat.emoji} ${selectedCat.label}` : ''}` : `Добавить доход${selectedCat ? ` · ${selectedCat.emoji} ${selectedCat.label}` : ''}`}
            </>
          )}
        </button>
      </form>

      {/* Quick amounts */}
      <div className="mt-4">
        <p className="text-xs text-white/40 mb-2 text-center">Быстрый ввод</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {[100, 250, 500, 1000, 2500, 5000].map(q => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(String(q))}
              className="glass px-3 py-1.5 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-all hover:border-white/20"
            >
              {q.toLocaleString('ru-RU')} ₽
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
