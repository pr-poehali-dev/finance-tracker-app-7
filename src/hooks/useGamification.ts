import { useState, useEffect, useCallback } from 'react';
import { Transaction } from './useFinance';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: 'no_category' | 'save_amount' | 'add_records' | 'no_expense_days' | 'income_goal';
  target: number;
  category?: string;
  durationDays: number;
  reward: string;
  color: string;
}

export interface ActiveChallenge {
  challengeId: string;
  startDate: string;
  progress: number;
  completed: boolean;
  completedDate?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  condition: (txs: Transaction[], active: ActiveChallenge[]) => boolean;
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'no_cafe_7',
    title: '7 дней без кафе',
    description: 'Не тратить деньги в кафе 7 дней подряд',
    emoji: '☕',
    type: 'no_category',
    category: 'cafe',
    target: 7,
    durationDays: 7,
    reward: 'Бариста-детокс',
    color: '#f97316',
  },
  {
    id: 'save_5000',
    title: 'Отложить 5 000 ₽',
    description: 'Накопить 5 000 ₽ за месяц: доходы минус расходы',
    emoji: '🐷',
    type: 'save_amount',
    target: 5000,
    durationDays: 30,
    reward: 'Копилка',
    color: '#22c55e',
  },
  {
    id: 'no_shopping_14',
    title: '14 дней без покупок',
    description: 'Не тратить на спонтанные покупки 2 недели',
    emoji: '🛍️',
    type: 'no_category',
    category: 'shopping',
    target: 14,
    durationDays: 14,
    reward: 'Шопоголик в ремиссии',
    color: '#ec4899',
  },
  {
    id: 'records_20',
    title: '20 записей подряд',
    description: 'Добавить 20 транзакций — войди в привычку',
    emoji: '📝',
    type: 'add_records',
    target: 20,
    durationDays: 30,
    reward: 'Бухгалтер',
    color: '#3b82f6',
  },
  {
    id: 'no_expense_3',
    title: '3 дня без расходов',
    description: 'Прожить 3 дня вообще без трат',
    emoji: '🧘',
    type: 'no_expense_days',
    target: 3,
    durationDays: 7,
    reward: 'Дзен-финансист',
    color: '#06b6d4',
  },
  {
    id: 'income_10000',
    title: 'Доход 10 000 ₽ за месяц',
    description: 'Зафиксировать доходы на сумму 10 000 ₽ и более',
    emoji: '💼',
    type: 'income_goal',
    target: 10000,
    durationDays: 30,
    reward: 'Зарабатыватель',
    color: '#a855f7',
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_record',
    title: 'Первый шаг',
    description: 'Добавь первую транзакцию',
    emoji: '🚀',
    color: '#22c55e',
    condition: (txs) => txs.length >= 1,
  },
  {
    id: 'ten_records',
    title: 'Продвинутый',
    description: '10 записей в трекере',
    emoji: '⭐',
    color: '#f97316',
    condition: (txs) => txs.length >= 10,
  },
  {
    id: 'fifty_records',
    title: 'Эксперт',
    description: '50 записей — ты профи!',
    emoji: '🏆',
    color: '#fbbf24',
    condition: (txs) => txs.length >= 50,
  },
  {
    id: 'first_income',
    title: 'Первый доход',
    description: 'Зафиксировал первый доход',
    emoji: '💰',
    color: '#22c55e',
    condition: (txs) => txs.some(t => t.type === 'income'),
  },
  {
    id: 'diversified',
    title: 'Диверсификатор',
    description: 'Используй 5 разных категорий',
    emoji: '🎨',
    color: '#a855f7',
    condition: (txs) => new Set(txs.map(t => t.category)).size >= 5,
  },
  {
    id: 'saver',
    title: 'Экономист месяца',
    description: 'Баланс больше 0 при 10+ записях',
    emoji: '🏦',
    color: '#3b82f6',
    condition: (txs) => {
      if (txs.length < 10) return false;
      const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return income > expenses;
    },
  },
  {
    id: 'challenge_done',
    title: 'Цель достигнута',
    description: 'Выполни любой челлендж',
    emoji: '🎯',
    color: '#ec4899',
    condition: (_txs, active) => active.some(c => c.completed),
  },
  {
    id: 'big_income',
    title: 'Большой доход',
    description: 'Одна транзакция дохода от 50 000 ₽',
    emoji: '💎',
    color: '#06b6d4',
    condition: (txs) => txs.some(t => t.type === 'income' && t.amount >= 50000),
  },
];

export type UserLevel = 'novice' | 'advanced' | 'expert';

export function getUserLevel(count: number): { level: UserLevel; label: string; emoji: string; color: string; next: number } {
  if (count >= 50) return { level: 'expert', label: 'Эксперт', emoji: '🏆', color: '#fbbf24', next: 50 };
  if (count >= 10) return { level: 'advanced', label: 'Продвинутый', emoji: '⭐', color: '#a855f7', next: 50 };
  return { level: 'novice', label: 'Новичок', emoji: '🌱', color: '#22c55e', next: 10 };
}

const GAMIFICATION_KEY = 'finance_pro_gamification';

interface GamificationState {
  activeChallenges: ActiveChallenge[];
  unlockedAchievements: string[];
  seenAchievements: string[];
}

function loadState(): GamificationState {
  try {
    const raw = localStorage.getItem(GAMIFICATION_KEY);
    return raw ? JSON.parse(raw) : { activeChallenges: [], unlockedAchievements: [], seenAchievements: [] };
  } catch {
    return { activeChallenges: [], unlockedAchievements: [], seenAchievements: [] };
  }
}

function computeChallengeProgress(challenge: Challenge, active: ActiveChallenge, transactions: Transaction[]): number {
  const start = new Date(active.startDate);
  const txsSince = transactions.filter(t => new Date(t.date) >= start);

  if (challenge.type === 'no_category') {
    const end = new Date(start);
    end.setDate(end.getDate() + challenge.durationDays);
    const txsInWindow = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
    const hasBadTx = txsInWindow.some(t => t.category === challenge.category && t.type === 'expense');
    if (hasBadTx) return 0;
    const daysPassed = Math.min(
      Math.floor((Date.now() - start.getTime()) / 86400000),
      challenge.target
    );
    return daysPassed;
  }

  if (challenge.type === 'save_amount') {
    const income = txsSince.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = txsSince.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return Math.max(0, income - expenses);
  }

  if (challenge.type === 'add_records') {
    return txsSince.length;
  }

  if (challenge.type === 'no_expense_days') {
    const expenseDates = new Set(
      txsSince.filter(t => t.type === 'expense').map(t => new Date(t.date).toDateString())
    );
    let streak = 0;
    for (let i = 0; i < challenge.durationDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      if (!expenseDates.has(d.toDateString())) streak++;
      else streak = 0;
    }
    return streak;
  }

  if (challenge.type === 'income_goal') {
    return txsSince.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  }

  return 0;
}

export function useGamification(transactions: Transaction[]) {
  const [state, setState] = useState<GamificationState>(loadState);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(state));
  }, [state]);

  const updatedChallenges = state.activeChallenges.map(ac => {
    if (ac.completed) return ac;
    const challenge = CHALLENGES.find(c => c.id === ac.challengeId);
    if (!challenge) return ac;
    const progress = computeChallengeProgress(challenge, ac, transactions);
    const completed = progress >= challenge.target;
    return { ...ac, progress, completed, completedDate: completed && !ac.completed ? new Date().toISOString() : ac.completedDate };
  });

  const unlockedIds = new Set(state.unlockedAchievements);
  ACHIEVEMENTS.forEach(ach => {
    if (!unlockedIds.has(ach.id) && ach.condition(transactions, updatedChallenges)) {
      unlockedIds.add(ach.id);
    }
  });

  useEffect(() => {
    const newUnlocked = ACHIEVEMENTS.filter(
      a => unlockedIds.has(a.id) && !state.unlockedAchievements.includes(a.id)
    );
    const newCompleted = updatedChallenges.filter(
      ac => ac.completed && !state.activeChallenges.find(old => old.challengeId === ac.challengeId)?.completed
    );

    if (newUnlocked.length > 0 || newCompleted.length > 0) {
      setState(prev => ({
        ...prev,
        activeChallenges: updatedChallenges,
        unlockedAchievements: [...unlockedIds],
      }));
      setConfettiTrigger(n => n + 1);
      if (newUnlocked.length > 0) setNewAchievement(newUnlocked[0]);
    } else if (JSON.stringify(updatedChallenges) !== JSON.stringify(state.activeChallenges)) {
      setState(prev => ({ ...prev, activeChallenges: updatedChallenges }));
    }
  }, [transactions]);

  const startChallenge = useCallback((challengeId: string) => {
    setState(prev => {
      if (prev.activeChallenges.some(c => c.challengeId === challengeId)) return prev;
      return {
        ...prev,
        activeChallenges: [
          ...prev.activeChallenges,
          { challengeId, startDate: new Date().toISOString(), progress: 0, completed: false },
        ],
      };
    });
  }, []);

  const removeChallenge = useCallback((challengeId: string) => {
    setState(prev => ({
      ...prev,
      activeChallenges: prev.activeChallenges.filter(c => c.challengeId !== challengeId),
    }));
  }, []);

  const dismissAchievement = useCallback(() => setNewAchievement(null), []);

  const achievements = ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: state.unlockedAchievements.includes(a.id),
  }));

  const activeChallenges = updatedChallenges;
  const userLevel = getUserLevel(transactions.length);

  return {
    activeChallenges,
    achievements,
    startChallenge,
    removeChallenge,
    confettiTrigger,
    newAchievement,
    dismissAchievement,
    userLevel,
  };
}
