import React from "react";
import { MessageCircle, Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import WantlistButton from "./WantlistButton";
import NotificationBell from "../notification/Notification";

const ActionButtons = ({ 
  isMobile = false, 
  onItemClick, 
  handleChat, 
  handlePostDeal, 
  handleWishlist,
  handleWantlist
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1",
        isMobile ? "flex-col w-full space-y-2" : "space-x-1"
      )}
    >
      <Button
        variant="ghost"
        size={isMobile ? "default" : "icon"}
        className={cn(
          "rounded-full transition-all duration-300 hover:bg-accent",
          isMobile ? "w-full justify-start px-3 py-2" : "h-9 w-9"
        )}
        onClick={() => {
          handleChat();
          onItemClick && onItemClick();
        }}
      >
        <MessageCircle className={cn("h-5 w-5", isMobile && "mr-3")} />
        {isMobile && <span>Messages</span>}
      </Button>
      
      <Button
        variant="ghost"
        size={isMobile ? "default" : "icon"}
        className={cn(
          "rounded-full transition-all duration-300 hover:bg-accent",
          isMobile ? "w-full justify-start px-3 py-2" : "h-9 w-9"
        )}
        onClick={() => {
          handlePostDeal();
          onItemClick && onItemClick();
        }}
      >
        <Plus className={cn("h-5 w-5", isMobile && "mr-3")} />
        {isMobile && <span>Post a Deal</span>}
      </Button>
      
      <Button
        variant="ghost"
        size={isMobile ? "default" : "icon"}
        className={cn(
          "rounded-full transition-all duration-300 hover:bg-accent",
          isMobile ? "w-full justify-start px-3 py-2" : "h-9 w-9"
        )}
        onClick={() => {
          handleWishlist();
          onItemClick && onItemClick();
        }}
      >
        <Heart className={cn("h-5 w-5", isMobile && "mr-3")} />
        {isMobile && <span>Wishlist</span>}
      </Button>
    
      {isMobile && (
        <NotificationBell isMobile={true} />
      )}
    </div>
  );
};

export default ActionButtons;