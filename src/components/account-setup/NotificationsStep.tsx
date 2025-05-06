
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface NotificationsStepProps {
  emailNotifications: boolean;
  appNotifications: boolean;
  onInputChange: (field: string, value: boolean) => void;
}

export const NotificationsStep: React.FC<NotificationsStepProps> = ({ 
  emailNotifications, 
  appNotifications, 
  onInputChange 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="emailNotifications">Email Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Receive important updates via email
          </p>
        </div>
        <Switch
          id="emailNotifications"
          name="emailNotifications"
          checked={emailNotifications}
          onCheckedChange={(checked) => onInputChange("emailNotifications", checked)}
          className="data-[state=checked]:bg-finsight-blue"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="appNotifications">App Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Receive alerts in the app
          </p>
        </div>
        <Switch
          id="appNotifications"
          name="appNotifications"
          checked={appNotifications}
          onCheckedChange={(checked) => onInputChange("appNotifications", checked)}
          className="data-[state=checked]:bg-finsight-blue"
        />
      </div>
    </div>
  );
};

export default NotificationsStep;
