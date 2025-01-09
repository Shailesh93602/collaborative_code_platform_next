'use client';
import dynamic from 'next/dynamic';
const LoginPageComponent = dynamic(() => import('./Login'), { ssr: false });

export default function LoginPageWrapper({ dictionary }: { dictionary: any }) {
  return <LoginPageComponent dictionary={dictionary} />;
}
