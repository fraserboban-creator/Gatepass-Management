'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const user = authService.getUser();
      // Redirect to role-specific dashboard
      router.push(`/${user.role}/dashboard`);
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Hostel Gatepass Management System
        </h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
