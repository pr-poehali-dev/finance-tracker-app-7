import { useState } from 'react';
import Icon from '@/components/ui/icon';
import Dashboard from '@/components/Dashboard';
import AddTransaction from '@/components/AddTransaction';
import History from '@/components/History';
import Charts from '@/components/Charts';
import Tips from '@/components/Tips';
import Gamification from '@/components/Gamification';
import Confetti from '@/components/Confetti';
import { useFinance } from '@/hooks/useFinance';
import { useGamification } from '@/hooks/useGamification';

type Tab = 'dashboard' | 'add' | 'history' | 'charts' | 'tips' | 'game';

const NAV_ITEMS: { id: Tab; label: string; icon: string; activeColor: string }[] = [
  { id: 'dashboard', label: 'Главная', icon: 'LayoutDashboard', activeColor: '#22c55e' },
  { id: 'charts', label: 'Графики', icon: 'PieChart', activeColor: '#3b82f6' },
  { id: 'add', label: 'Добавить', icon: 'Plus', activeColor: '#a855f7' },
  { id: 'tips', label: 'Советы', icon: 'Lightbulb', activeColor: '#ec4899' },
  { id: 'game', label: 'Игра', icon: 'Trophy', activeColor: '#fbbf24' },
];

const PAGE_TITLES: Record<Tab, string> = {
  dashboard: 'Обзор',
  add: 'Транзакция',
  history: 'История',
  charts: 'Аналитика',
  tips: 'Финграмота',
  game: 'Геймификация',
};

function formatAmount(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M ₽';
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(0) + 'K ₽';
  return n.toLocaleString('ru-RU') + ' ₽';
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { balance, transactions } = useFinance();
  const {
    activeChallenges,
    achievements,
    startChallenge,
    removeChallenge,
    confettiTrigger,
    newAchievement,
    dismissAchievement,
    userLevel,
  } = useGamification(transactions);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen mesh-bg font-golos flex flex-col max-w-lg mx-auto relative">
      {/* Confetti */}
      <Confetti trigger={confettiTrigger} />

      {/* Achievement popup */}
      {newAchievement && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up"
          onClick={dismissAchievement}
          style={{ width: 'calc(100% - 2rem)', maxWidth: '400px' }}
        >
          <div className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${newAchievement.color}33, ${newAchievement.color}11)`,
              border: `1px solid ${newAchievement.color}66`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 8px 32px ${newAchievement.color}44`,
            }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: newAchievement.color + '33' }}>
              {newAchievement.emoji}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold" style={{ color: newAchievement.color }}>🎉 Новое достижение!</p>
              <p className="text-sm font-black text-white">{newAchievement.title}</p>
              <p className="text-xs text-white/60">{newAchievement.description}</p>
            </div>
            <Icon name="X" size={16} className="text-white/40 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Header */}
      <header
        className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(10,12,18,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
            <span className="text-sm">💰</span>
          </div>
          <div>
            <p className="text-xs text-white/40 leading-none">ФинансыПро</p>
            <p className="text-sm font-bold text-white leading-none mt-0.5">{PAGE_TITLES[activeTab]}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Level badge */}
          <button
            onClick={() => setActiveTab('game')}
            className="px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all hover:scale-105"
            style={{
              background: userLevel.color + '18',
              border: `1px solid ${userLevel.color}44`,
            }}
          >
            <span className="text-sm leading-none">{userLevel.emoji}</span>
            <span className="text-xs font-bold" style={{ color: userLevel.color }}>{userLevel.label}</span>
            {unlockedCount > 0 && (
              <span className="text-xs text-white/40">· {unlockedCount} 🏅</span>
            )}
          </button>
          {/* Balance */}
          <div
            className="px-3 py-1.5 rounded-xl flex items-center gap-1.5"
            style={{
              background: balance >= 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${balance >= 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: balance >= 0 ? '#22c55e' : '#ef4444' }} />
            <span className={`text-sm font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {balance >= 0 ? '+' : ''}{formatAmount(balance)}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'add' && <AddTransaction />}
        {activeTab === 'history' && <History />}
        {activeTab === 'charts' && <Charts />}
        {activeTab === 'tips' && <Tips />}
        {activeTab === 'game' && (
          <Gamification
            activeChallenges={activeChallenges}
            achievements={achievements}
            userLevel={userLevel}
            onStartChallenge={startChallenge}
            onRemoveChallenge={removeChallenge}
            txCount={transactions.length}
          />
        )}
      </main>

      {/* Bottom navigation */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40 px-2 pb-2"
        style={{
          background: 'rgba(10,12,18,0.95)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-end justify-around pt-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const isAdd = item.id === 'add';

            if (isAdd) {
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="flex flex-col items-center gap-1 relative -mt-4"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                      boxShadow: '0 4px 24px rgba(168,85,247,0.5)',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    <Icon name="Plus" size={24} style={{ color: '#ffffff' }} />
                  </div>
                  <span className="text-xs pb-1" style={{ color: isActive ? item.activeColor : 'rgba(255,255,255,0.35)' }}>
                    {item.label}
                  </span>
                </button>
              );
            }

            const isGame = item.id === 'game';
            const hasActive = isGame && activeChallenges.filter(c => !c.completed).length > 0;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center gap-1 py-1 px-2 min-w-[52px] transition-all duration-200"
              >
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                    style={{ background: isActive ? item.activeColor + '22' : 'transparent' }}
                  >
                    <Icon
                      name={item.icon as "LayoutDashboard"}
                      size={20}
                      style={{
                        color: isActive ? item.activeColor : 'rgba(255,255,255,0.35)',
                        transition: 'color 0.2s',
                      }}
                    />
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: item.activeColor }} />
                  )}
                  {hasActive && !isActive && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400 border border-black" />
                  )}
                </div>
                <span className="text-xs leading-none" style={{ color: isActive ? item.activeColor : 'rgba(255,255,255,0.35)' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
