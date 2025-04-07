import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const AuthSection = ({
  isMobile = false,
  onItemClick,
  isAuthenticated,
  handleAuthClick,
  handleProfile,
}) => {
  return (
    <div className={cn("flex items-center", isMobile ? "w-full" : "space-x-2")}>
      {!isAuthenticated ? (
        <Button
          variant="outline"
          onClick={() => {
            handleAuthClick();
            onItemClick && onItemClick();
          }}
          className={cn(
            "rounded-full transition-all duration-300 hover:bg-primary hover:text-primary-foreground",
            isMobile ? "w-full" : ""
          )}
        >
          Login/Signup
        </Button>
      ) : (
        <Button
          variant="ghost"
          onClick={() => {
            handleProfile();
            onItemClick && onItemClick();
          }}
          className={cn(
            "rounded-full transition-all duration-300 hover:bg-accent",
            isMobile ? "w-full flex items-center justify-start gap-2" : "p-2"
          )}
        >
          <Avatar className="h-8 w-8 border-2 border-primary/10">
            <AvatarImage src="/api/placeholder/32/32" />
            <AvatarFallback>
              <img
                src="account.png"
                alt="User"
                width={40}
                height={40}
                className="rounded-full object-cover border border-gray-200 dark:border-gray-600"
              />
            </AvatarFallback>
          </Avatar>
          {isMobile && <span>Profile</span>}
        </Button>
      )}
    </div>
  );
};

export default AuthSection;
