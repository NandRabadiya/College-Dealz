import React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertCircle, Check, Clock } from "lucide-react";

const ChatMessage = ({ message, isCurrentUser, status }) => {
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
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] break-words rounded-lg px-3 py-2 shadow-sm",
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted dark:bg-muted/40"
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
          {renderStatusIndicator()}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;