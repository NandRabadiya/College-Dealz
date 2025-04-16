import React, { useRef } from "react";
import { ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils"; // Ensure this is imported properly

const WantlistButton = ({ isMobile = false, onItemClick, className, onClick }) => {
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (onItemClick) onItemClick(e);
  };

  return (
    <button
      ref={buttonRef}
      id="wantlist-button"
      className={cn(
        "wantlist-button rounded-md flex items-center gap-2 px-4 py-2",
        isMobile ? "w-auto px-2 py-2 justify-start" : "justify-center",
        className
      )}
      onClick={handleClick}
      aria-label="Wantlist"
    >
      <ClipboardList className="wantlist-button icon h-5 w-5" />
      {!isMobile && (
    <span className="wantlist-button font-medium">Wantlist</span>
  )}    </button>
  );
};

export default WantlistButton;
