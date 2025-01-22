import React, { useState, useEffect } from "react";
import { MessageCircle, RefreshCw, Heart, ShoppingCart, Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API_BASE_URL } from "../Api/api";

// Separate component for notification content
const NotificationContent = ({ notifications, error }) => {
  const getNotificationIcon = (type) => {
    // Convert numeric type to string for icon mapping
    const typeMap = {
      1: 'chat',
      2: 'update',
      3: 'wantlist',
      4: 'deal'
    };
    const mappedType = typeMap[type] || 'default';

    switch (mappedType) {
      case 'chat':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'update':
        return <RefreshCw className="w-4 h-4 text-green-500" />;
      case 'wantlist':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'deal':
        return <ShoppingCart className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatNotification = (notification) => {
    return notification.message || `New notification: ${notification.title}`;
  };

  return (
    <PopoverContent className="w-80 p-0">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Notifications</h2>
        <span className="text-xs text-gray-500">
          {notifications.filter(n => !n.is_read).length} new
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
                key={notification.notification_id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-sm">
                      {formatNotification(notification)}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
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
        console.log(data);
        setNotifications(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchNotifications();

    // Optional: Set up polling for new notifications
    const pollInterval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
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

      // Update local state to mark notification as read
      setNotifications(notifications.map(n => 
        n.notification_id === notificationId 
          ? { ...n, is_read: true }
          : n
      ));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          {children}
          {notifications.filter(n => !n.is_read).length > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifications.filter(n => !n.is_read).length}
            </div>
          )}
        </div>
      </PopoverTrigger>
      <NotificationContent 
        notifications={notifications} 
        error={error} 
      />
    </Popover>
  );
};

export default NotificationBell;