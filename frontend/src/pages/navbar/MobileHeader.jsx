import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import LogoSection from "./LogoSection";
import WantlistButton from "./WantlistButton";
import ThemeToggle from "./ThemeToggle";
import AuthSection from "./AuthSection";
import ActionButtons from "./ActionButtons";

const MobileHeader = ({
  isSidebarOpen,
  setIsSidebarOpen,
  logo,
  handleLogoClick,
  handleWantlist,
  theme,
  toggleTheme,
  isAuthenticated,
  handleAuthClick,
  handleProfile,
  handleChat,
  handlePostDeal,
  handleWishlist
}) => {
  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between h-16 px-2 sm:px-3 md:px-4">
        {/* Left side: Menu button and Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full h-8 w-8 md:h-9 md:w-9"
              >
                <Menu className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px] md:w-[400px] p-4 sm:p-5 md:p-6">
              <div className="flex flex-col space-y-5 mt-5 md:mt-6">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-12 md:h-14 mx-auto cursor-pointer"
                  onClick={handleLogoClick}
                />
                <div className="space-y-4 mt-5 md:mt-6">
                  <ActionButtons
                    isMobile
                    onItemClick={() => setIsSidebarOpen(false)}
                    handleChat={handleChat}
                    handlePostDeal={handlePostDeal}
                    handleWishlist={handleWishlist}
                    handleWantlist={handleWantlist}
                  />
                  
                  <div className="pt-2">
                    <Label className="text-xs text-muted-foreground">Account</Label>
                    <div className="mt-2">
                      <AuthSection
                        isMobile
                        onItemClick={() => setIsSidebarOpen(false)}
                        isAuthenticated={isAuthenticated}
                        handleAuthClick={handleAuthClick}
                        handleProfile={handleProfile}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <LogoSection logo={logo} handleLogoClick={handleLogoClick} className="flex-shrink-0" />
        </div>
        
        {/* Right side: Wantlist, Theme, and Profile */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
          <WantlistButton 
            onClick={handleWantlist} 
            className="px-2 py-1.5 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-xs sm:text-sm md:text-base"
          />
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <AuthSection 
            isAuthenticated={isAuthenticated}
            handleAuthClick={handleAuthClick}
            handleProfile={handleProfile}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
