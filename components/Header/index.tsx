import React, { useCallback, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext.context';
import { Button } from '@/components/ui/button';
import LanguageSelector from '@/components/LanguageSelector/index';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import LayoutCustomizer from '@/components/LayoutCustomizer';
import { UserProfile } from '@/components/UserProfile';
import { useSession } from 'next-auth/react';
import { Code } from 'lucide-react';
import { supabase } from '@/services/supabase';
import { useRouter } from 'next/navigation';
import { HeaderProps } from './types';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import BlockchainVersionControl from '../BlockchainVersionControl';
import { CustomFile } from '@/types/global';
import { INITIAL_CODE } from '@/constants';
import { useCollaboration } from '@/hooks/useCollaboration';
import PeerList from '../PeerList';

export default function Header({ dictionaries, lang }: HeaderProps) {
  const dictionary = dictionaries?.common?.header;
  const { theme, layout } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState<CustomFile[]>([
    { path: 'main.js', content: INITIAL_CODE.javascript },
  ]);
  const [code, setCode] = useState<string>(INITIAL_CODE['javascript']);
  const [roomId, setRoomId] = useState('');
  const { collaborativeEdit } = useCollaboration();

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      if (collaborativeEdit) {
        collaborativeEdit('monaco', newCode);
      }
    },
    [collaborativeEdit]
  );

  return (
    <header
      className={`sticky top-0 z-50 w-full ${
        theme === 'dark' ? 'bg-background/95' : 'bg-background/80'
      } backdrop-blur supports-[backdrop-filter]:bg-background/60 ${layout}`}
    >
      <TooltipProvider>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Code className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">{dictionary?.title}</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <LanguageSelector />
              <ThemeSwitcher dictionary={dictionary?.themeSwitcher} />
              <LayoutCustomizer dictionary={dictionaries.layoutCustomizer} />
              {session && (
                <UserProfile
                  user={session.user}
                  isOwnProfile={true}
                  dictionary={dictionary?.userProfile}
                />
              )}
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* <h1 className="text-2xl font-bold">{dictionary?.header}</h1> */}
                <div className="flex items-center space-x-4">
                  {/* <LanguageSelector /> */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <BlockchainVersionControl
                          code={code}
                          onCodeUpdate={handleCodeChange}
                          files={files}
                          onFilesUpdate={setFiles}
                          dictionary={dictionary.blockchainVersionControl}
                          lang={lang}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Manage your code versions</TooltipContent>
                  </Tooltip>
                  <PeerList roomId={roomId} dictionary={dictionaries?.peerList} />
                </div>
              </div>

              <Button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/login');
                }}
                variant="outline"
                size="sm"
              >
                {dictionary?.logoutButton}
              </Button>
            </nav>
          </div>
        </div>
      </TooltipProvider>
    </header>
  );
}
