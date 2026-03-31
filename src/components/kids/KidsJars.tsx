import { useState } from 'react';

interface KidsJarsProps {
  jars: { save: number; spend: number; share: number };
  onAddToJar: (jar: 'save' | 'spend' | 'share', amount: number, note?: string) => void;
  onSpendFromJar: (jar: 'save' | 'spend' | 'share', amount: number, note?: string) => void;
  transactions: Array<{ id: string; type: 'income' | 'expense'; jar: string; amount: number; note: string; date: string }>;
}

const JARS = [
  {
    id: 'save' as const,
    emoji: '🐷',
    label: 'Копилка',
    sublabel: 'Откладываю',
    color: '#4ECDC4',
    bg: 'linear-gradient(135deg, #4ECDC4, #2ab5ac)',
    lightBg: '#e8fffe',
    border: '#4ECDC4',
    tip: 'Сюда откладывай деньги на мечту!',
  },
  {
    id: 'spend' as const,
    emoji: '🛒',
    label: 'Кошелёк',
    sublabel: 'Трачу',
    color: '#FF9F4A',
    bg: 'linear-gradient(135deg, #FF9F4A, #ff7a1a)',
    lightBg: '#fff8ee',
    border: '#FF9F4A',
    tip: 'Деньги на покупки и угощения!',
  },
  {
    id: 'share' as const,
    emoji: '💝',
    label: 'Добрые дела',
    sublabel: 'Делюсь',
    color: '#ec4899',
    bg: 'linear-gradient(135deg, #ec4899, #be185d)',
    lightBg: '#fdf2f8',
    border: '#ec4899',
    tip: 'Поделись с другом или на добрые дела!',
  },
];

const QUICK_AMOUNTS = [10, 25, 50, 100, 200, 500];

export default function KidsJars({ jars, onAddToJar, onSpendFromJar, transactions }: KidsJarsProps) {
  const [selectedJar, setSelectedJar] = useState<'save' | 'spend' | 'share' | null>(null);
  const [mode, setMode] = useState<'add' | 'spend'>('add');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [flash, setFlash] = useState<string | null>(null);

  const jar = JARS.find(j => j.id === selectedJar);

  function handleSubmit() {
    const n = parseInt(amount);
    if (!n || n <= 0 || !selectedJar) return;
    if (mode === 'add') {
      onAddToJar(selectedJar, n, note);
    } else {
      if (n > jars[selectedJar]) return;
      onSpendFromJar(selectedJar, n, note);
    }
    setFlash(selectedJar);
    setTimeout(() => setFlash(null), 800);
    setAmount('');
    setNote('');
    setSelectedJar(null);
  }

  const recentTx = transactions.slice(0, 8);

  return (
    <div className="pb-28 px-4 pt-4">
      {/* Jars */}
      <div className="space-y-3 mb-5">
        {JARS.map(j => (
          <div
            key={j.id}
            className="rounded-3xl p-4 transition-all duration-300"
            style={{
              background: flash === j.id ? j.bg : 'white',
              border: `3px solid ${j.border}44`,
              transform: flash === j.id ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                style={{ background: j.lightBg, border: `2px solid ${j.color}44` }}>
                {j.emoji}
              </div>
              <div className="flex-1">
                <p className="font-black text-lg" style={{ color: '#222' }}>{j.label}</p>
                <p className="text-xs text-gray-500">{j.tip}</p>
                <p className="text-3xl font-black mt-1" style={{ color: j.color }}>
                  {jars[j.id]} <span className="text-lg">🪙</span>
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setSelectedJar(j.id); setMode('add'); }}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-black text-white transition-all hover:scale-110"
                  style={{ background: j.bg, boxShadow: `0 3px 10px ${j.color}44` }}
                >
                  +
                </button>
                <button
                  onClick={() => { setSelectedJar(j.id); setMode('spend'); }}
                  disabled={jars[j.id] === 0}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-black text-gray-500 bg-gray-100 transition-all hover:scale-110 disabled:opacity-30"
                >
                  −
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent */}
      {recentTx.length > 0 && (
        <div>
          <p className="text-base font-black text-gray-700 mb-2">📋 Последние записи</p>
          <div className="space-y-2">
            {recentTx.map(tx => {
              const j = JARS.find(j => j.id === tx.jar);
              return (
                <div key={tx.id} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3"
                  style={{ border: '2px solid #f3f4f6' }}>
                  <span className="text-2xl">{j?.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700">{tx.note || (tx.type === 'income' ? 'Пополнение' : 'Трата')}</p>
                    <p className="text-xs text-gray-400">{j?.label}</p>
                  </div>
                  <p className="font-black text-base" style={{ color: tx.type === 'income' ? '#4ECDC4' : '#ef4444' }}>
                    {tx.type === 'income' ? '+' : '−'}{tx.amount} 🪙
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {selectedJar && jar && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSelectedJar(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-lg rounded-t-[2rem] p-6 pb-10"
            style={{ background: '#fafafa' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-5" />
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{jar.emoji}</span>
              <div>
                <p className="font-black text-xl text-gray-800">
                  {mode === 'add' ? `Добавить в ${jar.label}` : `Потратить из ${jar.label}`}
                </p>
                <p className="text-sm text-gray-500">Сейчас: {jars[selectedJar]} 🪙</p>
              </div>
            </div>

            {/* Quick amounts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {QUICK_AMOUNTS.map(q => (
                <button key={q} onClick={() => setAmount(String(q))}
                  className="px-4 py-2 rounded-2xl font-bold text-sm transition-all hover:scale-105"
                  style={{
                    background: amount === String(q) ? jar.bg : '#f3f4f6',
                    color: amount === String(q) ? 'white' : '#555',
                  }}>
                  {q} 🪙
                </button>
              ))}
            </div>

            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Или введи сумму..."
              className="w-full rounded-2xl px-4 py-3 text-xl font-black text-center outline-none mb-3"
              style={{ background: '#f3f4f6', border: `3px solid ${jar.color}44`, color: '#222' }}
            />
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Что это? (необязательно)"
              maxLength={40}
              className="w-full rounded-2xl px-4 py-3 text-base outline-none mb-4"
              style={{ background: '#f3f4f6', border: '2px solid #e5e7eb', color: '#444' }}
            />

            <button onClick={handleSubmit}
              disabled={!amount || parseInt(amount) <= 0 || (mode === 'spend' && parseInt(amount) > jars[selectedJar])}
              className="w-full py-4 rounded-2xl text-white text-lg font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
              style={{ background: jar.bg, boxShadow: `0 6px 20px ${jar.color}44` }}>
              {mode === 'add' ? '+ Добавить монетки' : '− Потратить'} 🎉
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
