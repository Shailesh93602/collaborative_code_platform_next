'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'react-query';
import CodeEditor from '@/components/CodeEditor';
import ExecutionPanel from '@/components/ExecutionPanel/index';
import VisualizationStudio from '@/components/VisualizationStudio';
import AIAssistant from '@/components/AIAssistant';
import TimelineDebugger from '@/components/TimelineDebugger';
import CodeExplainer from '@/components/CodeExplainer/index';
import CodeVisualizer from '@/components/CodeVisualizer';
import CollaborativeWhiteboard from '@/components/CollaborativeWhiteboard/index';
import { PerformanceProfiler } from '@/components/PerformanceProfiler';
import MultiLanguageSupport from '@/components/MultiLanguageSupport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CollaborationProvider, useCollaboration } from '@/components/CollaborationProvider';
import { useProjectContext } from '@/contexts/ProjectContext.context';
import UserOnboarding from '@/components/UserOnboarding';
import PluginManager from '@/components/PluginManager';
import { useToast } from '@/hooks/useToast';
import { useRouter, useSearchParams } from 'next/navigation';
import Loading from '@/components/Loading/index';
import ProjectImport from '@/components/ProjectImport';
import CodeSnippetLibrary from '@/components/CodeSnippetLibrary';
import { setLanguagePreference } from '@/lib/languagePreference';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/services/supabase';
import { Session } from '@supabase/supabase-js';
import { INITIAL_CODE } from '@/constants';

export default function HomeComponent({
  dictionary,
  lang,
}: {
  readonly dictionary: any;
  lang: 'en' | 'hi' | 'gu';
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session>();
  const { projectId } = useProjectContext();
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>(INITIAL_CODE[language]);
  const [roomId, setRoomId] = useState('');
  const { collaborativeEdit } = useCollaboration();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const locale = searchParams?.get('locale') ?? 'en';
  const { fetchProjectData: fetchProjectDataQuery } = useProjects();
  const { data: projectData } = useQuery(
    ['projectData', projectId],
    () => fetchProjectDataQuery(projectId ?? ''),
    {
      enabled: !!projectId,
      onError: (error) => {
        console.error('Error fetching project data:', error);
        toast({
          title: 'Error fetching project data',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
      },
    }
  );

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data?.session) {
        setSession(data?.session);
      }
    };
    getSession();
  }, []);

  useEffect(() => {
    setLanguagePreference(locale);
  }, [locale]);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      if (collaborativeEdit) {
        collaborativeEdit('monaco', newCode);
      }
    },
    [collaborativeEdit]
  );

  const handleLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(INITIAL_CODE[newLanguage] ?? '');
  }, []);

  useEffect(() => {
    if (projectData) {
      setCode(projectData?.[0]?.code ?? INITIAL_CODE?.javascript);
      setLanguage(projectData?.[0]?.language ?? 'javascript');
    }
  }, [projectData]);

  if (status === 'loading') {
    return <Loading dictionary={dictionary?.loading} />;
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Button onClick={() => router.push('/login')}>{dictionary?.signIn}</Button>
      </div>
    );
  }

  return (
    <CollaborationProvider>
      <main className="flex min-h-screen flex-col bg-background">
        <div className="flex-grow flex overflow-hidden">
          <div className="w-2/3 flex flex-col border-r">
            <div id="code-editor" className="h-[300px] border-b">
              <CodeEditor
                value={code}
                onChange={handleCodeChange}
                language={language}
                dictionary={dictionary?.CodeEditor}
              />
            </div>
            <Tabs defaultValue="execution" className="flex-grow">
              <TabsList className="border-b">
                <TabsTrigger value="execution">Execution</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              <TabsContent value="execution">
                <ExecutionPanel
                  code={code}
                  onCodeChange={handleCodeChange}
                  dictionary={dictionary?.executionPanel}
                />
              </TabsContent>
              <TabsContent value="timeline">
                <TimelineDebugger dictionary={dictionary?.timelineDebugger} />
              </TabsContent>
              <TabsContent value="performance">
                <PerformanceProfiler
                  code={code}
                  language={language}
                  dictionary={dictionary?.performanceProfiler}
                />
              </TabsContent>
            </Tabs>
          </div>
          <div className="w-1/3 flex flex-col">
            <Tabs defaultValue="ai" className="flex-grow">
              <TabsList className="border-b">
                <TabsTrigger value="ai">AI Assistant</TabsTrigger>
                <TabsTrigger value="visualize">Visualize</TabsTrigger>
                <TabsTrigger value="explain">Explain</TabsTrigger>
                <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
                <TabsTrigger value="plugins">Plugins</TabsTrigger>
              </TabsList>
              <TabsContent value="ai">
                <AIAssistant
                  code={code}
                  onSuggestionApply={handleCodeChange}
                  language={language}
                  dictionary={dictionary?.aiAssistant}
                />
              </TabsContent>
              <TabsContent value="visualize">
                <ScrollArea className="h-[400px]">
                  <VisualizationStudio dictionary={dictionary?.visualizationStudio} />
                  <Separator className="my-4" />
                  <CodeVisualizer code={code} dictionary={dictionary?.codeVisualizer} />
                </ScrollArea>
              </TabsContent>
              <TabsContent value="explain">
                <ScrollArea className="h-[400px]">
                  <CodeExplainer code={code} dictionary={dictionary?.codeSnippetLibrary} />
                  <Separator className="my-4" />
                  <MultiLanguageSupport
                    code={code}
                    language={language}
                    onLanguageChange={handleLanguageChange}
                    dictionary={dictionary?.multiLanguageSupport}
                    lang={lang}
                  />
                </ScrollArea>
              </TabsContent>
              <TabsContent value="collaborate">
                <CollaborativeWhiteboard
                  roomId={roomId}
                  dictionary={dictionary?.collaborativeOnboarding}
                />
              </TabsContent>
              <TabsContent value="plugins">
                <PluginManager dictionary={dictionary?.pluginManager} />
              </TabsContent>
            </Tabs>
            <ProjectImport dictionary={dictionary?.projectImport} />
            <CodeSnippetLibrary onCodeChange={handleCodeChange} />
          </div>
        </div>
        <UserOnboarding dictionary={dictionary?.userOnboarding} />
      </main>
    </CollaborationProvider>
  );
}
