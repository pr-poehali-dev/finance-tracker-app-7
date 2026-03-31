import { useState } from 'react';
import Icon from '@/components/ui/icon';
import Dashboard from '@/components/Dashboard';
import AddTransaction from '@/components/AddTransaction';
import History from '@/components/History';
import Charts from '@/components/Charts';
import Tips from '@/components/Tips';
import { useFinance } from '@/hooks/useFinance';

type Tab = 'dashboard' | 'add' | 'history' | 'charts' | 'tips';

const NAV_ITEMS: { id: Tab; label: string; icon: string; activeColor: string }[] = [
  { id: 'dashboard', label: 'Главная', icon: 'LayoutDashboard', activeColor: '#22c55e' },
  { id: 'charts', label: 'Графики', icon: 'PieChart', activeColor: '#3b82f6' },
  { id: 'add', label: 'Добавить', icon: 'Plus', activeColor: '#a855f7' },
  { id: 'history', label: 'История', icon: 'Clock', activeColor: '#f97316' },
  { id: 'tips', label: 'Советы', icon: 'Lightbulb', activeColor: '#ec4899' },
];

const PAGE_TITLES: Record<Tab, string> = {
  dashboard: 'Обзор',
  add: 'Транзакция',
  history: 'История',
  charts: 'Аналитика',
  tips: 'Финграмота',
};

function formatAmount(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M ₽';
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(0) + 'K ₽';
  return n.toLocaleString('ru-RU') + ' ₽';
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { balance } = useFinance();

  return (
    <div className="min-h-screen mesh-bg font-golos flex flex-col max-w-lg mx-auto relative">
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
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
          >
            <span className="text-sm">💰</span>
          </div>
          <div>
            <p className="text-xs text-white/40 leading-none">ФинансыПро</p>
            <p className="text-sm font-bold text-white leading-none mt-0.5">{PAGE_TITLES[activeTab]}</p>
          </div>
        </div>
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
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'add' && <AddTransaction />}
        {activeTab === 'history' && <History />}
        {activeTab === 'charts' && <Charts />}
        {activeTab === 'tips' && <Tips />}
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

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center gap-1 py-1 px-2 min-w-[56px] transition-all duration-200"
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
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: item.activeColor }}
                    />
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
