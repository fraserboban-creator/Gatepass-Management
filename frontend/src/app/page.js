'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import AnimatedLoadingScreen from '@/components/loading/AnimatedLoadingScreen';

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

  return <AnimatedLoadingScreen />;
}
