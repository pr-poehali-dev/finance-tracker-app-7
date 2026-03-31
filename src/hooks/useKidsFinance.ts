import { useState, useEffect, useCallback } from 'react';

export interface SavingsGoal {
  id: string;
  name: string;
  emoji: string;
  target: number;
  saved: number;
  createdAt: string;
  completedAt?: string;
}

export interface KidsTransaction {
  id: string;
  type: 'income' | 'expense';
  jar: 'save' | 'spend' | 'share';
  amount: number;
  note: string;
  date: string;
}

export interface KidsBadge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  unlockedAt?: string;
}

export interface KidsState {
  childName: string;
  jars: { save: number; spend: number; share: number };
  goals: SavingsGoal[];
  transactions: KidsTransaction[];
  badges: string[];
  quizCompleted: boolean;
  scenarioCompleted: boolean;
  savingDays: string[];
  parentPin: string;
}

const STORAGE_KEY = 'money_explorer_v1';

const DEFAULT_STATE: KidsState = {
  childName: '',
  jars: { save: 0, spend: 0, share: 0 },
  goals: [],
  transactions: [],
  badges: [],
  quizCompleted: false,
  scenarioCompleted: false,
  savingDays: [],
  parentPin: '1234',
};

export const ALL_BADGES: KidsBadge[] = [
  { id: 'first_goal', title: 'Первая цель', description: 'Создал первую цель накопления', emoji: '🎯', color: '#FF9F4A' },
  { id: 'goal_reached', title: 'Цель достигнута!', description: 'Накопил на свою мечту', emoji: '🏆', color: '#FFE66D' },
  { id: 'quiz_master', title: 'Знаток', description: 'Прошёл викторину', emoji: '🧠', color: '#4ECDC4' },
  { id: 'saver_star', title: 'Звезда экономии', description: 'Откладывал 7 дней подряд', emoji: '⭐', color: '#a855f7' },
  { id: 'first_save', title: 'Первая монетка', description: 'Добавил монеты в копилку', emoji: '🐷', color: '#ec4899' },
  { id: 'sharer', title: 'Щедрое сердце', description: 'Поделился монетками', emoji: '💝', color: '#22c55e' },
  { id: 'scenario_player', title: 'Мудрец', description: 'Прошёл игру «Копить или тратить»', emoji: '🦉', color: '#3b82f6' },
];

function load(): KidsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useKidsFinance() {
  const [state, setState] = useState<KidsState>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const unlockBadge = useCallback((id: string) => {
    setState(prev => {
      if (prev.badges.includes(id)) return prev;
      return { ...prev, badges: [...prev.badges, id] };
    });
  }, []);

  const setChildName = useCallback((name: string) => {
    setState(prev => ({ ...prev, childName: name }));
  }, []);

  const addToJar = useCallback((jar: 'save' | 'spend' | 'share', amount: number, note = '') => {
    setState(prev => {
      const today = new Date().toDateString();
      const newSavingDays = jar === 'save' && !prev.savingDays.includes(today)
        ? [...prev.savingDays, today]
        : prev.savingDays;
      const tx: KidsTransaction = {
        id: genId(), type: 'income', jar, amount, note, date: new Date().toISOString(),
      };
      return {
        ...prev,
        jars: { ...prev.jars, [jar]: prev.jars[jar] + amount },
        transactions: [tx, ...prev.transactions],
        savingDays: newSavingDays,
      };
    });
    if (jar === 'save') unlockBadge('first_save');
    if (jar === 'share') unlockBadge('sharer');
  }, [unlockBadge]);

  const spendFromJar = useCallback((jar: 'save' | 'spend' | 'share', amount: number, note = '') => {
    setState(prev => {
      if (prev.jars[jar] < amount) return prev;
      const tx: KidsTransaction = {
        id: genId(), type: 'expense', jar, amount, note, date: new Date().toISOString(),
      };
      return {
        ...prev,
        jars: { ...prev.jars, [jar]: prev.jars[jar] - amount },
        transactions: [tx, ...prev.transactions],
      };
    });
  }, []);

  const addGoal = useCallback((name: string, emoji: string, target: number) => {
    setState(prev => ({
      ...prev,
      goals: [...prev.goals, { id: genId(), name, emoji, target, saved: 0, createdAt: new Date().toISOString() }],
    }));
    unlockBadge('first_goal');
  }, [unlockBadge]);

  const addToGoal = useCallback((goalId: string, amount: number) => {
    setState(prev => {
      const goals = prev.goals.map(g => {
        if (g.id !== goalId) return g;
        const saved = Math.min(g.saved + amount, g.target);
        const completed = saved >= g.target;
        return { ...g, saved, completedAt: completed && !g.completedAt ? new Date().toISOString() : g.completedAt };
      });
      const goal = goals.find(g => g.id === goalId);
      const newBadges = [...prev.badges];
      if (goal?.saved >= goal?.target && !prev.badges.includes('goal_reached')) {
        newBadges.push('goal_reached');
      }
      return { ...prev, goals, badges: newBadges };
    });
  }, []);

  const removeGoal = useCallback((goalId: string) => {
    setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== goalId) }));
  }, []);

  const markQuizCompleted = useCallback(() => {
    setState(prev => ({ ...prev, quizCompleted: true }));
    unlockBadge('quiz_master');
  }, [unlockBadge]);

  const markScenarioCompleted = useCallback(() => {
    setState(prev => ({ ...prev, scenarioCompleted: true }));
    unlockBadge('scenario_player');
  }, [unlockBadge]);

  const changePin = useCallback((newPin: string) => {
    setState(prev => ({ ...prev, parentPin: newPin }));
  }, []);

  const addAllowance = useCallback((save: number, spend: number, share: number) => {
    setState(prev => ({
      ...prev,
      jars: {
        save: prev.jars.save + save,
        spend: prev.jars.spend + spend,
        share: prev.jars.share + share,
      },
      transactions: [
        { id: genId(), type: 'income', jar: 'save', amount: save, note: 'Карманные деньги', date: new Date().toISOString() },
        { id: genId(), type: 'income', jar: 'spend', amount: spend, note: 'Карманные деньги', date: new Date().toISOString() },
        { id: genId(), type: 'income', jar: 'share', amount: share, note: 'Карманные деньги', date: new Date().toISOString() },
        ...prev.transactions,
      ],
    }));
  }, []);

  const totalCoins = state.jars.save + state.jars.spend + state.jars.share;
  const badges = ALL_BADGES.map(b => ({ ...b, unlocked: state.badges.includes(b.id) }));

  const saverStreak = (() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (state.savingDays.includes(d.toDateString())) streak++;
      else break;
    }
    return streak;
  })();

  if (saverStreak >= 7 && !state.badges.includes('saver_star')) {
    unlockBadge('saver_star');
  }

  return {
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
    changePin,
    totalCoins,
    badges,
    saverStreak,
  };
}