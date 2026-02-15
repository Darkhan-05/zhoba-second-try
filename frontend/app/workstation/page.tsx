'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import { Send, CheckCircle } from 'lucide-react';

// Выносим конфиг шляп за пределы компонента, чтобы он всегда был доступен
const hatDetails = {
  White: { color: 'bg-slate-100', text: 'text-slate-800', button: 'bg-slate-800', description: 'Факты и цифры.', icon: '⚪' },
  Red: { color: 'bg-red-500', text: 'text-white', button: 'bg-red-700', description: 'Эмоции и интуиция.', icon: '🔴' },
  Black: { color: 'bg-zinc-900', text: 'text-white', button: 'bg-zinc-700', description: 'Риски и критицизм.', icon: '⚫' },
  Yellow: { color: 'bg-yellow-400', text: 'text-gray-900', button: 'bg-yellow-600', description: 'Польза и оптимизм.', icon: '🟡' },
  Green: { color: 'bg-green-500', text: 'text-white', button: 'bg-green-700', description: 'Креатив и идеи.', icon: '🟢' },
  Blue: { color: 'bg-blue-600', text: 'text-white', button: 'bg-blue-800', description: 'Организация и выводы.', icon: '🔵' },
};

export default function Workstation() {
  const { studentName, roomCode, hatColor, clearSession } = useSession();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const router = useRouter();

  // 1. Защита роута и загрузка вопросов
  useEffect(() => {
    if (!studentName || !roomCode || !hatColor) {
      router.push('/');
      return;
    }

    const fetchSession = async () => {
      try {
        const res = await fetch(`http://localhost:4001/sessions/${roomCode}`);
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err) {
        console.error("Ошибка загрузки сессии:", err);
      }
    };
    fetchSession();
  }, [studentName, roomCode, hatColor, router]);

  // Проверка: если данных еще нет, показываем лоадер
  if (!hatColor || questions.length === 0) return (
    <div className="min-h-screen flex items-center justify-center">Загрузка вопросов...</div>
  );

  // Теперь 'details' определен правильно внутри рендера
  const details = hatDetails[hatColor as keyof typeof hatDetails];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:4001/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          hatColor,
          content: answer,
          questionId: questions[currentStep].id,
          roomCode: roomCode // Добавляем код комнаты для бэкенда
        }),
      });

      if (res.ok) {
        if (currentStep < questions.length - 1) {
          setCurrentStep(currentStep + 1);
          setAnswer('');
        } else {
          setIsFinished(true);
        }
      }
    } catch (err) {
      console.error("Ошибка отправки:", err);
    } finally {
      setLoading(false);
    }
  };

  // Компонент завершения (внутри этого же файла для простоты)
  if (isFinished) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${details.color}`}>
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center max-w-sm">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">Отлично, {studentName}!</h2>
          <p className="text-gray-600 mb-6">Ты ответил на все вопросы. Твой вклад поможет ИИ составить точный отчет.</p>
          <button
            onClick={() => { clearSession(); router.push('/'); }}
            className="text-indigo-600 font-bold hover:underline"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className={`min-h-screen ${details.color} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-3xl mx-auto">

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2 text-white font-bold text-sm">
            <span>Вопрос {currentStep + 1} из {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="bg-white h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{details.icon}</span>
              <span className={`px-4 py-1 rounded-full font-black text-sm uppercase tracking-widest ${details.color} ${details.text}`}>
                {hatColor} Hat
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 leading-tight">
              {currentQuestion?.content}
            </h1>

            <div className="bg-gray-50 p-6 rounded-2xl mb-8 border-l-4 border-indigo-500">
              <p className="text-gray-700 italic">{details.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <textarea
                required
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={5}
                className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 transition-all text-lg"
                placeholder="Напишите ваш ответ здесь..."
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-2xl text-white font-bold text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3 ${details.button}`}
              >
                {loading ? 'Отправка...' : (
                  <>
                    <span>{currentStep === questions.length - 1 ? 'Завершить разбор' : 'Следующий вопрос'}</span>
                    <Send size={20} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}