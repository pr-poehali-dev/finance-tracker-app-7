import { useState } from 'react';
import { useFinance, Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/hooks/useFinance';
import Icon from '@/components/ui/icon';

function formatAmount(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₽';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Сегодня, ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Вчера, ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function getCategoryInfo(cat: string) {
  return (
    EXPENSE_CATEGORIES.find(c => c.value === cat) ||
    INCOME_CATEGORIES.find(c => c.value === cat) ||
    { emoji: '📦', label: cat, color: '#6b7280' }
  );
}

interface EditModalProps {
  tx: Transaction;
  onSave: (id: string, data: Partial<Transaction>) => void;
  onClose: () => void;
}

function EditModal({ tx, onSave, onClose }: EditModalProps) {
  const [amount, setAmount] = useState(String(tx.amount));
  const [note, setNote] = useState(tx.note || '');
  const categories = tx.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const [category, setCategory] = useState(tx.category);

  function handleSave() {
    const num = parseFloat(amount.replace(',', '.'));
    if (!num || num <= 0) return;
    onSave(tx.id, { amount: num, note, category });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg rounded-t-3xl p-6 animate-slide-up"
        style={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
        <h3 className="text-lg font-bold text-white mb-4">Редактировать</h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-2 block">Сумма</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-white/50 mb-2 block">Категория</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value as typeof category)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                  style={{
                    background: category === cat.value ? cat.color + '33' : 'rgba(255,255,255,0.04)',
                    border: category === cat.value ? `2px solid ${cat.color}` : '2px solid transparent',
                  }}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-xs text-white/70">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50 mb-2 block">Заметка</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Необязательно"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl text-white/60 font-medium glass">
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl text-white font-bold"
              style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function History() {
  const { transactions, deleteTransaction, updateTransaction } = useFinance();
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const filtered = transactions.filter(t => filter === 'all' || t.type === filter);

  const grouped: Record<string, Transaction[]> = {};
  filtered.forEach(tx => {
    const d = new Date(tx.date);
    const key = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(tx);
  });

  return (
    <div className="pb-24 animate-fade-in">
      {/* Filter tabs */}
      <div className="px-4 pt-4">
        <div className="glass rounded-2xl p-1.5 flex gap-1">
          {(['all', 'expense', 'income'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                filter === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {f === 'all' ? 'Все' : f === 'expense' ? '📉 Расходы' : '📈 Доходы'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="px-4 mt-4 space-y-4">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-white/40 text-sm">Транзакций пока нет</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-xs text-white/40 font-medium">{date}</p>
                <div className="flex-1 h-px bg-white/5" />
                <p className="text-xs font-semibold" style={{
                  color: txs.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0) >= 0 ? '#22c55e' : '#ef4444'
                }}>
                  {txs.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0) >= 0 ? '+' : ''}
                  {formatAmount(txs.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0))}
                </p>
              </div>
              <div className="space-y-2">
                {txs.map((tx) => {
                  const catInfo = getCategoryInfo(tx.category);
                  return (
                    <div key={tx.id} className="glass rounded-2xl p-4 flex items-center gap-3 glass-hover group">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: catInfo.color + '22' }}
                      >
                        {catInfo.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{catInfo.label}</p>
                        <p className="text-xs text-white/40 truncate">
                          {tx.note || formatDate(tx.date)}
                        </p>
                        {tx.note && <p className="text-xs text-white/30">{formatDate(tx.date)}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={`text-base font-bold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.type === 'income' ? '+' : '−'}{formatAmount(tx.amount)}
                        </p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditTx(tx)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                          >
                            <Icon name="Pencil" size={13} className="text-white/50" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-colors"
                          >
                            <Icon name="Trash2" size={13} className="text-red-400/70" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {editTx && (
        <EditModal
          tx={editTx}
          onSave={updateTransaction}
          onClose={() => setEditTx(null)}
        />
      )}
    </div>
  );
}
