
import React, { useState, useRef, useEffect } from "react";
import { ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const WantlistButton = ({ isMobile = false, onItemClick, className, onClick }) => {
  const [ripple, setRipple] = useState(null);
  const buttonRef = useRef(null);
  
  const handleClick = (e) => {
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setRipple({ x, y, id: Date.now() });
    }
        if (onClick) onClick();
    if (onItemClick) onItemClick();
  };
  
  useEffect(() => {
    if (ripple) {
      const timer = setTimeout(() => {
        setRipple(null);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [ripple]);

  return (
    <button
      ref={buttonRef}
      id="wantlist-button"
      className={cn(
        "wantlist-button rounded-md flex items-center gap-2 px-4 py-2 transition-all duration-300",
        isMobile ? "w-full justify-start" : "justify-center",
        className
      )}
      onClick={handleClick}
      aria-label="Wantlist"
    >
      <ClipboardList className="icon h-5 w-5 transition-transform duration-300" />
      <span className="font-medium">Wantlist</span>
      
      {ripple && (
        <span 
          className="wantlist-ripple" 
          style={{ 
            left: ripple.x, 
            top: ripple.y 
          }}
          key={ripple.id}
        />
      )}
    </button>
  );
};

export default WantlistButton;
