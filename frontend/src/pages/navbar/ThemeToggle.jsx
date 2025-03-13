import React from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ThemeToggle = ({ theme, toggleTheme, isMobile = false }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={toggleTheme}
    aria-label="Toggle theme"
    className={cn("rounded-full h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 transition-all duration-300 hover:bg-accent")}
  >
    {theme === "light" ? (
      <Moon className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 transition-transform duration-300 hover:scale-110" />
    ) : (
      <Sun className="h-3.5 w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 transition-transform duration-300 hover:scale-110" />
    )}
  </Button>
);

export default ThemeToggle;