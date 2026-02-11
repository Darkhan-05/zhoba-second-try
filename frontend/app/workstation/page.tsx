'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import { Send, LogOut } from 'lucide-react';

const hatDetails = {
  White: {
    color: 'bg-white',
    border: 'border-gray-300',
    text: 'text-gray-800',
    button: 'bg-gray-800 hover:bg-gray-900',
    description: 'Focus on available data and facts. What information do we have? What is missing?',
    icon: '⚪',
  },
  Red: {
    color: 'bg-red-500',
    border: 'border-red-600',
    text: 'text-white',
    button: 'bg-red-700 hover:bg-red-800',
    description: 'Express emotions, feelings, and intuitions without justification.',
    icon: '🔴',
  },
  Black: {
    color: 'bg-gray-900',
    border: 'border-black',
    text: 'text-white',
    button: 'bg-gray-700 hover:bg-gray-600',
    description: 'Identify risks, difficulties, and potential problems. Why might this fail?',
    icon: '⚫',
  },
  Yellow: {
    color: 'bg-yellow-400',
    border: 'border-yellow-500',
    text: 'text-gray-900',
    button: 'bg-yellow-600 hover:bg-yellow-700',
    description: 'Look for benefits, value, and optimistic outcomes. Why is this a good idea?',
    icon: '🟡',
  },
  Green: {
    color: 'bg-green-500',
    border: 'border-green-600',
    text: 'text-white',
    button: 'bg-green-700 hover:bg-green-800',
    description: 'Focus on creativity, possibilities, alternatives, and new ideas.',
    icon: '🟢',
  },
  Blue: {
    color: 'bg-blue-600',
    border: 'border-blue-700',
    text: 'text-white',
    button: 'bg-blue-800 hover:bg-blue-900',
    description: 'Manage the thinking process. Summarize, conclude, and decide next steps.',
    icon: '🔵',
  },
};

export default function Workstation() {
  const { studentName, roomCode, hatColor, topic, clearSession } = useSession();
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!studentName || !roomCode || !hatColor) {
      router.push('/');
    }
  }, [studentName, roomCode, hatColor, router]);

  if (!hatColor) return null;

  const details = hatDetails[hatColor];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4001/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          roomCode,
          hatColor,
          content: answer,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${details.color} p-4 transition-colors duration-500`}>
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <div className="text-6xl mb-4">{details.icon}</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Thank you, {studentName}!</h2>
          <p className="text-gray-600 mb-6">Your contribution has been recorded. Wait for the teacher to show the results.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-indigo-600 font-medium hover:underline"
          >
            Submit another answer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${details.color} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className={`flex items-center space-x-3 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm ${details.text}`}>
            <span className="text-2xl">{details.icon}</span>
            <span className="font-bold">{hatColor} Hat</span>
          </div>
          <button
            onClick={() => { clearSession(); router.push('/'); }}
            className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${details.text}`}
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className={`p-6 md:p-10 ${details.color} ${details.text} border-b ${details.border}`}>
            <h2 className="text-sm uppercase tracking-widest font-bold opacity-80 mb-2">Topic</h2>
            <h1 className="text-2xl md:text-4xl font-black">{topic}</h1>
          </div>

          <div className="p-6 md:p-10">
            <div className="mb-8 p-6 bg-gray-50 rounded-2xl border-l-4 border-indigo-500">
              <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">Your Focus</h3>
              <p className="text-gray-800 text-lg leading-relaxed">{details.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">Your Response</label>
                <textarea
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-0 transition-all resize-none text-gray-800"
                  placeholder={`As a ${hatColor} Hat thinker, my thoughts are...`}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl text-white font-bold text-lg shadow-lg transform transition hover:-translate-y-1 active:scale-95 disabled:opacity-50 ${details.button}`}
              >
                {loading ? 'Sending...' : (
                  <>
                    <span>Submit to Session</span>
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
