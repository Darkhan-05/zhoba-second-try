'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';

export default function Home() {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setSession } = useSession();

  const hats = ['White', 'Red', 'Black', 'Yellow', 'Green', 'Blue'] as const;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:4001/sessions/${roomCode}`);
      if (!res.ok) {
        throw new Error('Room not found');
      }
      const session = await res.json();

      // Role assignment logic: (TotalParticipants % 6)
      // Since we don't know the exact order of joining in real-time without sockets,
      // we'll use the current answer count to assign a hat.
      const hatIndex = session._count.answers % 6;
      const assignedHat = hats[hatIndex];

      setSession(name, roomCode, assignedHat, session.topic);
      router.push('/workstation');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">Six Thinking Hats</h1>
        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Student Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Room Code</label>
            <input
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Session'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/teacher')}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Are you a teacher? Create a session
          </button>
        </div>
      </div>
    </div>
  );
}
