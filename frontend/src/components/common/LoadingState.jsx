'use client';

import Loader from './Loader';

/**
 * LoadingState Component
 * Shows a loading state with a spinning loader
 * 
 * Usage:
 * <LoadingState /> - Default centered loader
 * <LoadingState text="Loading data..." /> - With custom text
 * <LoadingState fullScreen /> - Full screen overlay
 * <LoadingState size="lg" /> - Large loader
 */
export default function LoadingState({ 
  size = 'lg', 
  fullScreen = false, 
  text = 'Loading...',
  className = '' 
}) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader size={size} className="text-blue-500" />
          {text && <p className="text-sm font-medium text-[var(--text-secondary)]">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-4 ${className}`}>
      <Loader size={size} className="text-blue-500" />
      {text && <p className="text-sm font-medium text-[var(--text-secondary)]">{text}</p>}
    </div>
  );
}

