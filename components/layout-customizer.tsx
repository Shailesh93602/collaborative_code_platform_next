"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext.context";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LayoutList, LayoutTemplate } from "lucide-react";

export function LayoutCustomizer() {
  const { layout, setLayout } = useTheme();

  return (
    <div className="flex space-x-2">
      <Button
        variant={layout === "default" ? "default" : "outline"}
        size="icon"
        onClick={() => setLayout("default")}
        aria-label="Default layout"
      >
        <LayoutTemplate className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      <Button
        variant={layout === "compact" ? "default" : "outline"}
        size="icon"
        onClick={() => setLayout("compact")}
        aria-label="Compact layout"
      >
        <LayoutList className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      <Button
        variant={layout === "wide" ? "default" : "outline"}
        size="icon"
        onClick={() => setLayout("wide")}
        aria-label="Wide layout"
      >
        <LayoutDashboard className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    </div>
  );
}
