import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react"; // Import for loading spinner

const AuthSection = ({
  isMobile = false,
  onItemClick,
  isAuthenticated,
  handleAuthClick,
  handleProfile,
}) => {
  const { user, isAuth, loading } = useSelector((state) => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Track login/signup processing state
  useEffect(() => {
    const handleLoginStart = () => setIsProcessing(true);
    const handleLoginComplete = () => setIsProcessing(false);
    
    window.addEventListener('LOGIN_PROCESSING', handleLoginStart);
    window.addEventListener('LOGIN_AFTER_SIGNUP_COMPLETE', handleLoginComplete);
    
    return () => {
      window.removeEventListener('LOGIN_PROCESSING', handleLoginStart);
      window.removeEventListener('LOGIN_AFTER_SIGNUP_COMPLETE', handleLoginComplete);
    };
  }, []);

  const userInitial = user?.username?.charAt(0)?.toUpperCase();
  const isButtonDisabled = loading || isProcessing;

  return (
    <div className={cn("flex items-center", isMobile ? "w-full" : "space-x-2")}>
      {!isAuthenticated ? (
        <Button
          variant="outline"
          onClick={() => {
            handleAuthClick();
            onItemClick && onItemClick();
          }}
          disabled={isButtonDisabled}
          className={cn(
            "rounded-full transition-all duration-300 hover:bg-primary hover:text-primary-foreground",
            isMobile ? "w-full" : ""
          )}
        >
          {isButtonDisabled ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Login/Signup"
          )}
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
              {userInitial || (
                <img
                  src="account.png"
                  alt="User"
                  width={40}
                  height={40}
                  className="rounded-full object-cover border border-gray-200 dark:border-gray-600"
                />
              )}
            </AvatarFallback>
          </Avatar>
          {isMobile && <span>Profile</span>}
        </Button>
      )}
    </div>
  );
};

export default AuthSection;