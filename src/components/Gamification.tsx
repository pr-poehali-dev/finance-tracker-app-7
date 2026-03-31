import { useState } from 'react';
import { CHALLENGES, Challenge, ActiveChallenge } from '@/hooks/useGamification';
import Icon from '@/components/ui/icon';

interface GamificationProps {
  activeChallenges: ActiveChallenge[];
  achievements: Array<{ id: string; title: string; description: string; emoji: string; color: string; unlocked: boolean }>;
  userLevel: { label: string; emoji: string; color: string; next: number };
  onStartChallenge: (id: string) => void;
  onRemoveChallenge: (id: string) => void;
  txCount: number;
}

function ChallengeProgressBar({ challenge, active }: { challenge: Challenge; active: ActiveChallenge }) {
  const pct = Math.min((active.progress / challenge.target) * 100, 100);
  const isCompleted = active.completed;

  let progressLabel = '';
  if (challenge.type === 'save_amount' || challenge.type === 'income_goal') {
    progressLabel = `${active.progress.toLocaleString('ru-RU')} / ${challenge.target.toLocaleString('ru-RU')} ₽`;
  } else {
    progressLabel = `${Math.round(active.progress)} / ${challenge.target}`;
  }

  const startDate = new Date(active.startDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + challenge.durationDays);
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000));

  return (
    <div
      className="rounded-2xl p-4 transition-all duration-300"
      style={{
        background: isCompleted
          ? `linear-gradient(135deg, ${challenge.color}22, ${challenge.color}11)`
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isCompleted ? challenge.color + '66' : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{challenge.emoji}</span>
          <div>
            <p className="text-sm font-bold text-white">{challenge.title}</p>
            <p className="text-xs text-white/50">{challenge.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {isCompleted ? (
            <span className="text-lg">🎉</span>
          ) : (
            <button
              onClick={() => {}}
              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            >
            </button>
          )}
        </div>
      </div>

      <div className="w-full bg-white/10 rounded-full h-2 mb-2">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: isCompleted
              ? `linear-gradient(90deg, ${challenge.color}, #ffffff88)`
              : `linear-gradient(90deg, ${challenge.color}, ${challenge.color}aa)`,
          }}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold" style={{ color: challenge.color }}>{progressLabel}</span>
        {isCompleted ? (
          <span className="text-xs font-bold text-green-400">✓ Выполнено!</span>
        ) : (
          <span className="text-xs text-white/40">{daysLeft > 0 ? `${daysLeft} дн. осталось` : 'Время вышло'}</span>
        )}
      </div>
    </div>
  );
}

export default function Gamification({ activeChallenges, achievements, userLevel, onStartChallenge, onRemoveChallenge, txCount }: GamificationProps) {
  const [tab, setTab] = useState<'challenges' | 'achievements'>('challenges');

  const activeIds = new Set(activeChallenges.map(c => c.challengeId));
  const availableChallenges = CHALLENGES.filter(c => !activeIds.has(c.id));
  const myChallenges = activeChallenges.map(ac => ({
    ac,
    challenge: CHALLENGES.find(c => c.id === ac.challengeId)!,
  })).filter(x => x.challenge);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const nextLevel = userLevel.level === 'novice' ? 10 : userLevel.level === 'advanced' ? 50 : 50;
  const levelPct = userLevel.level === 'expert' ? 100 : Math.min((txCount / nextLevel) * 100, 100);

  return (
    <div className="pb-24 animate-fade-in">
      {/* User Level Card */}
      <div className="mx-4 mt-4 rounded-3xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.15))', border: '1px solid rgba(168,85,247,0.3)' }}>
        <div className="absolute top-2 right-3 text-5xl opacity-10 leading-none">{userLevel.emoji}</div>
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: userLevel.color + '33', border: `2px solid ${userLevel.color}66` }}>
            {userLevel.emoji}
          </div>
          <div className="flex-1">
            <p className="text-xs text-white/50 mb-0.5">Твой уровень</p>
            <p className="text-xl font-black text-white">{userLevel.label}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-white/10 rounded-full h-1.5">
                <div className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${levelPct}%`, background: `linear-gradient(90deg, ${userLevel.color}, ${userLevel.color}88)` }} />
              </div>
              <span className="text-xs text-white/40">{txCount} / {nextLevel} записей</span>
            </div>
          </div>
        </div>
        {userLevel.level !== 'expert' && (
          <p className="text-xs text-white/40 mt-3 relative">
            До следующего уровня: ещё {Math.max(0, nextLevel - txCount)} записей
          </p>
        )}
      </div>

      {/* Tab switcher */}
      <div className="px-4 mt-4">
        <div className="glass rounded-2xl p-1.5 flex gap-1">
          <button onClick={() => setTab('challenges')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'challenges' ? 'bg-white/10 text-white' : 'text-white/40'
            }`}>
            <span>🎯</span> Челленджи
            {myChallenges.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
                {myChallenges.length}
              </span>
            )}
          </button>
          <button onClick={() => setTab('achievements')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'achievements' ? 'bg-white/10 text-white' : 'text-white/40'
            }`}>
            <span>🏅</span> Достижения
            <span className="text-xs text-white/40">({unlockedCount}/{achievements.length})</span>
          </button>
        </div>
      </div>

      {tab === 'challenges' && (
        <div className="px-4 mt-4 space-y-4">
          {/* Active challenges */}
          {myChallenges.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-5 rounded-full bg-purple-500" />
                <h3 className="text-sm font-bold text-white/80">Активные челленджи</h3>
              </div>
              <div className="space-y-2">
                {myChallenges.map(({ ac, challenge }) => (
                  <div key={ac.challengeId} className="relative group">
                    <ChallengeProgressBar challenge={challenge} active={ac} />
                    {!ac.completed && (
                      <button
                        onClick={() => onRemoveChallenge(ac.challengeId)}
                        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                      >
                        <Icon name="X" size={14} className="text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available challenges */}
          {availableChallenges.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #22c55e, #06b6d4)' }} />
                <h3 className="text-sm font-bold text-white/80">Доступные челленджи</h3>
              </div>
              <div className="space-y-2">
                {availableChallenges.map(challenge => (
                  <div key={challenge.id}
                    className="glass rounded-2xl p-4 flex items-center gap-3 glass-hover">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: challenge.color + '22' }}>
                      {challenge.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{challenge.title}</p>
                      <p className="text-xs text-white/50 mt-0.5">{challenge.description}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Icon name="Clock" size={10} className="text-white/30" />
                        <span className="text-xs text-white/30">{challenge.durationDays} дней</span>
                        <span className="text-white/20">·</span>
                        <span className="text-xs font-medium" style={{ color: challenge.color }}>🏅 {challenge.reward}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onStartChallenge(challenge.id)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0 transition-all hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${challenge.color}, ${challenge.color}99)`,
                        boxShadow: `0 2px 12px ${challenge.color}44`,
                      }}
                    >
                      Начать
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {myChallenges.length === 0 && availableChallenges.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🎊</div>
              <p className="text-white/40 text-sm">Все челленджи выполнены!</p>
            </div>
          )}
        </div>
      )}

      {tab === 'achievements' && (
        <div className="px-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            {achievements.map(ach => (
              <div
                key={ach.id}
                className="rounded-2xl p-4 flex flex-col items-center text-center gap-2 transition-all duration-300"
                style={{
                  background: ach.unlocked ? `linear-gradient(135deg, ${ach.color}22, ${ach.color}11)` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${ach.unlocked ? ach.color + '55' : 'rgba(255,255,255,0.06)'}`,
                  opacity: ach.unlocked ? 1 : 0.5,
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{
                    background: ach.unlocked ? ach.color + '33' : 'rgba(255,255,255,0.05)',
                    filter: ach.unlocked ? 'none' : 'grayscale(1)',
                  }}
                >
                  {ach.unlocked ? ach.emoji : '🔒'}
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{ach.title}</p>
                  <p className="text-xs text-white/40 mt-0.5 leading-tight">{ach.description}</p>
                </div>
                {ach.unlocked && (
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ach.color }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
