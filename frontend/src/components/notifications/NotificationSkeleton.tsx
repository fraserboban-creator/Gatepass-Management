'use client';

export default function NotificationSkeleton() {
  return (
    <div className="p-3 rounded-lg animate-pulse">
      <div className="flex gap-3">
        {/* Icon Skeleton */}
        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg" />

        {/* Content Skeleton */}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}
