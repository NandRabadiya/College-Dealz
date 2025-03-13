import React from "react";
import { cn } from "@/lib/utils";

const LogoSection = ({ logo, handleLogoClick, className = "" }) => (
  <img
    src={logo}
    alt="Logo"
    className={cn("h-6 md:h-7 lg:h-9 cursor-pointer transition-all duration-300 hover:opacity-80", className)}
    onClick={handleLogoClick}
  />
);

export default LogoSection;
