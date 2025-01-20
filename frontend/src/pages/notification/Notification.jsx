import React, { useState, useEffect } from "react";
import { MessageCircle, RefreshCw, Heart, ShoppingCart, Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

// Separate component for notification content
const NotificationContent = ({ notifications, error }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
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
    return `New item #${notification.itemId} added by User #${notification.addedByUserId}`;
  };

  return (
    <PopoverContent className="w-80 p-0">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Notifications</h2>
        <span className="text-xs text-gray-500">
          {notifications.length} new
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
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      {formatNotification(notification)}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(notification.createdAt).toLocaleString()}
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
    // Dummy data for testing
    const dummyNotifications = [
      {
        id: 1,
        itemId: 101,
        addedByUserId: 201,
        type: 'chat',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      },
      {
        id: 2,
        itemId: 102,
        addedByUserId: 202,
        type: 'update',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      },
      {
        id: 3,
        itemId: 103,
        addedByUserId: 203,
        type: 'wantlist',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
    ];

    // Uncomment this when ready to connect to backend
    /*
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('jwt');
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch('/api/notifications', {
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
    */

    setNotifications(dummyNotifications);
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <NotificationContent notifications={notifications} error={error} />
    </Popover>
  );
};

export default NotificationBell;