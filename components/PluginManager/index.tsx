'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { pluginManager } from '@/lib/pluginManager';
import { Plugin } from '@/types/plugin';
import { useToast } from '@/hooks/useToast';
import { PluginManagerProps } from './types';

export default function PluginManager({ dictionary }: PluginManagerProps) {
  const [loadedPlugins, setLoadedPlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPlugin(() => import('@/plugins/sample-plugin'));
  }, []);

  const loadPlugin = async (pluginModule: () => Promise<{ default: Plugin }>) => {
    setIsLoading(true);
    try {
      await pluginManager.loadPlugin(pluginModule);
      setLoadedPlugins(pluginManager.getLoadedPlugins());
      toast({
        title: dictionary?.pluginLoaded,
        description: dictionary?.pluginLoadedDescription,
      });
    } catch (error) {
      console.error(dictionary?.errorLoadingPlugin, error);
      toast({
        title: dictionary?.errorLoadingPlugin,
        description: error instanceof Error ? error.message : dictionary?.unknownError,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unloadPlugin = async (pluginId: string) => {
    setIsLoading(true);
    try {
      pluginManager.unloadPlugin(pluginId);
      setLoadedPlugins(pluginManager.getLoadedPlugins());
      toast({
        title: dictionary?.pluginUnloaded,
        description: dictionary?.pluginUnloadedDescription,
      });
    } catch (error) {
      console.error(dictionary?.errorUnloadingPlugin, error);
      toast({
        title: dictionary?.errorUnloadingPlugin,
        description: error instanceof Error ? error.message : dictionary?.unknownError,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{dictionary?.plugins}</h2>
      <div className="space-y-4">
        {loadedPlugins.map((plugin) => (
          <div
            key={plugin.id}
            className="flex items-center justify-between p-4 bg-secondary rounded-lg"
          >
            <div>
              <h3 className="text-lg font-semibold">{plugin.name}</h3>
              <p className="text-sm text-muted-foreground">{plugin.description}</p>
              <p className="text-xs text-muted-foreground">
                {dictionary?.version}: {plugin.version}
              </p>
            </div>
            <Button
              onClick={() => unloadPlugin(plugin.id)}
              variant="destructive"
              disabled={isLoading}
            >
              {dictionary?.unload}
            </Button>
          </div>
        ))}
      </div>
      {isLoading && <p className="mt-4">{dictionary?.loading}</p>}
    </div>
  );
}
