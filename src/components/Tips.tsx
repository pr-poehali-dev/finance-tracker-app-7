import { useFinance, EXPENSE_CATEGORIES, FINANCIAL_TIPS, ExpenseCategory } from '@/hooks/useFinance';
import Icon from '@/components/ui/icon';

function formatAmount(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₽';
}

const ALL_TIPS = [
  {
    icon: 'PiggyBank',
    color: '#22c55e',
    title: 'Правило 50/30/20',
    text: '50% дохода — на нужды, 30% — на желания, 20% — на сбережения. Это золотой стандарт личных финансов.',
  },
  {
    icon: 'Shield',
    color: '#3b82f6',
    title: 'Финансовая подушка',
    text: 'Держите на счёте сумму равную 3–6 месяцам расходов. Это защитит вас от неожиданностей.',
  },
  {
    icon: 'TrendingUp',
    color: '#a855f7',
    title: 'Инвестируйте регулярно',
    text: 'Даже 1 000₽ в месяц, вложенных в индексный фонд, за 10 лет превратятся в значительную сумму благодаря сложному проценту.',
  },
  {
    icon: 'CreditCard',
    color: '#ef4444',
    title: 'Долги — враг богатства',
    text: 'Погашайте кредиты с наибольшей процентной ставкой в первую очередь. Каждый рубль долга стоит дороже, чем кажется.',
  },
  {
    icon: 'Target',
    color: '#f97316',
    title: 'Финансовые цели',
    text: 'Ставьте конкретные цели: "накопить 100 000₽ за 6 месяцев" лучше, чем "откладывать деньги". Конкретика работает.',
  },
  {
    icon: 'Zap',
    color: '#06b6d4',
    title: 'Автоматизируйте сбережения',
    text: 'Настройте автоперевод 10–20% зарплаты на накопительный счёт в день получения. То, чего не видишь — не тратишь.',
  },
];

export default function Tips() {
  const { expenseByCategory, topCategory, financialTip, totalExpenses } = useFinance();

  const topThree = expenseByCategory.slice(0, 3);

  return (
    <div className="pb-24 animate-fade-in">
      {/* Personalized tip */}
      {financialTip && topCategory && (
        <div className="mx-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #a855f7, #3b82f6)' }} />
            <h2 className="text-sm font-bold text-white/80">Персональный совет</h2>
          </div>
          <div
            className="rounded-3xl p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.2))', border: '1px solid rgba(168,85,247,0.35)' }}
          >
            <div className="absolute top-0 right-0 text-6xl opacity-20 leading-none pt-2 pr-2">💡</div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{topCategory.emoji}</span>
                <div>
                  <p className="text-xs text-purple-300 font-medium">Топ-категория расходов</p>
                  <p className="text-base font-bold text-white">{topCategory.label} · {formatAmount(topCategory.total)}</p>
                </div>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{financialTip}</p>
            </div>
          </div>
        </div>
      )}

      {/* Spending breakdown tips */}
      {topThree.length > 0 && (
        <div className="mx-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #f97316, #ec4899)' }} />
            <h2 className="text-sm font-bold text-white/80">Анализ трат</h2>
          </div>
          <div className="space-y-2">
            {topThree.map((cat, i) => {
              const pct = totalExpenses > 0 ? Math.round((cat.total / totalExpenses) * 100) : 0;
              const tip = FINANCIAL_TIPS[cat.value as ExpenseCategory];
              return (
                <div key={cat.value} className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
                      style={{ background: cat.color + '33', color: cat.color }}
                    >
                      #{i + 1}
                    </div>
                    <span className="text-xl">{cat.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{cat.label}</p>
                      <p className="text-xs text-white/40">{pct}% от всех расходов</p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: cat.color }}>{formatAmount(cat.total)}</p>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed pl-11">{tip}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Universal tips */}
      <div className="mx-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #22c55e, #06b6d4)' }} />
          <h2 className="text-sm font-bold text-white/80">Основы финансовой грамотности</h2>
        </div>
        <div className="space-y-3">
          {ALL_TIPS.map((tip, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-4 glass-hover"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: tip.color + '22' }}
                >
                  <Icon name={tip.icon as "PiggyBank"} size={18} style={{ color: tip.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">{tip.title}</p>
                  <p className="text-sm text-white/60 leading-relaxed">{tip.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state for personalized */}
      {!financialTip && (
        <div className="mx-4 mt-4 glass rounded-2xl p-5 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-sm font-semibold text-white mb-1">Персональные советы появятся позже</p>
          <p className="text-xs text-white/40">Добавьте хотя бы несколько расходов, чтобы мы могли проанализировать ваши траты</p>
        </div>
      )}
    </div>
  );
}
