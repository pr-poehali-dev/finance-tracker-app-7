import { useState, useEffect, useRef } from 'react';
import { useKidsFinance } from '@/hooks/useKidsFinance';
import KidsHome from './KidsHome';
import KidsJars from './KidsJars';
import KidsGoals from './KidsGoals';
import KidsGames from './KidsGames';
import KidsBadges from './KidsBadges';
import ParentPanel from './ParentPanel';
import Confetti from '@/components/Confetti';

type KidsTab = 'home' | 'jars' | 'goals' | 'games' | 'badges';

const NAV = [
  { id: 'home' as KidsTab, emoji: '🏠', label: 'Главная', color: '#FF9F4A' },
  { id: 'jars' as KidsTab, emoji: '🐷', label: 'Монетки', color: '#4ECDC4' },
  { id: 'goals' as KidsTab, emoji: '🎯', label: 'Цели', color: '#FFE66D' },
  { id: 'games' as KidsTab, emoji: '🎮', label: 'Игры', color: '#a855f7' },
  { id: 'badges' as KidsTab, emoji: '🏅', label: 'Бейджи', color: '#ec4899' },
];

export default function KidsApp() {
  const [tab, setTab] = useState<KidsTab>('home');
  const [showParent, setShowParent] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const prevBadgeCount = useRef(0);

  const {
    state,
    setChildName,
    addToJar,
    spendFromJar,
    addGoal,
    addToGoal,
    removeGoal,
    markQuizCompleted,
    markScenarioCompleted,
    addAllowance,
    totalCoins,
    badges,
    saverStreak,
  } = useKidsFinance();

  // fire confetti when new badge unlocked
  useEffect(() => {
    const unlocked = badges.filter(b => b.unlocked).length;
    if (unlocked > prevBadgeCount.current && prevBadgeCount.current > 0) {
      setConfettiTrigger(n => n + 1);
    }
    prevBadgeCount.current = unlocked;
  }, [badges]);

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto relative font-golos"
      style={{ background: 'linear-gradient(160deg, #fff9f0 0%, #f0fffe 50%, #fff0f9 100%)' }}>
      <Confetti trigger={confettiTrigger} />

      {/* Header */}
      <header className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '2px solid rgba(255,159,74,0.15)',
        }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐿️</span>
          <div>
            <p className="text-xs font-bold leading-none" style={{ color: '#FF9F4A' }}>Money Explorer</p>
            <p className="text-sm font-black text-gray-800 leading-none mt-0.5">
              {tab === 'home' ? 'Главная' :
               tab === 'jars' ? 'Мои монетки' :
               tab === 'goals' ? 'Мои цели' :
               tab === 'games' ? 'Игры' : 'Достижения'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Total coins badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl"
            style={{ background: '#fff8ee', border: '2px solid #FF9F4A44' }}>
            <span className="text-base">🪙</span>
            <span className="text-base font-black" style={{ color: '#FF9F4A' }}>{totalCoins}</span>
          </div>
          {/* Parent button */}
          <button onClick={() => setShowParent(true)}
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg transition-all hover:scale-110"
            style={{ background: '#f3f4f6' }}>
            👪
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {tab === 'home' && (
          <KidsHome
            childName={state.childName}
            totalCoins={totalCoins}
            jars={state.jars}
            badges={badges}
            saverStreak={saverStreak}
            onSetName={setChildName}
            onNavigate={(t) => setTab(t as KidsTab)}
          />
        )}
        {tab === 'jars' && (
          <KidsJars
            jars={state.jars}
            onAddToJar={addToJar}
            onSpendFromJar={spendFromJar}
            transactions={state.transactions}
          />
        )}
        {tab === 'goals' && (
          <KidsGoals
            goals={state.goals}
            jars={state.jars}
            onAddGoal={addGoal}
            onAddToGoal={addToGoal}
            onRemoveGoal={removeGoal}
            onConfetti={() => setConfettiTrigger(n => n + 1)}
          />
        )}
        {tab === 'games' && (
          <KidsGames
            quizCompleted={state.quizCompleted}
            scenarioCompleted={state.scenarioCompleted}
            onQuizComplete={markQuizCompleted}
            onScenarioComplete={markScenarioCompleted}
          />
        )}
        {tab === 'badges' && (
          <KidsBadges badges={badges} />
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40 px-3 pb-3 pt-2"
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '2px solid rgba(255,159,74,0.15)',
        }}>
        <div className="flex justify-around">
          {NAV.map(item => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all duration-200"
                style={{ background: isActive ? item.color + '22' : 'transparent' }}
              >
                <span className="text-2xl leading-tight transition-all duration-200"
                  style={{ transform: isActive ? 'scale(1.25)' : 'scale(1)', filter: isActive ? 'none' : 'grayscale(0.4) opacity(0.6)' }}>
                  {item.emoji}
                </span>
                <span className="text-xs font-bold leading-tight"
                  style={{ color: isActive ? item.color : '#aaa' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Parent panel */}
      {showParent && (
        <ParentPanel
          state={state}
          badges={badges}
          onAddAllowance={addAllowance}
          onClose={() => setShowParent(false)}
        />
      )}
    </div>
  );
}
