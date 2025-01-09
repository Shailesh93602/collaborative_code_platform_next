'use client';

import dynamic from 'next/dynamic';

const ResetPasswordComponent = dynamic(() => import('./ResetPassword'), { ssr: false });

export default function ResetPasswordPageWrapper({ dictionary }: { dictionary: any }) {
  return <ResetPasswordComponent dictionary={dictionary} />;
}
