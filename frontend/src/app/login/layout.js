'use client';

export default function LoginLayout({ children }) {
  return (
    <div className="fixed inset-0 bg-[#f9fafb] flex items-center justify-center p-4">
      {children}
    </div>
  );
}
