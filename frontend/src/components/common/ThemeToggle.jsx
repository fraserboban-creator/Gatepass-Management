'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { getDarkMode, toggleDarkMode } from '@/lib/theme';

export default function ThemeToggle({ className = '' }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(getDarkMode());
    const handler = (e) => setIsDark(e.detail.dark);
    window.addEventListener('darkModeChange', handler);
    return () => window.removeEventListener('darkModeChange', handler);
  }, []);

  const handleToggle = () => {
    const next = toggleDarkMode();
    setIsDark(next);
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium
        text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)] ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}
