
import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const NotificationBell: React.FC = () => {
  const { toast } = useToast();
  const [hasNotifications, setHasNotifications] = useState(true);
  
  const handleClick = () => {
    toast({
      title: "Notifications",
      description: "No new notifications at this time.",
    });
    
    // Clear notification indicator
    setHasNotifications(false);
  };
  
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
