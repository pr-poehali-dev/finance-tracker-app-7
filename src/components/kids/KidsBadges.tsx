interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  unlocked: boolean;
}

interface KidsBadgesProps {
  badges: Badge[];
}

export default function KidsBadges({ badges }: KidsBadgesProps) {
  const unlocked = badges.filter(b => b.unlocked);
  const locked = badges.filter(b => !b.unlocked);

  return (
    <div className="pb-28 px-4 pt-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-2">🏅</div>
        <h2 className="text-2xl font-black text-gray-800">Мои достижения</h2>
        <p className="text-gray-500 text-sm mt-1">Получено: {unlocked.length} из {badges.length}</p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-3xl p-4 mb-5" style={{ border: '3px solid #FFE66D' }}>
        <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
          <span>Прогресс коллекции</span>
          <span style={{ color: '#FF9F4A' }}>{Math.round((unlocked.length / badges.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
          <div className="h-4 rounded-full transition-all duration-700"
            style={{
              width: `${(unlocked.length / badges.length) * 100}%`,
              background: 'linear-gradient(90deg, #FFE66D, #FF9F4A)',
            }} />
        </div>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <>
          <h3 className="text-base font-black text-gray-700 mb-3">✅ Получено!</h3>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {unlocked.map(badge => (
              <div key={badge.id} className="rounded-3xl p-4 flex flex-col items-center text-center gap-2"
                style={{
                  background: badge.color + '18',
                  border: `3px solid ${badge.color}55`,
                }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
                  style={{ background: badge.color + '25' }}>
                  {badge.emoji}
                </div>
                <p className="font-black text-gray-800 text-sm leading-tight">{badge.title}</p>
                <p className="text-xs text-gray-500 leading-tight">{badge.description}</p>
                <div className="w-2 h-2 rounded-full" style={{ background: badge.color }} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <>
          <h3 className="text-base font-black text-gray-400 mb-3">🔒 Ещё не получено</h3>
          <div className="grid grid-cols-2 gap-3">
            {locked.map(badge => (
              <div key={badge.id} className="rounded-3xl p-4 flex flex-col items-center text-center gap-2 opacity-60"
                style={{ background: '#f9f9f9', border: '3px solid #e5e7eb' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-gray-200">
                  🔒
                </div>
                <p className="font-black text-gray-500 text-sm leading-tight">{badge.title}</p>
                <p className="text-xs text-gray-400 leading-tight">{badge.description}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {unlocked.length === badges.length && (
        <div className="mt-6 bg-yellow-50 rounded-3xl p-6 text-center"
          style={{ border: '3px solid #FFE66D' }}>
          <p className="text-4xl mb-2">🎊</p>
          <p className="font-black text-gray-800 text-lg">Все достижения получены!</p>
          <p className="text-gray-500 text-sm mt-1">🐿️ Спарки очень гордится тобой!</p>
        </div>
      )}
    </div>
  );
}
