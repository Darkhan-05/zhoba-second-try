'use client';

import { useState, useEffect } from 'react';
import { Users, Sparkles, PlusCircle, RefreshCw, BarChart3, AlertCircle, Lightbulb, MessageSquare, CheckCircle2 } from 'lucide-react';

interface Summary {
  factual_overview: string;
  emotional_climate: string;
  critical_concerns: string;
  innovative_ideas: string;
  final_consensus: string;
}

export default function TeacherDashboard() {
  const [topic, setTopic] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [session, setSession] = useState<any>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState('');

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:3001/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, roomCode }),
      });
      if (!res.ok) throw new Error('Failed to create session');
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
      const res = await fetch(`http://localhost:3001/sessions/${session.roomCode}`);
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
      const res = await fetch(`http://localhost:3001/sessions/${session.roomCode}/analytics`);
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
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-2 mb-6 text-indigo-600">
            <PlusCircle size={24} />
            <h1 className="text-2xl font-bold">Create New Session</h1>
          </div>
          <form onSubmit={createSession} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Discussion Topic</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Implementing 4-day work week"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Room Code</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., CLASS101"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Launch Session'}
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
          <div>
            <h1 className="text-3xl font-black text-gray-900">{session.topic}</h1>
            <p className="text-gray-500">Room Code: <span className="font-mono font-bold text-indigo-600">{session.roomCode}</span></p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3">
              <Users className="text-indigo-600" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Submissions</p>
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
            <h2 className="text-xl font-bold text-gray-800 mb-2">Ready to analyze?</h2>
            <p className="text-gray-500 mb-8 text-center max-w-sm">
              Once students have submitted their responses, click the button below to generate an AI-powered summary of the discussion.
            </p>
            <button
              onClick={generateAIInsight}
              disabled={summarizing || (session._count?.answers || 0) === 0}
              className="flex items-center space-x-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 transform transition hover:-translate-y-1"
            >
              {summarizing ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  <span>Analyzing {session._count?.answers} responses...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Generate AI Insight</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="text-yellow-500" />
                AI Summary Report
              </h2>
              <button
                onClick={generateAIInsight}
                className="text-sm text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                <RefreshCw size={14} />
                Regenerate
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SummaryCard
                title="Factual Overview"
                content={summary.factual_overview}
                icon={<BarChart3 className="text-blue-500" />}
                color="border-blue-500"
              />
              <SummaryCard
                title="Emotional Climate"
                content={summary.emotional_climate}
                icon={<MessageSquare className="text-red-500" />}
                color="border-red-500"
              />
              <SummaryCard
                title="Critical Concerns"
                content={summary.critical_concerns}
                icon={<AlertCircle className="text-gray-800" />}
                color="border-gray-800"
              />
              <SummaryCard
                title="Innovative Ideas"
                content={summary.innovative_ideas}
                icon={<Lightbulb className="text-green-500" />}
                color="border-green-500"
              />
            </div>

            <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="text-indigo-300" />
                <h3 className="text-xl font-bold">Final Consensus</h3>
              </div>
              <p className="text-indigo-100 text-lg leading-relaxed">
                {summary.final_consensus}
              </p>
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
      <div className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">
        {content}
      </div>
    </div>
  );
}
