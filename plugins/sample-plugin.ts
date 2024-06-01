import { Plugin, PluginContext } from "@/types/plugin";
import { AlertCircle } from "lucide-react";

const SamplePlugin: Plugin = {
  id: "sample-plugin",
  name: "Sample Plugin",
  version: "1.0.0",
  description: "A sample plugin to demonstrate the plugin system",

  init: (context: PluginContext) => {
    context.addMenuItem({
      id: "sample-menu-item",
      label: "Sample Plugin Action",
      action: () => {
        alert("Sample plugin action executed!");
      },
    });

    context.addToolbarItem({
      id: "sample-toolbar-item",
      icon: <AlertCircle />,
      tooltip: "Sample Plugin Toolbar Action",
      action: () => {
        alert("Sample plugin toolbar action executed!");
      },
    });

    context.registerHook("onCodeChange", (newCode: string) => {
      console.log("Code changed:", newCode);
    });
  },

  unload: () => {
    console.log("Sample plugin unloaded");
  },
};

export default SamplePlugin;
