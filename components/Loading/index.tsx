import { Loader2 } from 'lucide-react';

export default function Loading({ dictionary }: { readonly dictionary: any }) {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 animate-spin" />
      <span className="ml-2">{dictionary?.loading}</span>
    </div>
  );
}
