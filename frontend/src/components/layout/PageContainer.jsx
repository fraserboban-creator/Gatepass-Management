'use client';

/**
 * PageContainer Component
 * 
 * Provides consistent layout structure for all pages:
 * - Fixed sidebar on the left
 * - Centered content container with consistent padding
 * - Responsive design for mobile, tablet, and desktop
 * - Professional spacing and alignment
 */

export default function PageContainer({ children }) {
  return (
    <div className="w-full min-h-screen bg-[#f9fafb]">
      {/* Main content wrapper with consistent padding */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Centered content container */}
        <div className="w-full max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
