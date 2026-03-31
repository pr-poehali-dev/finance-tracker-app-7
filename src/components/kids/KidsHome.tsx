import { useState, useEffect } from 'react';

interface KidsHomeProps {
  childName: string;
  totalCoins: number;
  jars: { save: number; spend: number; share: number };
  badges: { unlocked: boolean }[];
  saverStreak: number;
  onSetName: (name: string) => void;
  onNavigate: (tab: string) => void;
}

const SPARKY_TIPS = [
  'Знаешь ли ты? Если откладывать 100 монет каждую неделю, за месяц накопится 400 монет! 🐿️',
  'Прежде чем тратить, спроси себя: «Мне это нужно или просто хочется?» 🤔',
  'Копить деньги — как сажать дерево. Сначала маленькое, а потом вырастает большим! 🌳',
  'Если поделиться с другом, станет ещё радостнее! 💝',
  'Ставь цели и иди к ним — это суперспособность! 🦸',
];

export default function KidsHome({ childName, totalCoins, jars, badges, saverStreak, onSetName, onNavigate }: KidsHomeProps) {
  const [sparkyTip, setSparkyTip] = useState(SPARKY_TIPS[0]);
  const [tipIdx, setTipIdx] = useState(0);
  const [nameInput, setNameInput] = useState('');
  const [sparkyBounce, setSparkyBounce] = useState(false);
  const unlockedBadges = badges.filter(b => b.unlocked).length;

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIdx(i => {
        const next = (i + 1) % SPARKY_TIPS.length;
        setSparkyTip(SPARKY_TIPS[next]);
        setSparkyBounce(true);
        setTimeout(() => setSparkyBounce(false), 600);
        return next;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!childName) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg, #fff8ee, #e8fffe)' }}>
        <div className="text-8xl mb-4 animate-bounce">🐿️</div>
        <h1 className="text-3xl font-black text-center mb-2" style={{ color: '#FF9F4A' }}>
          Привет! Я Спарки!
        </h1>
        <p className="text-lg text-center mb-8" style={{ color: '#5a5a7a' }}>
          Я научу тебя обращаться с монетками!<br />Как тебя зовут?
        </p>
        <input
          type="text"
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && nameInput.trim() && onSetName(nameInput.trim())}
          placeholder="Твоё имя..."
          maxLength={20}
          className="w-full max-w-xs text-center text-xl font-bold rounded-3xl px-6 py-4 mb-4 outline-none"
          style={{
            background: 'white',
            border: '3px solid #FF9F4A',
            color: '#333',
            fontSize: '20px',
          }}
          autoFocus
        />
        <button
          onClick={() => nameInput.trim() && onSetName(nameInput.trim())}
          disabled={!nameInput.trim()}
          className="px-8 py-4 rounded-3xl text-white text-xl font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #FF9F4A, #ff7a1a)', boxShadow: '0 6px 20px rgba(255,159,74,0.5)' }}
        >
          Поехали! 🚀
        </button>
      </div>
    );
  }

  return (
    <div className="pb-28 px-4 pt-4">
      {/* Sparky bubble */}
      <div className="flex items-end gap-3 mb-5">
        <div
          className="text-6xl flex-shrink-0 transition-transform duration-300"
          style={{ transform: sparkyBounce ? 'scale(1.2) rotate(-10deg)' : 'scale(1)' }}
        >
          🐿️
        </div>
        <div className="relative flex-1 rounded-3xl rounded-bl-none px-4 py-3"
          style={{ background: 'white', border: '2px solid #FFE66D', boxShadow: '0 4px 16px rgba(255,230,109,0.3)' }}>
          <p className="text-sm font-semibold leading-relaxed" style={{ color: '#444' }}>
            {sparkyTip}
          </p>
          <div className="flex gap-1.5 mt-2">
            {SPARKY_TIPS.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: i === tipIdx ? '#FF9F4A' : '#e5e7eb' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Greeting + coins */}
      <div className="rounded-3xl p-5 mb-4 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #FF9F4A, #ff7a1a)', boxShadow: '0 8px 24px rgba(255,159,74,0.4)' }}>
        <div className="absolute top-0 right-0 text-7xl opacity-10 leading-none">🌟</div>
        <p className="text-white/80 text-sm font-semibold">Привет, {childName}! 👋</p>
        <p className="text-white text-5xl font-black mt-1">{totalCoins.toLocaleString()}</p>
        <p className="text-white/80 text-base font-bold">монеток всего</p>
        {saverStreak > 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-2xl px-3 py-1.5">
            <span>🔥</span>
            <span className="text-white text-sm font-bold">{saverStreak} дней подряд откладываю!</span>
          </div>
        )}
      </div>

      {/* 3 Jars */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {([
          { jar: 'save', emoji: '🐷', label: 'Откладываю', color: '#4ECDC4', bg: '#e8fffe' },
          { jar: 'spend', emoji: '🛒', label: 'Трачу', color: '#FF9F4A', bg: '#fff8ee' },
          { jar: 'share', emoji: '💝', label: 'Делюсь', color: '#ec4899', bg: '#fdf2f8' },
        ] as const).map(({ jar, emoji, label, color, bg }) => (
          <button
            key={jar}
            onClick={() => onNavigate('jars')}
            className="rounded-3xl p-3 flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95"
            style={{ background: bg, border: `3px solid ${color}44` }}
          >
            <span className="text-3xl">{emoji}</span>
            <p className="text-xs font-bold" style={{ color }}>{label}</p>
            <p className="text-lg font-black" style={{ color: '#333' }}>{jars[jar]}</p>
          </button>
        ))}
      </div>

      {/* Quick action buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button onClick={() => onNavigate('goals')}
          className="rounded-3xl p-4 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #FFE66D, #ffd700)', boxShadow: '0 4px 16px rgba(255,230,109,0.4)' }}>
          <span className="text-3xl">🎯</span>
          <div className="text-left">
            <p className="text-sm font-black text-gray-800">Мои цели</p>
            <p className="text-xs text-gray-600">Накоплю на мечту!</p>
          </div>
        </button>
        <button onClick={() => onNavigate('games')}
          className="rounded-3xl p-4 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #4ECDC4, #2ab5ac)', boxShadow: '0 4px 16px rgba(78,205,196,0.4)' }}>
          <span className="text-3xl">🎮</span>
          <div className="text-left">
            <p className="text-sm font-black text-white">Играть!</p>
            <p className="text-xs text-white/80">Учись и побеждай</p>
          </div>
        </button>
      </div>

      {/* Badges preview */}
      <button onClick={() => onNavigate('badges')}
        className="w-full rounded-3xl p-4 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
        style={{ background: 'white', border: '3px solid #e5e7eb' }}>
        <span className="text-3xl">🏅</span>
        <div className="flex-1 text-left">
          <p className="text-sm font-black text-gray-800">Мои достижения</p>
          <p className="text-xs text-gray-500">Получено: {unlockedBadges} из {badges.length}</p>
        </div>
        <div className="flex gap-1">
          {badges.filter(b => b.unlocked).slice(0, 3).map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-lg">⭐</div>
          ))}
        </div>
      </button>
    </div>
  );
}
