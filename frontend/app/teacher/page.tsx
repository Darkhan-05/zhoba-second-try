'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Users, Sparkles, PlusCircle, RefreshCw, BarChart3,
  AlertCircle, Lightbulb, MessageSquare, CheckCircle2, Trash2, X, ChevronRight, LayoutDashboard
} from 'lucide-react';
import { API_URL } from '../page';

interface Summary {
  factual_overview: string;
  emotional_climate: string;
  critical_concerns: string;
  innovative_ideas: string;
  final_consensus: string;
}

export default function TeacherDashboard() {
  const { t } = useLanguage();
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scenarios, setScenarios] = useState<string[]>(['']);
  const [roomCode, setRoomCode] = useState('');
  const [activeSession, setActiveSession] = useState<any>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState('');

  const fetchAllSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/sessions`);
      const data = await res.json();
      setAllSessions(data);
    } catch (err) {
      console.error("Error loading sessions", err);
    }
  };

  useEffect(() => { fetchAllSessions(); }, []);

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
      const res = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeScenarios[0] || t.teacher.defaultTopic,
          roomCode: roomCode.toUpperCase(),
          questions: activeScenarios
        }),
      });

      if (!res.ok) throw new Error(t.teacher.failedToCreate);
      const data = await res.json();
      setIsModalOpen(false);
      setActiveSession(data);
      fetchAllSessions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectSession = async (sessionData: any) => {
    setSummary(null);
    setActiveSession(sessionData);
    try {
      const res = await fetch(`${API_URL}/sessions/${sessionData.roomCode}`);
      const data = await res.json();
      setActiveSession(data);
    } catch (e) { console.error(e) }
  };

  const generateAIInsight = async () => {
    if (!activeSession) return;
    setSummarizing(true);
    try {
      const res = await fetch(`${API_URL}/sessions/${activeSession.roomCode}/analytics`);
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSummarizing(false);
    }
  };

  // ======= DASHBOARD VIEW =======
  if (!activeSession) {
    return (
      <div className="teacher-page min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 animate-fade-in-up">
            <div>
              <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <LayoutDashboard className="text-white w-5 h-5" />
                </div>
                {t.teacher.dashboard}
              </h1>
              <p className="text-gray-400 mt-2 text-lg">{t.teacher.dashboardSubtitle}</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-7 py-3.5 rounded-2xl font-bold hover:-translate-y-0.5 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300"
            >
              <PlusCircle size={20} />
              {t.teacher.createSession}
            </button>
          </div>

          {/* Sessions Grid */}
          <div className="grid grid-cols-1 gap-4">
            {allSessions.length === 0 ? (
              <div className="text-center py-20 bg-white/60 rounded-3xl border-2 border-dashed border-gray-200 animate-fade-in-up">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-gray-400 text-lg">{t.teacher.noSessions}</p>
              </div>
            ) : (
              allSessions.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => selectSession(s)}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100/80 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between group shadow-sm hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-center gap-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700 font-mono font-black px-5 py-3 rounded-xl text-xl border border-indigo-100">
                      {s.roomCode}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{s.topic}</h3>
                      <p className="text-sm text-gray-400 flex items-center gap-2 mt-0.5">
                        {new Date(s.createdAt).toLocaleDateString()} • {s._count?.questions || 0} {t.teacher.situations}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.teacher.answers}</p>
                      <p className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{s._count?.answers || 0}</p>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create Modal */}
        {isModalOpen && (
          <div className="fixed text-black inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
              <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-slate-50 to-indigo-50/50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <PlusCircle className="text-white" size={16} />
                  </div>
                  {t.teacher.newSession}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={createSession} className="p-8 space-y-6 overflow-y-auto max-h-[80vh]">
                <div className="space-y-4">
                  {scenarios.map((text, index) => (
                    <div key={index} className="relative group animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                      <textarea
                        required
                        rows={3}
                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-all text-gray-800 placeholder:text-gray-300 resize-none"
                        placeholder={t.teacher.scenarioPlaceholder.replace('{index}', String(index + 1))}
                        value={text}
                        onChange={(e) => {
                          const newScenarios = [...scenarios];
                          newScenarios[index] = e.target.value;
                          setScenarios(newScenarios);
                        }}
                      />
                      {scenarios.length > 1 && (
                        <button type="button" onClick={() => setScenarios(scenarios.filter((_, i) => i !== index))} className="absolute top-2 right-2 text-red-300 hover:text-red-500 p-2 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setScenarios([...scenarios, ''])} className="text-indigo-600 font-bold flex items-center gap-1 text-sm hover:text-indigo-700 transition-colors">
                    <PlusCircle size={16} /> {t.teacher.addCase}
                  </button>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl flex items-center justify-between border border-indigo-100">
                  <div>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{t.teacher.roomCodeAuto}</p>
                    <p className="text-3xl font-mono font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-[0.2em]">{roomCode}</p>
                  </div>
                  <button type="button" onClick={generateRoomCode} className="p-3 hover:bg-indigo-100 rounded-xl text-indigo-600 transition-all hover:rotate-180 duration-500">
                    <RefreshCw size={20} />
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm animate-fade-in">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:-translate-y-0.5 transition-all shadow-xl shadow-indigo-200 hover:shadow-2xl disabled:opacity-50"
                >
                  {loading ? t.teacher.creating : t.teacher.startSession}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ======= ACTIVE SESSION VIEW =======
  return (
    <div className="teacher-page min-h-screen text-black bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => { setActiveSession(null); setSummary(null); }}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold transition-colors animate-fade-in"
        >
          <X size={20} /> {t.teacher.backToMenu}
        </button>

        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 animate-fade-in-up">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-black text-gray-900 leading-tight">{activeSession.topic}</h1>
            <p className="mt-2 text-sm text-gray-400">
              {t.teacher.roomCodeLabel}{' '}
              <span className="font-mono font-black text-base bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                {activeSession.roomCode}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-gray-100/80 flex items-center space-x-3">
              <Users className="text-indigo-600" />
              <p className="text-xl font-black text-gray-800">{activeSession.answers?.length || 0} {t.teacher.answersCount}</p>
            </div>
            <button
              onClick={() => selectSession(activeSession)}
              className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:bg-gray-50 transition-all border border-gray-100/80 hover:rotate-180 duration-500"
              title={t.teacher.refreshData}
            >
              <RefreshCw size={20} className="text-gray-400" />
            </button>
          </div>
        </header>

        {/* AI ANALYTICS SECTION */}
        <section className="mb-12 animate-fade-in-up animate-delay-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-sm">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t.teacher.aiAnalysis}</h2>
          </div>

          {!summary ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
              <button
                onClick={generateAIInsight}
                disabled={summarizing || (activeSession.answers?.length || 0) === 0}
                className="flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200 transition-all disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {summarizing ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                <span className="text-lg">{summarizing ? t.teacher.generating : t.teacher.generateReport}</span>
              </button>
              <p className="text-sm text-gray-400 mt-5">{t.teacher.aiHint}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SummaryCard title={t.teacher.factualOverview} content={summary.factual_overview} icon={<BarChart3 className="text-blue-500 w-5 h-5" />} gradient="from-blue-500 to-cyan-500" />
                <SummaryCard title={t.teacher.emotionalClimate} content={summary.emotional_climate} icon={<MessageSquare className="text-rose-500 w-5 h-5" />} gradient="from-rose-500 to-pink-500" />
                <SummaryCard title={t.teacher.criticalConcerns} content={summary.critical_concerns} icon={<AlertCircle className="text-gray-800 w-5 h-5" />} gradient="from-gray-700 to-gray-900" />
                <SummaryCard title={t.teacher.innovativeIdeas} content={summary.innovative_ideas} icon={<Lightbulb className="text-emerald-500 w-5 h-5" />} gradient="from-emerald-500 to-green-500" />
              </div>
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 text-white p-8 rounded-3xl shadow-xl shadow-indigo-200/30">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-200">
                  <CheckCircle2 /> {t.teacher.finalConsensus}
                </h3>
                <p className="text-indigo-50 text-lg leading-relaxed">{summary.final_consensus}</p>
              </div>
            </div>
          )}
        </section>

        {/* ANSWERS FEED SECTION */}
        <section className="animate-fade-in-up animate-delay-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                <MessageSquare className="text-white w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t.teacher.answersFeed}</h2>
            </div>
            <span className="text-sm text-gray-400 font-medium">{t.teacher.totalMessages} {activeSession.answers?.length || 0}</span>
          </div>

          {activeSession.answers?.length === 0 ? (
            <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-gray-400">{t.teacher.noAnswersYet.replace('{code}', activeSession.roomCode)}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSession?.answers?.map((ans: any, index: number) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-gray-100/80 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-black uppercase px-3 py-1 rounded-lg ${getHatStyles(ans.hatColor)}`}>
                        {ans.hatColor} Hat
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(ans.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed italic">&quot;{ans.content}&quot;</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-[11px] font-bold text-indigo-600">
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
    case 'White': return 'bg-gray-100 text-gray-800 border border-gray-200';
    case 'Red': return 'bg-red-50 text-red-600 border border-red-100';
    case 'Black': return 'bg-gray-900 text-white';
    case 'Yellow': return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
    case 'Green': return 'bg-green-50 text-green-700 border border-green-100';
    case 'Blue': return 'bg-blue-50 text-blue-700 border border-blue-100';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function SummaryCard({ title, content, icon, gradient }: { title: string, content: string, icon: React.ReactNode, gradient: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/80 hover:shadow-lg hover:-translate-y-1 transition-all group">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
          <div className="text-white">{icon}</div>
        </div>
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>
      <div className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">{content}</div>
    </div>
  );
}