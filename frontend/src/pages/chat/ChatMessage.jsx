import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertCircle, Check, Clock } from "lucide-react";

const ChatMessage = ({ message, isCurrentUser, status, isNew }) => {
  const [highlight, setHighlight] = useState(isNew);
  
  // Handle the highlight animation when a new message arrives
  useEffect(() => {
    if (isNew) {
      setHighlight(true);
      // Keep the highlight for a short duration, then fade it out
      const timer = setTimeout(() => {
        setHighlight(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const formattedTime = format(
    new Date(`${message.createdAt}T${message.createdTime}`),
    "hh:mm a"
  );
  
  const renderStatusIndicator = () => {
    if (!isCurrentUser) return null;
    
    switch (status) {
      case "sending":
        return <Clock size={12} className="ml-1 text-muted-foreground" />;
      case "error":
        return <AlertCircle size={12} className="ml-1 text-destructive" />;
      case "sent":
        return <Check size={12} className="ml-1 text-muted-foreground" />;
      default:
        return <Check size={12} className="ml-1 text-muted-foreground" />;
    }
  };
  
  return (
    <div
      className={cn(
        "flex mb-2 w-full",
        isCurrentUser ? "justify-end" : "justify-start",
        highlight && !isCurrentUser && "animate-pulse"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] break-words rounded-lg px-3 py-2 shadow-sm transition-all duration-300",
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : highlight 
              ? "bg-blue-100 dark:bg-blue-900/30" 
              : "bg-muted dark:bg-muted/40",
          highlight && !isCurrentUser && "border-l-4 border-blue-500"
        )}
      >
        <p className="text-sm">{message.content}</p>
        <div className="flex justify-end items-center mt-1">
          <span
            className={cn(
              "text-xs",
              isCurrentUser
                ? "text-primary-foreground/70"
                : "text-muted-foreground"
            )}
          >
            {formattedTime}
          </span>
          {/* {renderStatusIndicator()} */}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatMessage);