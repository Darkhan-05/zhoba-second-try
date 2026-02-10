'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type HatColor = 'White' | 'Red' | 'Black' | 'Yellow' | 'Green' | 'Blue';

interface SessionContextType {
  studentName: string;
  roomCode: string;
  hatColor: HatColor | null;
  topic: string;
  setSession: (name: string, room: string, hat: HatColor, topic: string) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [studentName, setStudentName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [hatColor, setHatColor] = useState<HatColor | null>(null);
  const [topic, setTopic] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('six-hats-session');
    if (saved) {
      const parsed = JSON.parse(saved);
      setStudentName(parsed.studentName);
      setRoomCode(parsed.roomCode);
      setHatColor(parsed.hatColor);
      setTopic(parsed.topic);
    }
  }, []);

  const setSession = (name: string, room: string, hat: HatColor, topic: string) => {
    setStudentName(name);
    setRoomCode(room);
    setHatColor(hat);
    setTopic(topic);
    localStorage.setItem('six-hats-session', JSON.stringify({ studentName: name, roomCode: room, hatColor: hat, topic }));
  };

  const clearSession = () => {
    setStudentName('');
    setRoomCode('');
    setHatColor(null);
    setTopic('');
    localStorage.removeItem('six-hats-session');
  };

  return (
    <SessionContext.Provider value={{ studentName, roomCode, hatColor, topic, setSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
