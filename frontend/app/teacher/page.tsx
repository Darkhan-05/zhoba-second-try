'use client';

import { useState, useEffect } from 'react';
import { 
  Users, Sparkles, PlusCircle, RefreshCw, BarChart3, 
  AlertCircle, Lightbulb, MessageSquare, CheckCircle2, Trash2 
} from 'lucide-react';

interface Summary {
  factual_overview: string;
  emotional_climate: string;
  critical_concerns: string;
  innovative_ideas: string;
  final_consensus: string;
}

export default function TeacherDashboard() {
  const [scenarios, setScenarios] = useState<string[]>(['']);
  const [roomCode, setRoomCode] = useState('');
  const [session, setSession] = useState<any>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState('');

  const addScenario = () => setScenarios([...scenarios, '']);
  const removeScenario = (index: number) => {
    if (scenarios.length > 1) {
      setScenarios(scenarios.filter((_, i) => i !== index));
    }
  };

  const updateScenario = (index: number, value: string) => {
    const newScenarios = [...scenarios];
    newScenarios[index] = value;
    setScenarios(newScenarios);
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fullTopic = scenarios.filter(s => s.trim() !== '').join('\n---\n');

    try {
      const res = await fetch('http://localhost:4001/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: fullTopic, 
          roomCode: roomCode.toUpperCase() 
        }),
      });
      if (!res.ok) throw new Error('Не удалось создать сессию');
      const data = await res.json();
      setSession(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    if (!session) return;
    try {
      const res = await fetch(`http://localhost:4001/sessions/${session.roomCode}`);
      const data = await res.json();
      setSession(data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateAIInsight = async () => {
    if (!session) return;
    setSummarizing(true);
    try {
      const res = await fetch(`http://localhost:4001/sessions/${session.roomCode}/analytics`);
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSummarizing(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (session) {
      interval = setInterval(refreshSession, 5000);
    }
    return () => clearInterval(interval);
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-2 mb-6 text-indigo-600">
            <PlusCircle size={24} />
            <h1 className="text-2xl font-bold">Создание учебных ситуаций</h1>
          </div>
          
          <form onSubmit={createSession} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Опишите одну или несколько ситуаций (кейсов)
              </label>
              {scenarios.map((text, index) => (
                <div key={index} className="relative group">
                  <textarea
                    required
                    rows={4}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white transition-all"
                    placeholder={`Ситуация №${index + 1}: Опишите контекст, проблему или задачу...`}
                    value={text}
                    onChange={(e) => updateScenario(index, e.target.value)}
                  />
                  {scenarios.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeScenario(index)}
                      className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addScenario}
                className="flex items-center cursor-pointer gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors py-2"
              >
                <PlusCircle size={20} />
                Добавить еще одну ситуацию
              </button>
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className="block text-sm font-medium text-gray-700">Код комнаты</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white font-mono font-bold uppercase"
                placeholder="Например: CASE-STUDY-1"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
            >
              {loading ? 'Запуск...' : 'Открыть доступ студентам'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-black text-gray-900 leading-tight">
              {session.topic.split('\n---\n').length > 1 ? 'Разбор нескольких ситуаций' : 'Анализ ситуации'}
            </h1>
            <p className="text-gray-500 mt-1 italic line-clamp-2">{session.topic}</p>
            <p className="mt-2">Код: <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{session.roomCode}</span></p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3">
              <Users className="text-indigo-600" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Ответы</p>
                <p className="text-xl font-black">{session._count?.answers || 0}</p>
              </div>
            </div>
            <button
              onClick={refreshSession}
              className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={20} className="text-gray-600" />
            </button>
          </div>
        </header>

        {!summary ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300">
            <Sparkles size={48} className="text-indigo-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Собрать аналитику?</h2>
            <p className="text-gray-500 mb-8 text-center max-w-sm">
              ИИ проанализирует все ответы студентов по заданным ситуациям и подготовит отчет.
            </p>
            <button
              onClick={generateAIInsight}
              disabled={summarizing || (session._count?.answers || 0) === 0}
              className="flex items-center space-x-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 transform transition hover:-translate-y-1"
            >
              {summarizing ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  <span>ИИ думает над {session._count?.answers} отв...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Сгенерировать AI-отчет</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="text-yellow-500" />
                Результаты AI-анализа
              </h2>
              <button onClick={generateAIInsight} className="text-sm text-indigo-600 font-bold hover:underline flex items-center gap-1">
                <RefreshCw size={14} /> Пересобрать
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SummaryCard title="Фактический обзор" content={summary.factual_overview} icon={<BarChart3 className="text-blue-500" />} color="border-blue-500" />
              <SummaryCard title="Эмоциональный фон" content={summary.emotional_climate} icon={<MessageSquare className="text-red-500" />} color="border-red-500" />
              <SummaryCard title="Критические вопросы" content={summary.critical_concerns} icon={<AlertCircle className="text-gray-800" />} color="border-gray-800" />
              <SummaryCard title="Инновационные идеи" content={summary.innovative_ideas} icon={<Lightbulb className="text-green-500" />} color="border-green-500" />
            </div>

            <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="text-indigo-300" />
                <h3 className="text-xl font-bold">Итоговый консенсус</h3>
              </div>
              <p className="text-indigo-100 text-lg leading-relaxed">{summary.final_consensus}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, content, icon, color }: { title: string, content: string, icon: React.ReactNode, color: string }) {
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border-t-4 ${color}`}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>
      <div className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">{content}</div>
    </div>
  );
}