import { Plugin, PluginContext } from "@/types/plugin";

class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private hooks: Map<string, Set<(...args: any[]) => any>> = new Map();

  private createPluginContext(pluginId: string): PluginContext {
    return {
      addMenuItem: (item) => {
        // Implementation for adding menu items
        console.log(`Adding menu item for plugin ${pluginId}:`, item);
      },
      addToolbarItem: (item) => {
        // Implementation for adding toolbar items
        console.log(`Adding toolbar item for plugin ${pluginId}:`, item);
      },
      registerHook: (hookName, callback) => {
        if (!this.hooks.has(hookName)) {
          this.hooks.set(hookName, new Set());
        }
        this.hooks.get(hookName)!.add(callback);
      },
    };
  }

  async loadPlugin(pluginModule: () => Promise<{ default: Plugin }>) {
    const { default: plugin } = await pluginModule();
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} is already loaded.`);
      return;
    }
    const context = this.createPluginContext(plugin.id);
    plugin.init(context);
    this.plugins.set(plugin.id, plugin);
    console.log(`Plugin ${plugin.id} loaded successfully.`);
  }

  unloadPlugin(pluginId: string) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.unload();
      this.plugins.delete(pluginId);
      console.log(`Plugin ${pluginId} unloaded successfully.`);
    } else {
      console.warn(`Plugin ${pluginId} is not loaded.`);
    }
  }

  executeHook(hookName: string, ...args: any[]) {
    const hookCallbacks = this.hooks.get(hookName);
    if (hookCallbacks) {
      for (const callback of hookCallbacks) {
        callback(...args);
      }
    }
  }

  getLoadedPlugins() {
    return Array.from(this.plugins.values());
  }
}

export const pluginManager = new PluginManager();
