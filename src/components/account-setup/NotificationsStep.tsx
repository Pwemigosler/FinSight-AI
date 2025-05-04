
import React from "react";
import { Label } from "@/components/ui/label";

interface NotificationsStepProps {
  emailNotifications: boolean;
  appNotifications: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const NotificationsStep: React.FC<NotificationsStepProps> = ({ 
  emailNotifications, 
  appNotifications, 
  onInputChange 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="emailNotifications"
          name="emailNotifications"
          checked={emailNotifications}
          onChange={onInputChange}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="emailNotifications">Email Notifications</Label>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="appNotifications"
          name="appNotifications"
          checked={appNotifications}
          onChange={onInputChange}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="appNotifications">App Notifications</Label>
      </div>
    </div>
  );
};

export default NotificationsStep;
