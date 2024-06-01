export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  init: (context: PluginContext) => void;
  unload: () => void;
}

export interface PluginContext {
  addMenuItem: (item: MenuItem) => void;
  addToolbarItem: (item: ToolbarItem) => void;
  registerHook: (hookName: string, callback: (...args: any[]) => any) => void;
}

export interface MenuItem {
  id: string;
  label: string;
  action: () => void;
}

export interface ToolbarItem {
  id: string;
  icon: React.ReactNode;
  tooltip: string;
  action: () => void;
}
