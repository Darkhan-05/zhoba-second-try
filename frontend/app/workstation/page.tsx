'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import { useLanguage } from '@/context/LanguageContext';
import { Send, CheckCircle, ArrowRight } from 'lucide-react';
import { API_URL } from '../page';

const hatDetails = {
  White: { gradient: 'from-slate-200 to-gray-100', bgDark: 'bg-slate-800', text: 'text-slate-800', button: 'bg-gradient-to-r from-slate-700 to-slate-900', icon: '⚪', ring: 'ring-slate-300' },
  Red: { gradient: 'from-red-500 to-rose-600', bgDark: 'bg-red-800', text: 'text-white', button: 'bg-gradient-to-r from-red-600 to-rose-700', icon: '🔴', ring: 'ring-red-300' },
  Black: { gradient: 'from-zinc-800 to-gray-900', bgDark: 'bg-zinc-900', text: 'text-white', button: 'bg-gradient-to-r from-zinc-700 to-gray-900', icon: '⚫', ring: 'ring-zinc-400' },
  Yellow: { gradient: 'from-yellow-300 to-amber-400', bgDark: 'bg-yellow-700', text: 'text-gray-900', button: 'bg-gradient-to-r from-yellow-500 to-amber-600', icon: '🟡', ring: 'ring-yellow-300' },
  Green: { gradient: 'from-emerald-400 to-green-500', bgDark: 'bg-green-800', text: 'text-white', button: 'bg-gradient-to-r from-emerald-600 to-green-700', icon: '🟢', ring: 'ring-emerald-300' },
  Blue: { gradient: 'from-blue-500 to-indigo-600', bgDark: 'bg-blue-800', text: 'text-white', button: 'bg-gradient-to-r from-blue-600 to-indigo-700', icon: '🔵', ring: 'ring-blue-300' },
};

export default function Workstation() {
  const { studentName, roomCode, hatColor, clearSession } = useSession();
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!studentName || !roomCode || !hatColor) {
      router.push('/');
      return;
    }

    const fetchSession = async () => {
      try {
        const res = await fetch(`${API_URL}/sessions/${roomCode}`);
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err) {
        console.error("Error loading session:", err);
      }
    };
    fetchSession();
  }, [studentName, roomCode, hatColor, router]);

  if (!hatColor || questions.length === 0) return (
    <div className="min-h-screen bg-gradient-animated flex items-center justify-center">
      <div className="glass rounded-2xl px-8 py-6 animate-pulse-glow">
        <p className="text-white/70 text-lg font-medium">{t.workstation.loadingQuestions}</p>
      </div>
    </div>
  );

  const details = hatDetails[hatColor as keyof typeof hatDetails];
  const hatDesc = t.workstation.hatDescriptions[hatColor as keyof typeof t.workstation.hatDescriptions];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          hatColor,
          content: answer,
          questionId: questions[currentStep].id,
          roomCode: roomCode,
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
      console.error("Error submitting:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-animated flex items-center justify-center p-4 relative overflow-hidden">
        <div className="orb w-96 h-96 bg-green-500 -top-20 -right-20" style={{ position: 'absolute' }} />
        <div className="orb w-80 h-80 bg-emerald-400 -bottom-20 -left-20" style={{ position: 'absolute' }} />

        <div className="glass rounded-3xl p-12 text-center max-w-md animate-scale-in relative z-10">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-3">
            {t.workstation.finishTitle.replace('{name}', studentName)}
          </h2>
          <p className="text-white/50 mb-8 text-lg leading-relaxed">
            {t.workstation.finishDescription}
          </p>
          <button
            onClick={() => { clearSession(); router.push('/'); }}
            className="btn-primary px-8 py-3 rounded-xl text-base"
          >
            <span>{t.workstation.backToHome}</span>
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-animated p-4 md:p-8 relative overflow-hidden">
      {/* Orbs matching hat color */}
      <div className="orb w-96 h-96 bg-indigo-500 -top-32 -right-32" style={{ position: 'absolute' }} />
      <div className="orb w-80 h-80 bg-purple-500 -bottom-32 -left-32" style={{ position: 'absolute' }} />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Progress Bar */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex justify-between items-end mb-3">
            <span className="text-white/70 font-bold text-sm">
              {t.workstation.questionOf
                .replace('{current}', String(currentStep + 1))
                .replace('{total}', String(questions.length))}
            </span>
            <span className="text-white/50 font-mono text-sm">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="progress-gradient h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-light rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up animate-delay-100">
          <div className="p-8 md:p-12">
            {/* Hat Badge */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl">{details.icon}</span>
              <span className={`px-4 py-1.5 rounded-full font-black text-sm uppercase tracking-widest bg-gradient-to-r ${details.gradient} ${details.text} shadow-sm`}>
                {hatColor} Hat
              </span>
            </div>

            {/* Question */}
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 leading-tight">
              {currentQuestion?.content}
            </h1>

            {/* Hat Description */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl mb-8 border-l-4 border-indigo-500">
              <p className="text-gray-600 italic text-base">{hatDesc}</p>
            </div>

            {/* Answer Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <textarea
                required
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={5}
                className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg text-gray-800 bg-white placeholder:text-gray-300 resize-none"
                placeholder={t.workstation.writeAnswer}
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-2xl text-white font-bold text-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 ${details.button} hover:shadow-xl hover:-translate-y-0.5`}
              >
                {loading ? t.workstation.sending : (
                  <>
                    <span>{currentStep === questions.length - 1 ? t.workstation.finishAnalysis : t.workstation.nextQuestion}</span>
                    {currentStep === questions.length - 1 ? <CheckCircle size={20} /> : <ArrowRight size={20} />}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-8 animate-fade-in-up animate-delay-300">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${i === currentStep
                  ? 'w-8 bg-white/80'
                  : i < currentStep
                    ? 'w-2 bg-white/40'
                    : 'w-2 bg-white/15'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}