'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

const CollaborationContext = createContext<{
  yDoc: Y.Doc | null;
  provider: WebrtcProvider | null;
}>({
  yDoc: null,
  provider: null,
});

export function CollaborationProvider({ children }: { readonly children: React.ReactNode }) {
  const [yDoc, setYDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebrtcProvider | null>(null);

  useEffect(() => {
    const doc = new Y.Doc();
    const webrtcProvider = new WebrtcProvider('collaborative-code-platform', doc);
    setYDoc(doc);
    setProvider(webrtcProvider);

    return () => {
      webrtcProvider.destroy();
    };
  }, []);

  return (
    <CollaborationContext.Provider value={{ yDoc, provider }}>
      {children}
    </CollaborationContext.Provider>
  );
}

export const useCollaborationContext = () => useContext(CollaborationContext);
