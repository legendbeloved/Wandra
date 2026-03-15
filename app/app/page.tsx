"use client";

import dynamic from 'next/dynamic';
import { SplashScreen } from '@/components/SplashScreen';

const AppClient = dynamic(() => import('@/components/AppClient'), {
  ssr: false,
  loading: () => <SplashScreen onComplete={() => {}} />
});

export default function Page() {
  return <AppClient />;
}
