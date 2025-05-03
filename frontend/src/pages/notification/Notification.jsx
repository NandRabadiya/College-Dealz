import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  MessageCircle,
  RefreshCw,
  Bell,
  ClipboardCheck,
  ClipboardListIcon,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "../Api/api";
import WantlistDialog from "./WantlistDialog";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";


// Enum constants for reference types
const REFERENCE_TYPES = {
  WANTLIST: 0,
  PRODUCT: 1,
  WISHLIST_ITEM: 2,
};

// Loading skeleton component
const NotificationSkeleton = () => (
  <div className="divide-y dark:divide-gray-700">
    {[1, 2, 3].map((item) => (
      <div key={item} className="p-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Separate component for notification content
const NotificationContent = ({
  notifications,
  error,
  onNotificationClick,
  loading,
  isMobile,
}) => {
  const [processingId, setProcessingId] = useState(null);

  // Define the function inside NotificationContent
  const getNotificationIcon = useCallback((type) => {
    switch (type) {
      case "CHAT":
        return (
          <MessageCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        );
      case "UPDATE":
        return (
          <RefreshCw className="w-4 h-4 text-green-500 dark:text-green-400" />
        );
      case "WANTLIST_ITEM":
        return (
          <ClipboardListIcon className="w-4 h-4 text-red-500 dark:text-red-400" />
        );
      case "PRODUCT_ITEM":
        return (
          <ClipboardCheck className="w-4 h-4 text-purple-500 dark:text-purple-400" />
        );
      default:
        return <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
    }
  }, []);

  const notificationList = useMemo(() => {
    if (loading) {
      return <NotificationSkeleton />;
    }

    if (error) {
      return (
        <p className="text-red-500 dark:text-red-400 text-center py-6 text-sm">
          {error}
        </p>
      );
    }

    if (notifications.length === 0) {
      return (
        <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-sm">
          No notifications yet
        </p>
      );
    }

    return (
      <div className="divide-y dark:divide-gray-700">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
              !notification.isRead ? "bg-blue-50 dark:bg-blue-900/30" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setProcessingId(notification.id);
              onNotificationClick(notification).finally(() => {
                setProcessingId(null);
              });
            }}
          >
            <div className="flex gap-2">
              <div className="mt-0.5 flex-shrink-0">
                {getNotificationIcon(notification.referenceType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate dark:text-gray-100">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {notification.message}
                </p>
              </div>
            </div>
            {processingId === notification.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent text-blue-600 dark:text-blue-400"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }, [notifications, error, loading, getNotificationIcon, onNotificationClick, processingId]);

  const header = (
    <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
      <h2 className="font-semibold text-sm dark:text-gray-100">
        Notifications
      </h2>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {notifications.filter((n) => !n.isRead).length} new
      </span>
    </div>
  );

  // For mobile sheet view
  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-2 flex flex-row items-center justify-between border-b dark:border-gray-700">
          <SheetTitle className="text-left">Notifications</SheetTitle>
          <div className="flex items-center space-x-4 pt-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {notifications.filter((n) => !n.isRead).length} new
            </span>
          </div>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="relative">
            {notificationList}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // For desktop popover view
  return (
    <PopoverContent
      className="p-0 w-80 max-h-[80vh] max-w-[calc(100vw-24px)] z-[999] bg-white dark:bg-gray-900 shadow-lg border dark:border-gray-700 pointer-events-auto"
      sideOffset={10}
      align="end"
      alignOffset={-5}
      avoidCollisions={true}
      side="bottom"
      sticky="always"
      onClick={(e) => e.stopPropagation()} // Prevent background click issue
    >
      {header}
      <ScrollArea className="h-[300px] max-h-[calc(80vh-48px)]">
        <div className="relative">
          {notificationList}
        </div>
      </ScrollArea>
    </PopoverContent>
  );
};

// Main component that handles state and logic
const NotificationBell = ({ children, className = "", isMobile = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [wantlistData, setWantlistData] = useState(null);
  const [showWantlistDialog, setShowWantlistDialog] = useState(false);
  const navigate = useNavigate();
  const [wantlistLoading, setWantlistLoading] = useState(false);
   const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
 
  // Add this effect to redirect if not authenticated


  const handleOpenChange = useCallback((open) => {
    if (open && !isAuthenticated) {
      navigate("/authenticate");
      return;
    }
    setIsOpen(open);
  }, [isAuthenticated, navigate]);

  const fetchNotifications = useCallback(async () => {
  
    try {
      setLoading(true);
      const token = localStorage.getItem("jwt");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/api/notifications/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token && isAuthenticated) {
    fetchNotifications();
      
      // Poll for new notifications
      const pollInterval = setInterval(fetchNotifications, 300000); // 5 minutes
      
      return () => {
        clearInterval(pollInterval);
      };
    }
  }, [fetchNotifications, isAuthenticated]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/mark-as-read/${notificationId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  const fetchWantlistData = useCallback(async (referenceId) => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(
        `${API_BASE_URL}/api/wantlist/${referenceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch wantlist data");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError("Failed to load wantlist details");
      return null;
    }
  }, []);

  const handleNotificationClick = useCallback(

   
    async (notification) => {
      if (!isAuthenticated) {
        navigate("/authenticate");
        return Promise.resolve();
      }
      // Mark notification as read (fixed this line to ensure it runs)
      await markAsRead(notification.id);

      // Delay closing the popover to prevent blinking effect
      setTimeout(() => {
        setIsOpen(false);
      }, 300); // Short delay to allow user to see the loading indicator

      // Handle different reference types
      if (notification.referenceType === "WANTLIST_ITEM") {
        setWantlistLoading(true);
        setShowWantlistDialog(true); // Show dialog immediately with loading state
        setWantlistData(null); // Reset previous data

        const data = await fetchWantlistData(notification.referenceId);
        if (data) {
          setWantlistData(data);
        }
        setWantlistLoading(false);
      } else if (notification.referenceType === "PRODUCT_ITEM") {
        // Redirect to product page
        navigate(`/product/${notification.referenceId}`);
      }

      // Return a promise to ensure loading state is handled properly
      return Promise.resolve();
    },
    [markAsRead, fetchWantlistData, navigate, isAuthenticated]
  );

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Create a mobile-friendly version using Sheet component
  if (isMobile) {
    return (
      <>
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>
            <div className="w-full flex justify-start items-center space-x-2 cursor-pointer">
              <Bell className="h-5 w-5 dark:text-gray-300" />
              <span className="ml-2 dark:text-gray-300">Notifications</span>
              {unreadCount > 0 && (
                <div className="bg-red-500 dark:bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </div>
              )}
            </div>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] p-0">
            <NotificationContent
              notifications={notifications}
              error={error}
              loading={loading}
              onNotificationClick={handleNotificationClick}
              isMobile={true}
            />
          </SheetContent>
        </Sheet>

        {/* Wantlist Dialog */}
        <WantlistDialog
          isOpen={showWantlistDialog}
          onClose={() => setShowWantlistDialog(false)}
          wantlistData={wantlistData}
          isLoading={wantlistLoading}
        />
      </>
    );
  }

  // Desktop version with popover
  return (
    <>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div
            className={`relative inline-flex items-center justify-center cursor-pointer ${className}`}
          >
            {children || <Bell className="h-5 w-5 dark:text-gray-300" />}
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 dark:bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </div>
            )}
          </div>
        </PopoverTrigger>
        <NotificationContent
          notifications={notifications}
          error={error}
          loading={loading}
          onNotificationClick={handleNotificationClick}
          isMobile={false}
        />
      </Popover>

      {/* Wantlist Dialog */}
      <WantlistDialog
        isOpen={showWantlistDialog}
        onClose={() => setShowWantlistDialog(false)}
        wantlistData={wantlistData}
        isLoading={wantlistLoading}
      />
    </>
  );
};

export default NotificationBell;