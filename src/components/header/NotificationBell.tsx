
import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNotificationPreferences } from "@/contexts/notifications/NotificationPreferencesContext";

const NotificationBell: React.FC = () => {
  const { toast } = useToast();
  const [hasNotifications, setHasNotifications] = useState(true);
  const { preferences } = useNotificationPreferences();
  
  const handleClick = () => {
    if (preferences.push) {
      toast({
        title: "Notifications",
        description: "No new notifications at this time.",
      });
    } else {
      toast({
        title: "Notifications Disabled",
        description: "Enable push notifications in Settings to receive alerts.",
      });
    }
    
    // Clear notification indicator
    setHasNotifications(false);
  };
  
  // Re-show notification indicator after some time
  useEffect(() => {
    if (!hasNotifications) {
      const timer = setTimeout(() => {
        setHasNotifications(true);
      }, 30000); // Show again after 30 seconds
      return () => clearTimeout(timer);
    }
  }, [hasNotifications]);
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative"
      onClick={handleClick}
    >
      <Bell className="h-5 w-5" />
      {hasNotifications && (
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-finsight-red"></span>
      )}
    </Button>
  );
};

export default NotificationBell;
