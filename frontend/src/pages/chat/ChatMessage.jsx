import React from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const ChatMessage = ({ message, isCurrentUser }) => {
  return (
    <div
      className={cn(
        "flex mb-4",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] break-words rounded-lg px-4 py-2 shadow-sm",
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted dark:bg-muted/40"
        )}
      >
        <p className="text-sm">{message.content}</p>
        <p
          className={cn(
            "text-xs mt-1",
            isCurrentUser
              ? "text-primary-foreground/70"
              : "text-muted-foreground"
          )}
        >
          {formatDistanceToNow(
            new Date(`${message.createdAt}T${message.createdTime}`),
            { addSuffix: true }
          )}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
