import { useState } from 'react';
import { SavingsGoal } from '@/hooks/useKidsFinance';

interface KidsGoalsProps {
  goals: SavingsGoal[];
  jars: { save: number; spend: number; share: number };
  onAddGoal: (name: string, emoji: string, target: number) => void;
  onAddToGoal: (id: string, amount: number) => void;
  onRemoveGoal: (id: string) => void;
  onConfetti: () => void;
}

const GOAL_EMOJIS = ['🚲', '🎮', '📚', '🎨', '🤖', '🐶', '⚽', '🎸', '🛹', '🎁', '✈️', '🍦', '🏊', '🎭', '🌈'];
const QUICK_AMOUNTS = [10, 25, 50, 100, 200];

export default function KidsGoals({ goals, jars, onAddGoal, onAddToGoal, onRemoveGoal, onConfetti }: KidsGoalsProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalEmoji, setGoalEmoji] = useState('🎯');
  const [goalTarget, setGoalTarget] = useState('');
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const [celebrated, setCelebrated] = useState<Set<string>>(new Set());

  function handleCreate() {
    const t = parseInt(goalTarget);
    if (!goalName.trim() || !t || t <= 0) return;
    onAddGoal(goalName.trim(), goalEmoji, t);
    setGoalName('');
    setGoalTarget('');
    setGoalEmoji('🎯');
    setShowCreate(false);
  }

  function handleAddToGoal(goalId: string) {
    const n = parseInt(addAmount);
    if (!n || n <= 0) return;
    onAddToGoal(goalId, n);
    const goal = goals.find(g => g.id === goalId);
    if (goal && goal.saved + n >= goal.target && !celebrated.has(goalId)) {
      setCelebrated(prev => new Set([...prev, goalId]));
      onConfetti();
    }
    setAddAmount('');
    setAddingTo(null);
  }

  const activeGoals = goals.filter(g => g.saved < g.target);
  const completedGoals = goals.filter(g => g.saved >= g.target);

  return (
    <div className="pb-28 px-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black text-gray-800">Мои мечты 🌟</h2>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-2xl text-white font-black text-sm transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #FF9F4A, #ff7a1a)', boxShadow: '0 4px 12px rgba(255,159,74,0.4)' }}>
          + Новая цель
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-8xl mb-4">🌈</div>
          <p className="text-xl font-black text-gray-600 mb-2">Создай свою первую цель!</p>
          <p className="text-sm text-gray-400 mb-6">На что хочешь накопить?</p>
          <button onClick={() => setShowCreate(true)}
            className="px-8 py-4 rounded-3xl text-white text-lg font-black transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #FF9F4A, #ff7a1a)', boxShadow: '0 6px 20px rgba(255,159,74,0.4)' }}>
            🎯 Поставить цель
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active goals */}
          {activeGoals.map(goal => {
            const pct = Math.min((goal.saved / goal.target) * 100, 100);
            return (
              <div key={goal.id} className="bg-white rounded-3xl p-5 shadow-sm"
                style={{ border: '3px solid #f3f4f6' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ background: '#fff8ee', border: '2px solid #FF9F4A44' }}>
                      {goal.emoji}
                    </div>
                    <div>
                      <p className="font-black text-lg text-gray-800">{goal.name}</p>
                      <p className="text-sm text-gray-500">{goal.saved} из {goal.target} 🪙</p>
                    </div>
                  </div>
                  <button onClick={() => onRemoveGoal(goal.id)}
                    className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-400 transition-colors text-lg">
                    ×
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-5 mb-3 overflow-hidden">
                  <div className="h-5 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 100
                        ? 'linear-gradient(90deg, #FFE66D, #ffd700)'
                        : 'linear-gradient(90deg, #4ECDC4, #2ab5ac)',
                      minWidth: pct > 0 ? '32px' : '0',
                    }}>
                    {pct > 15 && <span className="text-xs font-black text-white">{Math.round(pct)}%</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Осталось: <span className="font-bold text-gray-700">{goal.target - goal.saved} 🪙</span>
                  </p>
                  <button onClick={() => setAddingTo(goal.id)}
                    className="px-4 py-2 rounded-2xl text-white text-sm font-black transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #4ECDC4, #2ab5ac)', boxShadow: '0 3px 10px rgba(78,205,196,0.4)' }}>
                    + Добавить
                  </button>
                </div>
              </div>
            );
          })}

          {/* Completed goals */}
          {completedGoals.length > 0 && (
            <>
              <p className="text-base font-black text-gray-500 mt-2">✅ Выполненные цели</p>
              {completedGoals.map(goal => (
                <div key={goal.id} className="bg-yellow-50 rounded-3xl p-4 flex items-center gap-3"
                  style={{ border: '3px solid #FFE66D' }}>
                  <span className="text-3xl">{goal.emoji}</span>
                  <div className="flex-1">
                    <p className="font-black text-gray-800">{goal.name}</p>
                    <p className="text-sm text-green-600 font-bold">🎉 Цель достигнута! {goal.target} 🪙</p>
                  </div>
                  <span className="text-3xl">🏆</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Add to goal modal */}
      {addingTo && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setAddingTo(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-lg rounded-t-[2rem] p-6 pb-10 bg-white"
            onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />
            <p className="text-xl font-black text-gray-800 mb-4 text-center">Добавить монетки 🪙</p>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {QUICK_AMOUNTS.map(q => (
                <button key={q} onClick={() => setAddAmount(String(q))}
                  className="px-4 py-2 rounded-2xl font-bold text-sm transition-all"
                  style={{
                    background: addAmount === String(q) ? 'linear-gradient(135deg, #4ECDC4, #2ab5ac)' : '#f3f4f6',
                    color: addAmount === String(q) ? 'white' : '#555',
                  }}>
                  {q} 🪙
                </button>
              ))}
            </div>
            <input
              type="number"
              value={addAmount}
              onChange={e => setAddAmount(e.target.value)}
              placeholder="Введи сумму..."
              className="w-full rounded-2xl px-4 py-3 text-xl font-black text-center outline-none mb-4"
              style={{ background: '#f3f4f6', border: '3px solid #4ECDC444', color: '#222' }}
              autoFocus
            />
            <p className="text-xs text-center text-gray-400 mb-4">
              В копилке сейчас: {jars.save} 🪙 (деньги считаются отдельно)
            </p>
            <button onClick={() => handleAddToGoal(addingTo!)}
              disabled={!addAmount || parseInt(addAmount) <= 0}
              className="w-full py-4 rounded-2xl text-white text-lg font-black transition-all hover:scale-105 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #4ECDC4, #2ab5ac)', boxShadow: '0 6px 20px rgba(78,205,196,0.4)' }}>
              🎯 Добавить к цели!
            </button>
          </div>
        </div>
      )}

      {/* Create goal modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-lg rounded-t-[2rem] p-6 pb-10 bg-white"
            onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-5" />
            <p className="text-xl font-black text-gray-800 mb-4">Новая цель ✨</p>

            <p className="text-sm font-bold text-gray-600 mb-2">Выбери картинку:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {GOAL_EMOJIS.map(e => (
                <button key={e} onClick={() => setGoalEmoji(e)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all"
                  style={{
                    background: goalEmoji === e ? '#FFE66D' : '#f3f4f6',
                    transform: goalEmoji === e ? 'scale(1.2)' : 'scale(1)',
                    border: goalEmoji === e ? '2px solid #FF9F4A' : '2px solid transparent',
                  }}>
                  {e}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={goalName}
              onChange={e => setGoalName(e.target.value)}
              placeholder="На что копим? Например: Велосипед"
              maxLength={30}
              className="w-full rounded-2xl px-4 py-3 text-base outline-none mb-3"
              style={{ background: '#f3f4f6', border: '3px solid #FF9F4A44', color: '#222' }}
            />
            <input
              type="number"
              value={goalTarget}
              onChange={e => setGoalTarget(e.target.value)}
              placeholder="Сколько монеток нужно?"
              className="w-full rounded-2xl px-4 py-3 text-xl font-black text-center outline-none mb-4"
              style={{ background: '#f3f4f6', border: '3px solid #FF9F4A44', color: '#222' }}
            />
            <button onClick={handleCreate}
              disabled={!goalName.trim() || !goalTarget || parseInt(goalTarget) <= 0}
              className="w-full py-4 rounded-2xl text-white text-lg font-black transition-all hover:scale-105 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #FF9F4A, #ff7a1a)', boxShadow: '0 6px 20px rgba(255,159,74,0.4)' }}>
              🌟 Создать цель!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
