"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { pluginManager } from "@/lib/plugin-manager";
import { Plugin } from "@/types/plugin";

export function PluginManager() {
  const [loadedPlugins, setLoadedPlugins] = useState<Plugin[]>([]);

  useEffect(() => {
    // Load initial plugins
    loadPlugin(() => import("@/plugins/sample-plugin"));
  }, []);

  const loadPlugin = async (
    pluginModule: () => Promise<{ default: Plugin }>
  ) => {
    await pluginManager.loadPlugin(pluginModule);
    setLoadedPlugins(pluginManager.getLoadedPlugins());
  };

  const unloadPlugin = (pluginId: string) => {
    pluginManager.unloadPlugin(pluginId);
    setLoadedPlugins(pluginManager.getLoadedPlugins());
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Plugins</h2>
      <div className="space-y-4">
        {loadedPlugins.map((plugin) => (
          <div
            key={plugin.id}
            className="flex items-center justify-between p-4 bg-secondary rounded-lg"
          >
            <div>
              <h3 className="text-lg font-semibold">{plugin.name}</h3>
              <p className="text-sm text-muted-foreground">
                {plugin.description}
              </p>
              <p className="text-xs text-muted-foreground">
                Version: {plugin.version}
              </p>
            </div>
            <Button
              onClick={() => unloadPlugin(plugin.id)}
              variant="destructive"
            >
              Unload
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
