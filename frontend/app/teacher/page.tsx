'use client';

import { useState, useEffect } from 'react';
import {
  Users, Sparkles, PlusCircle, RefreshCw, BarChart3,
  AlertCircle, Lightbulb, MessageSquare, CheckCircle2, Trash2, X, ChevronRight, LayoutDashboard
} from 'lucide-react';

interface Summary {
  factual_overview: string;
  emotional_climate: string;
  critical_concerns: string;
  innovative_ideas: string;
  final_consensus: string;
}

export default function TeacherDashboard() {
  // Список всех сессий
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Состояния для создания новой сессии
  const [scenarios, setScenarios] = useState<string[]>(['']);
  const [roomCode, setRoomCode] = useState('');

  // Активная сессия и аналитика
  const [activeSession, setActiveSession] = useState<any>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState('');

  // Загрузка всех сессий при старте
  const fetchAllSessions = async () => {
    try {
      const res = await fetch('http://localhost:4001/sessions');
      const data = await res.json();
      setAllSessions(data);
    } catch (err) {
      console.error("Ошибка загрузки списка сессий", err);
    }
  };

  useEffect(() => {
    fetchAllSessions();
  }, []);

  // Генерация легкого кода комнаты
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomCode(result);
  };

  const openCreateModal = () => {
    setScenarios(['']);
    generateRoomCode();
    setIsModalOpen(true);
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const activeScenarios = scenarios.filter(s => s.trim() !== '');

    try {
      const res = await fetch('http://localhost:4001/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeScenarios[0] || "Обсуждение",
          roomCode: roomCode.toUpperCase(),
          questions: activeScenarios
        }),
      });

      if (!res.ok) throw new Error('Не удалось создать сессию');
      const data = await res.json();
      setIsModalOpen(false);
      setActiveSession(data);
      fetchAllSessions(); // Обновляем список в фоне
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const conseor = () => {
    console.log('activeSession', activeSession)
    console.log('activeSession.answers', activeSession.answers)
  }
  const selectSession = async (sessionData: any) => {
    setSummary(null); // Сбрасываем старую аналитику
    setActiveSession(sessionData);
    // Обновляем данные сессии (количество ответов и т.д.)
    try {
      const res = await fetch(`http://localhost:4001/sessions/${sessionData.roomCode}`);
      const data = await res.json();
      setActiveSession(data);
    } catch (e) { console.error(e) }
  };

  const generateAIInsight = async () => {
    if (!activeSession) return;
    setSummarizing(true);
    try {
      const res = await fetch(`http://localhost:4001/sessions/${activeSession.roomCode}/analytics`);
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSummarizing(false);
    }
  };

  // Вид: Список сессий (Dashboard)
  if (!activeSession) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <LayoutDashboard className="text-indigo-600" />
                Панель управления
              </h1>
              <p className="text-gray-500 mt-1 text-lg">Управляйте вашими учебными сессиями</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <PlusCircle size={20} />
              Создать сессию
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {allSessions.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-lg">У вас пока нет активных сессий</p>
              </div>
            ) : (
              allSessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => selectSession(s)}
                  className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-6">
                    <div className="bg-indigo-50 text-indigo-700 font-mono font-bold px-4 py-2 rounded-xl text-xl">
                      {s.roomCode}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{s.topic}</h3>
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        {new Date(s.createdAt).toLocaleDateString()} • {s._count?.questions || 0} ситуаций
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase">Ответы</p>
                      <p className="text-xl font-black text-indigo-600">{s._count?.answers || 0}</p>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal для создания */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <PlusCircle className="text-indigo-600" size={20} />
                  Новая сессия
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={createSession} className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
                <div className="space-y-4">
                  {scenarios.map((text, index) => (
                    <div key={index} className="relative group">
                      <textarea
                        required
                        rows={3}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        placeholder={`Ситуация №${index + 1}...`}
                        value={text}
                        onChange={(e) => {
                          const newScenarios = [...scenarios];
                          newScenarios[index] = e.target.value;
                          setScenarios(newScenarios);
                        }}
                      />
                      {scenarios.length > 1 && (
                        <button type="button" onClick={() => setScenarios(scenarios.filter((_, i) => i !== index))} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-2">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setScenarios([...scenarios, ''])} className="text-indigo-600 font-bold flex items-center gap-1 text-sm">
                    <PlusCircle size={16} /> Добавить еще один кейс
                  </button>
                </div>

                <div className="bg-indigo-50 p-4 rounded-2xl flex items-center justify-between border border-indigo-100">
                  <div>
                    <p className="text-xs font-bold text-indigo-400 uppercase">Код комнаты (авто)</p>
                    <p className="text-2xl font-mono font-black text-indigo-700 tracking-widest">{roomCode}</p>
                  </div>
                  <button type="button" onClick={generateRoomCode} className="p-2 hover:bg-indigo-100 rounded-xl text-indigo-600 transition-colors">
                    <RefreshCw size={20} />
                  </button>
                </div>

                <button
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100"
                >
                  {loading ? 'Создание...' : 'Запустить сессию'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => { setActiveSession(null); setSummary(null); }}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold transition-colors"
        >
          <X size={20} /> Вернуться в меню
        </button>

        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-black text-gray-900 leading-tight">{activeSession.topic}</h1>
            <p className="mt-2 text-sm">Код комнаты: <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{activeSession.roomCode}</span></p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3">
              <Users className="text-indigo-600" />
              <p className="text-xl font-black">{activeSession.answers?.length || 0} отв.</p>
            </div>
            <button
              onClick={() => selectSession(activeSession)}
              className="p-3 bg-white rounded-xl shadow-sm hover:bg-gray-100 transition-colors"
              title="Обновить данные"
            >
              <RefreshCw size={20} className="text-gray-400" />
            </button>
          </div>
        </header>

        {/* СЕКЦИЯ AI АНАЛИТИКИ */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="text-yellow-500" />
            <h2 className="text-xl font-bold">AI Анализ сессии</h2>
          </div>

          {!summary ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <button
                onClick={generateAIInsight}
                disabled={summarizing || (activeSession.answers?.length || 0) === 0}
                className="flex items-center space-x-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:scale-105 transition-transform disabled:opacity-50"
              >
                {summarizing ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                <span>{summarizing ? 'ИИ анализирует...' : 'Сгенерировать AI-отчет'}</span>
              </button>
              <p className="text-sm text-gray-400 mt-4">ИИ объединит все ответы в структурированный вывод</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SummaryCard title="Фактический обзор" content={summary.factual_overview} icon={<BarChart3 className="text-blue-500" />} color="border-blue-500" />
                <SummaryCard title="Эмоциональный фон" content={summary.emotional_climate} icon={<MessageSquare className="text-red-500" />} color="border-red-500" />
                <SummaryCard title="Критические вопросы" content={summary.critical_concerns} icon={<AlertCircle className="text-gray-800" />} color="border-gray-800" />
                <SummaryCard title="Инновационные идеи" content={summary.innovative_ideas} icon={<Lightbulb className="text-green-500" />} color="border-green-500" />
              </div>
              <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl border-b-8 border-indigo-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-200">
                  <CheckCircle2 /> Итоговый консенсус
                </h3>
                <p className="text-indigo-50 text-lg leading-relaxed">{summary.final_consensus}</p>
              </div>
            </div>
          )}
        </section>

        {/* СЕКЦИЯ ВСЕХ ОТВЕТОВ */}
        <section>
          <button onClick={conseor}>
            click
          </button>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-indigo-600" />
              <h2 className="text-xl font-bold">Лента всех ответов</h2>
            </div>
            <span className="text-sm text-gray-400">Всего сообщений: {activeSession.answers?.length || 0}</span>
          </div>

          {activeSession.answers?.length === 0 ? (
            <div className="text-center py-10 bg-gray-100 rounded-2xl border border-gray-200">
              <p className="text-gray-500">Ответов пока нет. Студенты должны зайти по коду {activeSession.roomCode}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSession?.answers?.map((ans: any, index: number) => (
                <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-black uppercase px-2 py-1 rounded-md ${getHatStyles(ans.hatColor)}`}>
                        {ans.hatColor} Hat
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(ans.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-800 leading-relaxed italic">"{ans.content}"</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600">
                      {ans.studentName[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-gray-500">{ans.studentName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
function getHatStyles(hat: string) {
  switch (hat) {
    case 'White': return 'bg-gray-100 text-gray-800 border border-gray-300';
    case 'Red': return 'bg-red-100 text-red-700 border border-red-200';
    case 'Black': return 'bg-gray-900 text-white';
    case 'Yellow': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    case 'Green': return 'bg-green-100 text-green-700 border border-green-200';
    case 'Blue': return 'bg-blue-100 text-blue-700 border border-blue-200';
    default: return 'bg-gray-100 text-gray-800';
  }
}
// Вспомогательный компонент для карточек
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