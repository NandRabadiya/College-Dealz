import React, { useState, useEffect } from "react";
import { MessageCircle, RefreshCw, Bell, ClipboardCheck, ClipboardListIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_BASE_URL } from "../Api/api";
import WantlistDialog from "./WantlistDialog";
import { useNavigate } from "react-router-dom";

// Enum constants for reference types
const REFERENCE_TYPES = {
  WANTLIST: 0,
  PRODUCT: 1,
  WISHLIST_ITEM: 2
};

// Separate component for notification content
const NotificationContent = ({ notifications, error, onNotificationClick }) => {
  // Define the function inside NotificationContent
  const getNotificationIcon = (type) => {
    switch (type) {
      case "CHAT":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "UPDATE":
        return <RefreshCw className="w-4 h-4 text-green-500" />;
      case "WANTLIST_ITEM":
        return <ClipboardListIcon className="w-4 h-4 text-red-500" />;
      case "PRODUCT_ITEM":
        return <ClipboardCheck className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <PopoverContent 
      className="p-0 w-80 max-h-[80vh] max-w-[calc(100vw-24px)] z-[999] bg-white shadow-lg border pointer-events-auto"
      sideOffset={10}
      align="end"
      alignOffset={-5}
      avoidCollisions={true}
      side="bottom"
      sticky="always"
      onClick={(e) => e.stopPropagation()} // Prevent background click issue
    >
      <div className="flex items-center justify-between p-3 border-b">
        <h2 className="font-semibold text-sm">Notifications</h2>
        <span className="text-xs text-gray-500">
          {notifications.filter(n => !n.isRead).length} new
        </span>
      </div>
      <ScrollArea className="h-[300px] max-h-[calc(80vh-48px)]">
        {error ? (
          <p className="text-red-500 text-center py-6 text-sm">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-6 text-sm">No notifications yet</p>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent background click
                  onNotificationClick(notification);
                }}
              >
                <div className="flex gap-2">
                  <div className="mt-0.5 flex-shrink-0">
                    {getNotificationIcon(notification.referenceType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notification.title}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{notification.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </PopoverContent>
  );
};



// Main component that handles state and logic
const NotificationBell = ({ children, className = "", isMobile = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [wantlistData, setWantlistData] = useState(null);
  const [showWantlistDialog, setShowWantlistDialog] = useState(false);
  const navigate = useNavigate();

  const handleOpenChange = (open) => {
    if (open) {
      setIsOpen(true); // Open on click
    }
  };
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('jwt');
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_BASE_URL}/api/notifications/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        setNotifications(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchNotifications();

    // Poll for new notifications
    const pollInterval = setInterval(fetchNotifications, 300000); // 5 minutes

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('jwt');
      await fetch(`${API_BASE_URL}/api/notifications/mark-as-read/${notificationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const fetchWantlistData = async (referenceId) => {
    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${API_BASE_URL}/api/wantlist/${referenceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch wantlist data");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError("Failed to load wantlist details");
      return null;
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark notification as read
   // await markAsRead(notification.id);
    // Delay closing the popover to prevent blinking effect
    setIsOpen(false);
    
    // Handle different reference types
    if (notification.referenceType === "WANTLIST_ITEM") {
      const data = await fetchWantlistData(notification.referenceId);
      if (data) {
        setWantlistData(data);
        setShowWantlistDialog(true);
      }
    } else if (notification.referenceType === "PRODUCT_ITEM") {
      // Redirect to product page
      navigate(`/product/${notification.referenceId}`);
    }
  };

  // Create a mobile-friendly version of the component
  if (isMobile) {
    return (
      <>
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <div className="w-full flex justify-start items-center space-x-2 cursor-pointer">
              <Bell className="h-5 w-5" />
              <span className="ml-2">Notifications</span>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.filter(n => !n.isRead).length}
                </div>
              )}
            </div>
          </PopoverTrigger>
          <NotificationContent 
            notifications={notifications} 
            error={error}
            onNotificationClick={handleNotificationClick}
          />
        </Popover>
        
        {/* Wantlist Dialog */}
        <WantlistDialog 
          isOpen={showWantlistDialog}
          onClose={() => setShowWantlistDialog(false)}
          wantlistData={wantlistData}
        />
      </>
    );
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className={`relative inline-flex items-center justify-center cursor-pointer ${className}`}>
            {children || <Bell className="h-5 w-5" />}
            {notifications.filter(n => !n.isRead).length > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.filter(n => !n.isRead).length}
              </div>
            )}
          </div>
        </PopoverTrigger>
        <NotificationContent 
          notifications={notifications} 
          error={error}
          onNotificationClick={handleNotificationClick}
        />
      </Popover>
      
      {/* Wantlist Dialog */}
      <WantlistDialog 
        isOpen={showWantlistDialog}
        onClose={() => setShowWantlistDialog(false)}
        wantlistData={wantlistData}
      />
    </>
  );
};

export default NotificationBell;