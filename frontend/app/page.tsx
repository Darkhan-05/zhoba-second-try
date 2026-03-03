'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import { useLanguage } from '@/context/LanguageContext';
import { LogIn, User, Hash } from 'lucide-react';

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setSession } = useSession();
  const { t } = useLanguage();

  const hats = ['White', 'Red', 'Black', 'Yellow', 'Green', 'Blue'] as const;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/sessions/${roomCode}`);
      if (!res.ok) throw new Error(t.home.roomNotFound);

      const session = await res.json();
      const uniqueStudentNames = new Set(session.answers.map((a: any) => a.studentName));
      const studentIndex = uniqueStudentNames.size;
      const assignedHat = hats[studentIndex % 6];

      setSession(name, roomCode, assignedHat, session.topic);
      router.push('/workstation');
    } catch (err: any) {
      setError(err.message === 'Failed to fetch' ? t.home.serverError : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-animated flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="orb w-96 h-96 bg-indigo-500 -top-20 -left-20" style={{ position: 'absolute' }} />
      <div className="orb w-80 h-80 bg-purple-500 -bottom-20 -right-20" style={{ position: 'absolute' }} />
      <div className="orb w-64 h-64 bg-pink-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ position: 'absolute' }} />

      {/* Floating Hat Icons */}
      <div className="absolute top-16 left-16 text-5xl animate-float opacity-20" style={{ animationDelay: '0s' }}>⚪</div>
      <div className="absolute top-32 right-24 text-4xl animate-float opacity-20" style={{ animationDelay: '1s' }}>🔴</div>
      <div className="absolute bottom-24 left-24 text-4xl animate-float opacity-20" style={{ animationDelay: '2s' }}>🟡</div>
      <div className="absolute bottom-16 right-16 text-5xl animate-float opacity-20" style={{ animationDelay: '3s' }}>🟢</div>
      <div className="absolute top-1/2 left-8 text-3xl animate-float opacity-15" style={{ animationDelay: '4s' }}>🔵</div>
      <div className="absolute top-20 right-1/3 text-3xl animate-float opacity-15" style={{ animationDelay: '5s' }}>⚫</div>

      <div className="max-w-md w-full animate-fade-in-up relative z-10">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-4xl">🎩</span>
          </div>
          <h1 className="text-4xl font-black gradient-text mb-3">
            {t.home.title}
          </h1>
          <p className="text-white/50 text-lg">
            {t.home.subtitle}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-3xl p-8 animate-fade-in-up animate-delay-200">
          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white/70 ml-1">
                {t.home.studentName}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  required
                  placeholder={t.home.studentNamePlaceholder}
                  className="input-premium w-full pl-12 pr-4 py-3.5 rounded-xl text-base"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white/70 ml-1">
                {t.home.roomCode}
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  required
                  placeholder={t.home.roomCodePlaceholder}
                  className="input-premium w-full pl-12 pr-4 py-3.5 rounded-xl text-base uppercase tracking-widest font-mono"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm animate-fade-in flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 rounded-xl text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? t.home.joining : t.home.joinSession}</span>
              {!loading && <LogIn size={20} />}
            </button>
          </form>
        </div>

        {/* Hat preview bar */}
        <div className="flex justify-center gap-3 mt-8 animate-fade-in-up animate-delay-400">
          {['⚪', '🔴', '⚫', '🟡', '🟢', '🔵'].map((icon, i) => (
            <div
              key={i}
              className="w-10 h-10 glass rounded-full flex items-center justify-center text-lg hover:scale-125 transition-transform cursor-default"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}