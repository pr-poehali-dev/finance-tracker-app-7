import { useState } from 'react';
import { KidsState } from '@/hooks/useKidsFinance';

interface ParentPanelProps {
  state: KidsState;
  badges: Array<{ title: string; emoji: string; unlocked: boolean }>;
  onAddAllowance: (save: number, spend: number, share: number) => void;
  onChangePin: (newPin: string) => void;
  onClose: () => void;
}

export default function ParentPanel({ state, badges, onAddAllowance, onChangePin, onClose }: ParentPanelProps) {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [allowance, setAllowance] = useState({ save: '', spend: '', share: '' });
  const [added, setAdded] = useState(false);
  const [changingPin, setChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep] = useState<'new' | 'confirm'>('new');
  const [pinChanged, setPinChanged] = useState(false);
  const [pinMismatch, setPinMismatch] = useState(false);

  function handlePin() {
    if (pin === state.parentPin) {
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  }

  function handlePinKeyPress(k: number | string) {
    const target = pinStep === 'new' ? newPin : confirmPin;
    const setter = pinStep === 'new' ? setNewPin : setConfirmPin;
    if (k === '⌫') { setter(p => p.slice(0, -1)); return; }
    if (k === '' || target.length >= 4) return;
    const next = target + k;
    setter(next);
    if (next.length === 4 && pinStep === 'new') {
      setPinStep('confirm');
      setPinMismatch(false);
    } else if (next.length === 4 && pinStep === 'confirm') {
      if (next === newPin) {
        onChangePin(newPin);
        setPinChanged(true);
        setTimeout(() => { setChangingPin(false); setPinChanged(false); setNewPin(''); setConfirmPin(''); setPinStep('new'); }, 2000);
      } else {
        setPinMismatch(true);
        setConfirmPin('');
      }
    }
  }

  function handleAddAllowance() {
    const s = parseInt(allowance.save) || 0;
    const sp = parseInt(allowance.spend) || 0;
    const sh = parseInt(allowance.share) || 0;
    if (s + sp + sh === 0) return;
    onAddAllowance(s, sp, sh);
    setAllowance({ save: '', spend: '', share: '' });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const totalCoins = state.jars.save + state.jars.spend + state.jars.share;
  const unlockedBadges = badges.filter(b => b.unlocked);

  if (!unlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
        <div className="w-full max-w-sm rounded-3xl p-8 bg-white text-center">
          <div className="text-6xl mb-4">👪</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Панель родителей</h2>
          <p className="text-gray-500 text-sm mb-6">Введи PIN-код для доступа<br />(по умолчанию: 1234)</p>
          <div className="flex justify-center gap-3 mb-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-10 h-10 rounded-xl border-2 flex items-center justify-center text-xl font-black"
                style={{ borderColor: pin.length >= i ? '#FF9F4A' : '#e5e7eb', background: pin.length >= i ? '#fff8ee' : 'white' }}>
                {pin.length >= i ? '●' : ''}
              </div>
            ))}
          </div>
          {pinError && <p className="text-red-500 text-sm font-bold mb-3">Неверный PIN!</p>}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
              <button key={i}
                onClick={() => {
                  if (k === '⌫') setPin(p => p.slice(0,-1));
                  else if (k !== '' && pin.length < 4) setPin(p => p + k);
                }}
                disabled={k === ''}
                className="py-3 rounded-2xl text-xl font-black transition-all hover:scale-105 active:scale-95 disabled:invisible"
                style={{ background: k === '⌫' ? '#fee2e2' : '#f3f4f6', color: k === '⌫' ? '#ef4444' : '#333' }}>
                {k}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-bold text-gray-500 bg-gray-100">
              Отмена
            </button>
            <button onClick={handlePin} disabled={pin.length !== 4}
              className="flex-1 py-3 rounded-2xl font-black text-white disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #FF9F4A, #ff7a1a)' }}>
              Войти
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="min-h-screen p-4 flex items-start justify-center pt-8">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-gray-800">👪 Панель родителей</h2>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
              ×
            </button>
          </div>

          {/* Stats */}
          <div className="bg-orange-50 rounded-2xl p-4 mb-4" style={{ border: '2px solid #FF9F4A44' }}>
            <p className="text-sm font-bold text-gray-600 mb-2">📊 Монетки {state.childName || 'ребёнка'}</p>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                { label: '🐷 Копилка', val: state.jars.save, color: '#4ECDC4' },
                { label: '🛒 Кошелёк', val: state.jars.spend, color: '#FF9F4A' },
                { label: '💝 Добрые дела', val: state.jars.share, color: '#ec4899' },
              ].map(j => (
                <div key={j.label} className="text-center">
                  <p className="text-lg font-black" style={{ color: j.color }}>{j.val}</p>
                  <p className="text-xs text-gray-500">{j.label}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm font-bold text-gray-700">Всего: {totalCoins} 🪙</p>
          </div>

          {/* Goals */}
          {state.goals.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-black text-gray-700 mb-2">🎯 Цели</p>
              {state.goals.map(g => (
                <div key={g.id} className="flex items-center gap-2 py-2 border-b border-gray-100">
                  <span className="text-xl">{g.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700">{g.name}</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div className="h-1.5 rounded-full"
                        style={{ width: `${Math.min((g.saved/g.target)*100,100)}%`, background: '#4ECDC4' }} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{g.saved}/{g.target}</p>
                </div>
              ))}
            </div>
          )}

          {/* Badges */}
          {unlockedBadges.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-black text-gray-700 mb-2">🏅 Достижения</p>
              <div className="flex flex-wrap gap-2">
                {unlockedBadges.map(b => (
                  <div key={b.title} className="flex items-center gap-1.5 bg-yellow-50 rounded-2xl px-3 py-1.5"
                    style={{ border: '2px solid #FFE66D' }}>
                    <span>{b.emoji}</span>
                    <span className="text-xs font-bold text-gray-700">{b.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Change PIN */}
          {!changingPin ? (
            <button
              onClick={() => { setChangingPin(true); setNewPin(''); setConfirmPin(''); setPinStep('new'); setPinMismatch(false); }}
              className="w-full mb-4 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-105"
              style={{ background: '#f3f4f6', color: '#555', border: '2px solid #e5e7eb' }}
            >
              🔐 Изменить PIN-код
            </button>
          ) : (
            <div className="mb-4 bg-orange-50 rounded-2xl p-4" style={{ border: '2px solid #FF9F4A44' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-black text-gray-700">
                  {pinChanged ? '✅ PIN изменён!' : pinStep === 'new' ? '🔐 Новый PIN-код' : '🔁 Повтори PIN-код'}
                </p>
                <button onClick={() => { setChangingPin(false); setNewPin(''); setConfirmPin(''); setPinStep('new'); }}
                  className="text-gray-400 text-lg font-bold">×</button>
              </div>
              {pinMismatch && <p className="text-red-500 text-xs font-bold mb-2">PIN не совпадает, попробуй сно��а</p>}
              {!pinChanged && (
                <>
                  <div className="flex justify-center gap-2 mb-3">
                    {[1,2,3,4].map(i => {
                      const current = pinStep === 'new' ? newPin : confirmPin;
                      return (
                        <div key={i} className="w-9 h-9 rounded-xl border-2 flex items-center justify-center text-lg font-black"
                          style={{ borderColor: current.length >= i ? '#FF9F4A' : '#e5e7eb', background: current.length >= i ? '#fff8ee' : 'white' }}>
                          {current.length >= i ? '●' : ''}
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
                      <button key={i} onClick={() => handlePinKeyPress(k)} disabled={k === ''}
                        className="py-2.5 rounded-xl text-base font-black transition-all hover:scale-105 active:scale-95 disabled:invisible"
                        style={{ background: k === '⌫' ? '#fee2e2' : '#f3f4f6', color: k === '⌫' ? '#ef4444' : '#333' }}>
                        {k}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {pinChanged && (
                <p className="text-center text-green-600 text-sm font-bold">PIN успешно обновлён 🎉</p>
              )}
            </div>
          )}

          {/* Add allowance */}
          <div className="bg-teal-50 rounded-2xl p-4" style={{ border: '2px solid #4ECDC444' }}>
            <p className="text-sm font-black text-gray-700 mb-3">💰 Добавить карманные деньги</p>
            {[
              { key: 'save', label: '🐷 В копилку', color: '#4ECDC4' },
              { key: 'spend', label: '🛒 На расходы', color: '#FF9F4A' },
              { key: 'share', label: '💝 Добрые дела', color: '#ec4899' },
            ].map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-3 mb-2">
                <span className="text-sm font-bold text-gray-600 w-28 flex-shrink-0">{label}</span>
                <input
                  type="number"
                  value={allowance[key as keyof typeof allowance]}
                  onChange={e => setAllowance(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder="0"
                  className="flex-1 rounded-xl px-3 py-2 text-center font-black outline-none"
                  style={{ border: `2px solid ${color}44`, background: 'white', color: '#222' }}
                />
              </div>
            ))}
            <button onClick={handleAddAllowance}
              className="w-full mt-2 py-3 rounded-2xl text-white font-black transition-all hover:scale-105"
              style={{
                background: added ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #4ECDC4, #2ab5ac)',
              }}>
              {added ? '✅ Добавлено!' : '+ Выдать монетки'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}