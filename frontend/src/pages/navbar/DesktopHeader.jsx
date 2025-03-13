import React from "react";
import { Bell } from "lucide-react";
import LogoSection from "./LogoSection";
import NavigationItems from "./NavigationItems";
import ActionButtons from "./ActionButtons";
import WantlistButton from "../WantlistButton";
import NotificationBell from "../notification/Notification";
import ThemeToggle from "./ThemeToggle";
import AuthSection from "./AuthSection";

const DesktopHeader = ({
  logo,
  handleLogoClick,
  handleSearch,
  handleSort,
  handleChat,
  handlePostDeal,
  handleWishlist,
  handleWantlist,
  theme,
  toggleTheme,
  isAuthenticated,
  handleAuthClick,
  handleProfile,
  isLoading,
  currentSort,
  currentSearch
}) => {
  return (
    <div className="hidden lg:flex items-center justify-between h-16">
      {/* Left side: Logo and Navigation */}
      <div className="flex items-center gap-3 md:gap-5 lg:gap-8">
        <LogoSection logo={logo} handleLogoClick={handleLogoClick} />
        <NavigationItems 
          handleSearch={handleSearch}
          handleSort={handleSort}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          currentSearch={currentSearch}
          currentSort={currentSort}
        />
      </div>
      
      {/* Right side: Action buttons, Wantlist, and Auth */}
      <div className="flex items-center gap-2 md:gap-3 lg:gap-5">
      <WantlistButton 
          onClick={handleWantlist}
          className="px-2 py-1.5 md:px-4 md:py-2 lg:px-6 lg:py-2.5 font-medium shadow-sm text-sm md:text-base"
        />
        <ActionButtons 
          handleChat={handleChat}
          handlePostDeal={handlePostDeal}
          handleWishlist={handleWishlist}
        />
        <NotificationBell>
          <div className="relative cursor-pointer">
            <Bell className="h-5 w-5" />
          </div>
        </NotificationBell>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        <AuthSection 
          isAuthenticated={isAuthenticated}
          handleAuthClick={handleAuthClick}
          handleProfile={handleProfile}
        />
      </div>
    </div>
  );
};

export default DesktopHeader;