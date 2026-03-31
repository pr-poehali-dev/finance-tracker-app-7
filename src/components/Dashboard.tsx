import { useFinance } from '@/hooks/useFinance';
import Icon from '@/components/ui/icon';

function formatAmount(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₽';
}

export default function Dashboard() {
  const {
    balance,
    totalExpenses,
    totalIncome,
    todayExpenses,
    weekExpenses,
    monthExpenses,
    monthIncome,
    topCategory,
    financialTip,
    expenseByCategory,
  } = useFinance();

  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  return (
    <div className="pb-24 animate-fade-in">
      {/* Hero Balance Card */}
      <div className="mx-4 mt-4 rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f2027, #1a3a2a, #203a43)' }}>
        <div className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(ellipse at 30% 50%, #22c55e 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #a855f7 0%, transparent 50%)' }} />
        <div className="relative z-10">
          <p className="text-sm text-white/60 font-medium mb-1">Общий баланс</p>
          <h1 className={`text-4xl font-black mb-4 ${balance >= 0 ? 'text-gradient-green' : 'text-gradient-red'}`}>
            {balance >= 0 ? '+' : ''}{formatAmount(balance)}
          </h1>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-white/50">Доходы</span>
              </div>
              <p className="text-lg font-bold text-green-400">{formatAmount(totalIncome)}</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs text-white/50">Расходы</span>
              </div>
              <p className="text-lg font-bold text-red-400">{formatAmount(totalExpenses)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Period Stats */}
      <div className="px-4 mt-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Сегодня', value: todayExpenses, icon: 'Sun', color: '#f97316' },
          { label: 'Неделя', value: weekExpenses, icon: 'Calendar', color: '#3b82f6' },
          { label: 'Месяц', value: monthExpenses, icon: 'CalendarDays', color: '#a855f7' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-4 glass-hover">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
              style={{ background: stat.color + '22' }}>
              <Icon name={stat.icon as "Sun"} size={16} style={{ color: stat.color }} />
            </div>
            <p className="text-xs text-white/50 mb-1">{stat.label}</p>
            <p className="text-base font-bold text-white">{formatAmount(stat.value)}</p>
          </div>
        ))}
      </div>

      {/* Savings Rate */}
      {totalIncome > 0 && (
        <div className="mx-4 mt-4 glass rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm font-semibold text-white">Норма сбережений</p>
              <p className="text-xs text-white/40">За всё время</p>
            </div>
            <span className={`text-2xl font-black ${savingsRate >= 20 ? 'text-gradient-green' : savingsRate >= 0 ? 'text-white' : 'text-gradient-red'}`}>
              {savingsRate}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(Math.abs(savingsRate), 100)}%`,
                background: savingsRate >= 20 ? 'linear-gradient(90deg, #22c55e, #86efac)' :
                            savingsRate >= 0 ? 'linear-gradient(90deg, #f97316, #fbbf24)' :
                            'linear-gradient(90deg, #ef4444, #fca5a5)',
              }}
            />
          </div>
          <p className="text-xs text-white/40 mt-2">
            {savingsRate >= 20 ? '🎉 Отличный результат! Норма сбережений выше 20%' :
             savingsRate >= 10 ? '👍 Неплохо. Стремитесь к 20% и выше' :
             savingsRate >= 0 ? '⚠️ Откладывайте хотя бы 10% от дохода' :
             '🚨 Расходы превышают доходы — нужно действовать'}
          </p>
        </div>
      )}

      {/* Top Categories */}
      {expenseByCategory.length > 0 && (
        <div className="mx-4 mt-4">
          <h2 className="text-sm font-semibold text-white/60 mb-3 px-1">Топ расходов за всё время</h2>
          <div className="space-y-2">
            {expenseByCategory.slice(0, 5).map((cat) => {
              const pct = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
              return (
                <div key={cat.value} className="glass rounded-2xl p-3 flex items-center gap-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-white">{cat.label}</span>
                      <span className="text-sm font-bold" style={{ color: cat.color }}>{formatAmount(cat.total)}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: cat.color }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-white/40 w-10 text-right">{Math.round(pct)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Financial Tip */}
      {financialTip && topCategory && (
        <div className="mx-4 mt-4 rounded-2xl p-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(59,130,246,0.15))', border: '1px solid rgba(168,85,247,0.3)' }}>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(168,85,247,0.2)' }}>
              <Icon name="Lightbulb" size={18} style={{ color: '#a855f7' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-300 mb-1">Совет дня</p>
              <p className="text-sm text-white/80 leading-relaxed">{financialTip}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalExpenses === 0 && totalIncome === 0 && (
        <div className="mx-4 mt-8 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-lg font-bold text-white mb-2">Начните вести учёт</h3>
          <p className="text-sm text-white/50">Добавьте первый доход или расход, чтобы увидеть аналитику</p>
        </div>
      )}
    </div>
  );
}
