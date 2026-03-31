import { useState } from 'react';
import { useFinance, EXPENSE_CATEGORIES } from '@/hooks/useFinance';

function formatAmount(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₽';
}

interface PieSlice {
  color: string;
  pct: number;
  label: string;
  emoji: string;
  total: number;
  startAngle: number;
  endAngle: number;
}

function PieChart({ slices }: { slices: PieSlice[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const cx = 100, cy = 100, r = 80, innerR = 50;

  function polarToXY(angle: number, radius: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function describeArc(start: number, end: number, outerR: number, innerR: number) {
    if (end - start >= 360) end = start + 359.99;
    const outer1 = polarToXY(start, outerR);
    const outer2 = polarToXY(end, outerR);
    const inner1 = polarToXY(start, innerR);
    const inner2 = polarToXY(end, innerR);
    const large = end - start > 180 ? 1 : 0;
    return [
      `M ${outer1.x} ${outer1.y}`,
      `A ${outerR} ${outerR} 0 ${large} 1 ${outer2.x} ${outer2.y}`,
      `L ${inner2.x} ${inner2.y}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${inner1.x} ${inner1.y}`,
      'Z',
    ].join(' ');
  }

  const hoveredSlice = hovered !== null ? slices[hovered] : null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {slices.map((s, i) => {
            const isHovered = hovered === i;
            const scaleFactor = isHovered ? 1.05 : 1;
            const midAngle = (s.startAngle + s.endAngle) / 2;
            const dx = isHovered ? Math.cos(((midAngle - 90) * Math.PI) / 180) * 4 : 0;
            const dy = isHovered ? Math.sin(((midAngle - 90) * Math.PI) / 180) * 4 : 0;
            return (
              <path
                key={i}
                d={describeArc(s.startAngle, s.endAngle, r * scaleFactor, innerR * scaleFactor)}
                fill={s.color}
                opacity={hovered !== null && !isHovered ? 0.5 : 1}
                transform={`translate(${dx}, ${dy})`}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onTouchStart={() => setHovered(i)}
                onTouchEnd={() => setHovered(null)}
              />
            );
          })}
          {hoveredSlice ? (
            <>
              <text x="100" y="93" textAnchor="middle" fontSize="22" fill="white">{hoveredSlice.emoji}</text>
              <text x="100" y="110" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.7)" fontFamily="Golos Text">{hoveredSlice.label}</text>
              <text x="100" y="124" textAnchor="middle" fontSize="11" fill="white" fontWeight="700" fontFamily="Golos Text">{Math.round(hoveredSlice.pct)}%</text>
            </>
          ) : (
            <text x="100" y="106" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.4)" fontFamily="Golos Text">Тапни</text>
          )}
        </svg>
      </div>
    </div>
  );
}

type Period = 'all' | 'month' | 'week';

export default function Charts() {
  const { expenses, totalExpenses } = useFinance();
  const [period, setPeriod] = useState<Period>('all');

  function filterByPeriod(txs: typeof expenses) {
    const now = new Date();
    if (period === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1);
      weekStart.setHours(0, 0, 0, 0);
      return txs.filter(t => new Date(t.date) >= weekStart);
    }
    if (period === 'month') {
      return txs.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    return txs;
  }

  const filtered = filterByPeriod(expenses);
  const periodTotal = filtered.reduce((s, t) => s + t.amount, 0);

  const categoryData = EXPENSE_CATEGORIES.map(cat => ({
    ...cat,
    total: filtered.filter(t => t.category === cat.value).reduce((s, t) => s + t.amount, 0),
    pct: periodTotal > 0 ? (filtered.filter(t => t.category === cat.value).reduce((s, t) => s + t.amount, 0) / periodTotal) * 100 : 0,
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  let angle = 0;
  const slices: PieSlice[] = categoryData.map(cat => {
    const sweep = (cat.pct / 100) * 360;
    const slice = { ...cat, startAngle: angle, endAngle: angle + sweep };
    angle += sweep;
    return slice;
  });

  const dailyMap: Record<string, number> = {};
  filtered.forEach(t => {
    const day = new Date(t.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    dailyMap[day] = (dailyMap[day] || 0) + t.amount;
  });
  const dailyEntries = Object.entries(dailyMap).slice(-7);
  const maxDaily = Math.max(...dailyEntries.map(([, v]) => v), 1);

  return (
    <div className="pb-24 animate-fade-in">
      {/* Period selector */}
      <div className="px-4 pt-4">
        <div className="glass rounded-2xl p-1.5 flex gap-1">
          {(['all', 'month', 'week'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                period === p ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {p === 'all' ? 'Всё время' : p === 'month' ? 'Месяц' : 'Неделя'}
            </button>
          ))}
        </div>
      </div>

      {periodTotal === 0 ? (
        <div className="text-center py-16 mt-8">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-white/40 text-sm">Нет данных за этот период</p>
        </div>
      ) : (
        <>
          {/* Pie Chart */}
          <div className="mx-4 mt-4 glass rounded-3xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-xs text-white/50">Расходы за период</p>
                <p className="text-2xl font-black text-white">{formatAmount(periodTotal)}</p>
              </div>
            </div>
            {slices.length > 0 && <PieChart slices={slices} />}
            {/* Legend */}
            <div className="mt-4 space-y-2">
              {categoryData.map(cat => (
                <div key={cat.value} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                  <span className="text-sm text-white/70 flex-1">{cat.emoji} {cat.label}</span>
                  <span className="text-sm font-semibold text-white">{formatAmount(cat.total)}</span>
                  <span className="text-xs text-white/40 w-10 text-right">{Math.round(cat.pct)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar chart by day */}
          {dailyEntries.length > 1 && (
            <div className="mx-4 mt-4 glass rounded-3xl p-5">
              <p className="text-sm font-semibold text-white/60 mb-4">Расходы по дням</p>
              <div className="flex items-end gap-2 h-28">
                {dailyEntries.map(([day, val]) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-xs text-white/60 font-semibold"
                      style={{ fontSize: '10px', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                      {formatAmount(val).replace(' ₽', '')}
                    </p>
                    <div
                      className="w-full rounded-t-lg transition-all duration-500"
                      style={{
                        height: `${(val / maxDaily) * 80}px`,
                        background: `linear-gradient(180deg, #22c55e, #16a34a)`,
                        minHeight: '4px',
                      }}
                    />
                    <p className="text-xs text-white/40" style={{ fontSize: '9px' }}>{day}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All-time total */}
          {period !== 'all' && totalExpenses > 0 && (
            <div className="mx-4 mt-4 glass rounded-2xl p-4 flex justify-between items-center">
              <p className="text-sm text-white/50">Всего за всё время</p>
              <p className="text-lg font-bold text-white">{formatAmount(totalExpenses)}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
