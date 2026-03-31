import { useState } from 'react';

interface KidsGamesProps {
  quizCompleted: boolean;
  scenarioCompleted: boolean;
  onQuizComplete: () => void;
  onScenarioComplete: () => void;
}

const QUIZ_ITEMS = [
  { emoji: '🍎', label: 'Яблоко', answer: 'need', explanation: 'Еда — это то, что нужно каждому для здоровья!' },
  { emoji: '🧸', label: 'Игрушка', answer: 'want', explanation: 'Игрушки радуют нас, но без них можно жить.' },
  { emoji: '💧', label: 'Вода', answer: 'need', explanation: 'Вода жизненно необходима каждый день!' },
  { emoji: '🎮', label: 'Приставка', answer: 'want', explanation: 'Классная вещь, но это желание, а не необходимость.' },
  { emoji: '🧥', label: 'Пальто', answer: 'need', explanation: 'Одежда нужна, чтобы не мёрзнуть — это необходимость!' },
  { emoji: '🍬', label: 'Конфеты', answer: 'want', explanation: 'Вкусно, но это желание. Слишком много сладкого — вредно!' },
  { emoji: '📚', label: 'Учебники', answer: 'need', explanation: 'Без книг не получишь знания — это нужно!' },
  { emoji: '📱', label: 'Смартфон', answer: 'want', explanation: 'Удобно, но это желание. Можно общаться и без него.' },
  { emoji: '🍞', label: 'Хлеб', answer: 'need', explanation: 'Еда — базовая необходимость для всех.' },
  { emoji: '🎀', label: 'Наклейки', answer: 'want', explanation: 'Симпатичные, но это точно желание!' },
];

const SCENARIOS = [
  {
    id: 's1',
    text: 'У тебя 200 монеток. Ты видишь крутую игрушку за 150 монеток. Но на следующей неделе день рождения друга!',
    emoji: '🎁',
    options: [
      { label: 'Купить игрушку себе', emoji: '🛒', outcome: 'Ты порадовался сразу, но другу не было подарка. Было немного стыдно...', type: 'neutral' },
      { label: 'Подождать и сэкономить', emoji: '🐷', outcome: 'Умный выбор! Ты накопил на оба желания и друг был счастлив!', type: 'good' },
      { label: 'Купить подарок другу', emoji: '💝', outcome: 'Щедро! Друг был в восторге. Делиться — это здорово!', type: 'good' },
    ],
  },
  {
    id: 's2',
    text: 'Тебе дали 300 монеток за уборку. Ты хочешь мороженое за 50 монеток. Что сделаешь с остальными?',
    emoji: '🍦',
    options: [
      { label: 'Потратить всё на сладости', emoji: '🍬', outcome: 'Вкусно, но деньги закончились быстро. В следующий раз попробуй отложить!', type: 'neutral' },
      { label: 'Мороженое + остаток в копилку', emoji: '🐷', outcome: 'Отличный баланс! Порадовал себя и накопил на будущее!', type: 'good' },
      { label: 'Всё в копилку', emoji: '💪', outcome: 'Очень дисциплинированно! Твоя копилка говорит спасибо!', type: 'good' },
    ],
  },
  {
    id: 's3',
    text: 'В магазине классные наклейки за 100 монеток. Ты копишь на велосипед (нужно ещё 800 монеток). Что выберешь?',
    emoji: '🚲',
    options: [
      { label: 'Купить наклейки', emoji: '🎀', outcome: 'Приятно, но до велосипеда теперь чуть дальше. Бывает!', type: 'neutral' },
      { label: 'Пропустить и копить дальше', emoji: '🎯', outcome: 'Молодец! Ты помнишь о большой цели — это сила воли!', type: 'good' },
      { label: 'Спросить совета у родителей', emoji: '👪', outcome: 'Мудро! Родители помогут принять лучшее решение.', type: 'good' },
    ],
  },
];

export default function KidsGames({ quizCompleted, scenarioCompleted, onQuizComplete, onScenarioComplete }: KidsGamesProps) {
  const [activeGame, setActiveGame] = useState<'menu' | 'quiz' | 'scenarios'>('menu');

  // Quiz state
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizDone, setQuizDone] = useState(false);

  // Scenario state
  const [scenIdx, setScenIdx] = useState(0);
  const [scenAnswer, setScenAnswer] = useState<number | null>(null);
  const [scenDone, setScenDone] = useState(false);

  function handleQuizAnswer(answer: 'need' | 'want') {
    const correct = QUIZ_ITEMS[quizIdx].answer === answer;
    setQuizAnswer(answer);
    if (correct) setQuizScore(s => s + 1);
  }

  function nextQuiz() {
    if (quizIdx + 1 >= QUIZ_ITEMS.length) {
      setQuizDone(true);
      onQuizComplete();
    } else {
      setQuizIdx(i => i + 1);
      setQuizAnswer(null);
    }
  }

  function nextScenario() {
    if (scenIdx + 1 >= SCENARIOS.length) {
      setScenDone(true);
      onScenarioComplete();
    } else {
      setScenIdx(i => i + 1);
      setScenAnswer(null);
    }
  }

  function resetQuiz() {
    setQuizIdx(0); setQuizScore(0); setQuizAnswer(null); setQuizDone(false);
  }
  function resetScen() {
    setScenIdx(0); setScenAnswer(null); setScenDone(false);
  }

  if (activeGame === 'quiz') {
    const item = QUIZ_ITEMS[quizIdx];
    const isCorrect = quizAnswer === item.answer;

    return (
      <div className="pb-28 px-4 pt-4 min-h-screen" style={{ background: 'linear-gradient(135deg, #fff8ee, #e8fffe)' }}>
        <button onClick={() => { setActiveGame('menu'); resetQuiz(); }}
          className="flex items-center gap-2 text-gray-500 font-bold mb-4">
          ← Назад
        </button>

        {quizDone ? (
          <div className="text-center py-8">
            <div className="text-7xl mb-4">{quizScore >= 8 ? '🏆' : quizScore >= 6 ? '⭐' : '💪'}</div>
            <h2 className="text-3xl font-black text-gray-800 mb-2">Викторина пройдена!</h2>
            <p className="text-xl text-gray-600 mb-6">Правильных ответов: <span className="font-black text-orange-500">{quizScore}</span> из {QUIZ_ITEMS.length}</p>
            <div className="bg-white rounded-3xl p-5 mb-6 text-left"
              style={{ border: '3px solid #4ECDC4' }}>
              <p className="font-black text-gray-700 mb-1">🐿️ Спарки говорит:</p>
              <p className="text-gray-600">
                {quizScore === 10 ? 'Идеально! Ты настоящий знаток финансов! 🎉' :
                 quizScore >= 7 ? 'Отличный результат! Ты многое знаешь о деньгах!' :
                 'Молодец, что играл! Теперь ты знаешь больше о нужном и желаемом!'}
              </p>
            </div>
            <button onClick={resetQuiz}
              className="px-8 py-4 rounded-3xl text-white text-lg font-black"
              style={{ background: 'linear-gradient(135deg, #4ECDC4, #2ab5ac)' }}>
              🔄 Сыграть снова
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-1 flex-1">
                {QUIZ_ITEMS.map((_, i) => (
                  <div key={i} className="flex-1 h-2 rounded-full"
                    style={{ background: i < quizIdx ? '#4ECDC4' : i === quizIdx ? '#FF9F4A' : '#e5e7eb' }} />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-500">{quizIdx + 1}/{QUIZ_ITEMS.length}</span>
            </div>

            <div className="text-center mb-6">
              <div className="text-9xl mb-4" style={{ lineHeight: 1 }}>{item.emoji}</div>
              <h3 className="text-3xl font-black text-gray-800">{item.label}</h3>
              <p className="text-gray-500 mt-1">Это нужное или желаемое?</p>
            </div>

            {!quizAnswer ? (
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleQuizAnswer('need')}
                  className="py-6 rounded-3xl text-white text-2xl font-black transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #4ECDC4, #2ab5ac)', boxShadow: '0 6px 20px rgba(78,205,196,0.4)' }}>
                  ✅ Нужное
                </button>
                <button onClick={() => handleQuizAnswer('want')}
                  className="py-6 rounded-3xl text-white text-2xl font-black transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #FF9F4A, #ff7a1a)', boxShadow: '0 6px 20px rgba(255,159,74,0.4)' }}>
                  ⭐ Желаемое
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-3xl p-5 text-center"
                  style={{ background: isCorrect ? '#e8fffe' : '#fff0f0', border: `3px solid ${isCorrect ? '#4ECDC4' : '#ff8888'}` }}>
                  <p className="text-4xl mb-2">{isCorrect ? '🎉' : '💭'}</p>
                  <p className="text-xl font-black mb-2" style={{ color: isCorrect ? '#4ECDC4' : '#ff6666' }}>
                    {isCorrect ? 'Правильно!' : 'Не совсем!'}
                  </p>
                  <p className="text-gray-600 text-sm">🐿️ {item.explanation}</p>
                </div>
                <button onClick={nextQuiz}
                  className="w-full py-4 rounded-3xl text-white text-lg font-black transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #FF9F4A, #ff7a1a)' }}>
                  {quizIdx + 1 >= QUIZ_ITEMS.length ? '🏆 Посмотреть результат' : 'Дальше →'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (activeGame === 'scenarios') {
    const scen = SCENARIOS[scenIdx];
    const chosenOption = scenAnswer !== null ? scen.options[scenAnswer] : null;

    return (
      <div className="pb-28 px-4 pt-4 min-h-screen" style={{ background: 'linear-gradient(135deg, #f0fff4, #e8f4ff)' }}>
        <button onClick={() => { setActiveGame('menu'); resetScen(); }}
          className="flex items-center gap-2 text-gray-500 font-bold mb-4">
          ← Назад
        </button>

        {scenDone ? (
          <div className="text-center py-8">
            <div className="text-7xl mb-4">🦉</div>
            <h2 className="text-3xl font-black text-gray-800 mb-2">Мудрец!</h2>
            <p className="text-gray-600 mb-6">Ты прошёл все сценарии и научился думать о деньгах!</p>
            <div className="bg-white rounded-3xl p-5 mb-6"
              style={{ border: '3px solid #4ECDC4' }}>
              <p className="font-black text-gray-700 mb-1">🐿️ Спарки говорит:</p>
              <p className="text-gray-600">Умение думать перед тратой — самый важный навык с деньгами! Ты молодец!</p>
            </div>
            <button onClick={resetScen}
              className="px-8 py-4 rounded-3xl text-white text-lg font-black"
              style={{ background: 'linear-gradient(135deg, #4ECDC4, #2ab5ac)' }}>
              🔄 Сыграть снова
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              {SCENARIOS.map((_, i) => (
                <div key={i} className="flex-1 h-3 rounded-full"
                  style={{ background: i < scenIdx ? '#4ECDC4' : i === scenIdx ? '#FF9F4A' : '#e5e7eb' }} />
              ))}
              <span className="text-sm font-bold text-gray-500">{scenIdx + 1}/{SCENARIOS.length}</span>
            </div>

            <div className="bg-white rounded-3xl p-5 mb-5 text-center"
              style={{ border: '3px solid #FFE66D', boxShadow: '0 4px 16px rgba(255,230,109,0.3)' }}>
              <div className="text-6xl mb-3">{scen.emoji}</div>
              <p className="text-base font-bold text-gray-700 leading-relaxed">{scen.text}</p>
            </div>

            {!chosenOption ? (
              <div className="space-y-3">
                <p className="text-center text-gray-500 font-bold mb-2">Что ты сделаешь?</p>
                {scen.options.map((opt, i) => (
                  <button key={i} onClick={() => setScenAnswer(i)}
                    className="w-full py-4 px-5 rounded-3xl text-left font-bold text-gray-800 flex items-center gap-3 transition-all hover:scale-102 active:scale-98 bg-white"
                    style={{ border: '3px solid #e5e7eb', fontSize: '16px' }}>
                    <span className="text-3xl">{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-3xl p-5"
                  style={{
                    background: chosenOption.type === 'good' ? '#e8fffe' : '#fff8ee',
                    border: `3px solid ${chosenOption.type === 'good' ? '#4ECDC4' : '#FF9F4A'}`,
                  }}>
                  <p className="text-3xl mb-2 text-center">{chosenOption.type === 'good' ? '🌟' : '💡'}</p>
                  <p className="font-black text-gray-800 text-center mb-2">
                    {chosenOption.type === 'good' ? 'Отличный выбор!' : 'Интересный выбор!'}
                  </p>
                  <p className="text-sm text-gray-600 text-center">🐿️ {chosenOption.outcome}</p>
                </div>
                <button onClick={nextScenario}
                  className="w-full py-4 rounded-3xl text-white text-lg font-black transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #FF9F4A, #ff7a1a)' }}>
                  {scenIdx + 1 >= SCENARIOS.length ? '🏆 Завершить!' : 'Следующая история →'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="pb-28 px-4 pt-4">
      <h2 className="text-2xl font-black text-gray-800 mb-5">Игры 🎮</h2>
      <div className="space-y-4">
        <button onClick={() => { setActiveGame('quiz'); resetQuiz(); }}
          className="w-full rounded-3xl p-6 text-left transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #4ECDC4, #2ab5ac)', boxShadow: '0 6px 24px rgba(78,205,196,0.4)' }}>
          <div className="flex items-center gap-4">
            <span className="text-5xl">🧠</span>
            <div>
              <p className="text-white text-xl font-black">Нужное или желаемое?</p>
              <p className="text-white/80 text-sm mt-0.5">10 предметов — угадай каждый!</p>
              {quizCompleted && <span className="text-yellow-300 text-sm font-bold">✅ Уже проходил!</span>}
            </div>
          </div>
        </button>

        <button onClick={() => { setActiveGame('scenarios'); resetScen(); }}
          className="w-full rounded-3xl p-6 text-left transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #FF9F4A, #ff7a1a)', boxShadow: '0 6px 24px rgba(255,159,74,0.4)' }}>
          <div className="flex items-center gap-4">
            <span className="text-5xl">🦉</span>
            <div>
              <p className="text-white text-xl font-black">Копить или тратить?</p>
              <p className="text-white/80 text-sm mt-0.5">3 истории — ты принимаешь решение!</p>
              {scenarioCompleted && <span className="text-yellow-300 text-sm font-bold">✅ Уже проходил!</span>}
            </div>
          </div>
        </button>

        <div className="bg-yellow-50 rounded-3xl p-5" style={{ border: '3px solid #FFE66D' }}>
          <div className="flex items-start gap-3">
            <span className="text-3xl">🐿️</span>
            <div>
              <p className="font-black text-gray-700 mb-1">Совет Спарки</p>
              <p className="text-sm text-gray-600">Играй и учись! Знания о деньгах помогут тебе исполнять мечты быстрее 🚀</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
