import React, { useState, useEffect } from "react";
import { MessageCircle, RefreshCw, Heart, ShoppingCart, Bell } from "lucide-react";
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
  WISHLIST_ITEM: 2 // Added WISHLIST_ITEM type
};

// Separate component for notification content
const NotificationContent = ({ notifications, error, onNotificationClick }) => {
  const getNotificationIcon = (type) => {
    console.log('Getting notification icon for:', type);
    switch (type) {
      case "CHAT":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "UPDATE":
        return <RefreshCw className="w-4 h-4 text-green-500" />;
      case "WANTLIST":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "PRODUCT":
        return <ShoppingCart className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  console.log('Rendering NotificationContent with notifications:', notifications);

  return (
    <PopoverContent className="w-80 p-0 md:w-80 lg:w-80 xl:w-80">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Notifications</h2>
        <span className="text-xs text-gray-500">
          {notifications.filter(n => !n.isRead).length} new
        </span>
      </div>
      <ScrollArea className="h-[300px]">
        {error ? (
          <p className="text-red-500 text-center py-8">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notifications yet</p>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
                onClick={() => onNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-sm">{notification.message}</p>
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
const NotificationBell = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [wantlistData, setWantlistData] = useState(null);
  const [showWantlistDialog, setShowWantlistDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Running useEffect to fetch notifications');
    const fetchNotifications = async () => {
      try {
        console.log('Fetching notifications...');
        const token = localStorage.getItem('jwt');
        if (!token) {
          console.error('No authentication token found');
          throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_BASE_URL}/api/notifications/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error('Failed to fetch notifications');
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        console.log('Received notifications:', data);
        setNotifications(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err.message);
      }
    };

    fetchNotifications();

    // Poll for new notifications
    const pollInterval = setInterval(fetchNotifications, 300000); // 5 minutes
    console.log('Set interval for polling notifications');

    return () => {
      console.log('Clearing interval for polling notifications');
      clearInterval(pollInterval);
    };
  }, []);

  const markAsRead = async (notificationId) => {
    console.log('Marking notification as read:', notificationId);
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
    console.log('Fetching wantlist data for reference ID:', referenceId);
    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${API_BASE_URL}/api/wantlist/${referenceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Failed to fetch wantlist data');
        throw new Error("Failed to fetch wantlist data");
      }

      const data = await response.json();
      console.log('Received wantlist data:', data);
      return data;
    } catch (err) {
      console.error('Error fetching wantlist:', err);
      setError("Failed to load wantlist details");
      return null;
    }
  };

  const handleNotificationClick = async (notification) => {
    console.log('Handling notification click:', notification);
    // Mark notification as read
   // await markAsRead(notification.id);
    
    // Close the popover
    setIsOpen(false);
    
    // Handle different reference types based on enum values
    if (notification.referenceType === "WANTLIST_ITEM") {
      console.log('Opening wantlist dialog for WANTLIST');
      const data = await fetchWantlistData(notification.referenceId);
      if (data) {
        setWantlistData(data);
        setShowWantlistDialog(true);
      }
    } else if (notification.referenceType === REFERENCE_TYPES.PRODUCT) {
      // Redirect to product page
      console.log('Redirecting to product page');
      navigate(`$/product/${notification.referenceId}`);}
    
  };

  console.log('Rendering NotificationBell with notifications:', notifications);

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            {children}
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
