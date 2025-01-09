'use client';

import dynamic from 'next/dynamic';
const RegisterComponent = dynamic(() => import('./Register'), { ssr: false });

export default function RegisterWrapper({ dictionary }: { dictionary: any }) {
  return <RegisterComponent dictionary={dictionary?.auth} />;
}
