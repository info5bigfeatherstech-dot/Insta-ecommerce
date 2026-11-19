"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { changeThemeWithTransition } from "@/lib/theme-transition";
import { useMounted } from "@/hooks/use-mounted";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        aria-label="Select theme"
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <DropdownMenu>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Select theme"
            >
              {resolvedTheme === "dark" ? (
                <Moon className="h-4 w-4 transition-transform" />
              ) : (
                <Sun className="h-4 w-4 transition-transform" />
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Theme ({theme ? theme.charAt(0).toUpperCase() + theme.slice(1) : "System"})
        </TooltipContent>
        <DropdownMenuContent align="end" className="w-36 p-1">
          <DropdownMenuItem
            onClick={() => changeThemeWithTransition(setTheme, "light")}
            className="flex items-center justify-between text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sun className="h-3.5 w-3.5 text-warning" />
              <span>Light</span>
            </div>
            {theme === "light" && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => changeThemeWithTransition(setTheme, "dark")}
            className="flex items-center justify-between text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Moon className="h-3.5 w-3.5 text-primary" />
              <span>Dark</span>
            </div>
            {theme === "dark" && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => changeThemeWithTransition(setTheme, "system")}
            className="flex items-center justify-between text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
              <span>System</span>
            </div>
            {theme === "system" && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Tooltip>
  </TooltipProvider>
  );
}
