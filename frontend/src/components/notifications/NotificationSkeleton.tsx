'use client';

export default function NotificationSkeleton() {
  return (
    <div className="p-3 rounded-lg animate-pulse">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-[var(--surface-hover)] rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[var(--surface-hover)] rounded w-3/4" />
          <div className="h-3 bg-[var(--surface-hover)] rounded w-full" />
          <div className="h-3 bg-[var(--surface-hover)] rounded w-5/6" />
          <div className="h-3 bg-[var(--surface-hover)] rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}
