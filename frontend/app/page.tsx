'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export default function Home() {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setSession } = useSession();

  // Названия шляп на английском (оставляем для логики/бэкенда), 
  // но в интерфейсе их можно будет перевести позже.
  const hats = ['White', 'Red', 'Black', 'Yellow', 'Green', 'Blue'] as const;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Запрашиваем сессию. Бэкенд должен вернуть список уникальных имен в ответах.
      const res = await fetch(`${API_URL}/sessions/${roomCode}`);
      if (!res.ok) throw new Error('Комната не найдена');

      const session = await res.json();

      // 2. Считаем уникальных студентов. 
      // Предполагаем, что бэкенд возвращает session.answers
      const uniqueStudentNames = new Set(session.answers.map((a: any) => a.studentName));

      // 3. Индекс шляпы зависит от количества УЖЕ зашедших людей
      const studentIndex = uniqueStudentNames.size;
      const assignedHat = hats[studentIndex % 6];

      setSession(name, roomCode, assignedHat, session.topic);
      router.push('/workstation');
    } catch (err: any) {
      setError(err.message === 'Failed to fetch' ? 'Ошибка сервера' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">Шесть шляп мышления</h1>
        <form onSubmit={handleJoin} className="text-black space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Имя ученика</label>
            <input
              type="text"
              required
              placeholder="Введите ваше имя"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Код комнаты</label>
            <input
              type="text"
              required
              placeholder="Например: 1234"
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
            {loading ? 'Вход...' : 'Войти в сессию'}
          </button>
        </form>
        {/* <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/teacher')}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Вы учитель? Создать сессию
          </button>
        </div> */}
      </div>
    </div>
  );
}