
import React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertCircle, Check, CheckCheck, Clock } from "lucide-react";

const ChatMessage = ({ message, isCurrentUser, status }) => {
  let formattedTime;
  
  try {
    if (message.createdAt && message.createdTime) {
      formattedTime = format(
        new Date(`${message.createdAt}T${message.createdTime}`),
        "HH:mm"
      );
    } else if (message.timestamp) {
      formattedTime = format(new Date(message.timestamp), "HH:mm");
    } else {
      formattedTime = format(new Date(), "HH:mm");
    }
  } catch (e) {
    console.error("Error formatting time:", e);
    formattedTime = "Error";
  }
  
  const renderStatusIndicator = () => {
    if (!isCurrentUser) return null;
    
    switch (status) {
      case "sending":
        return <Clock size={12} className="ml-1 text-gray-400" />;
      case "error":
        return <AlertCircle size={12} className="ml-1 text-red-500" />;
      case "sent":
        return <CheckCheck size={12} className="ml-1 text-gray-400" />;
      default:
        return <Check size={12} className="ml-1 text-gray-400" />;
    }
  };
  
  return (
    <div
      className={cn(
        "flex mb-1.5",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] break-words rounded-lg px-2.5 py-1.5 shadow-sm",
          isCurrentUser
            ? "bg-[#a9cedd] text-gray-800" // WhatsApp green for outgoing messages
            : "bg-slate-200 dark:bg-gray-700 text-gray-800 dark:text-white" // White for incoming messages
        )}
      >
        <p className="text-sm">{message.content}</p>
        <div className="flex justify-end items-center mt-0.5">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {formattedTime}
          </p>
          {renderStatusIndicator()}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
