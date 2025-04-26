
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    monthlyReport: true,
    newFeatures: true
  });

  const handleNotificationChange = (key: string, checked: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Configure how and when you want to be notified.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive important updates via email
              </p>
            </div>
            <Switch 
              id="email-notifications" 
              checked={notifications.email}
              onCheckedChange={(checked) => 
                handleNotificationChange('email', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts on your device
              </p>
            </div>
            <Switch 
              id="push-notifications" 
              checked={notifications.push}
              onCheckedChange={(checked) => 
                handleNotificationChange('push', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="monthly-report">Monthly Report</Label>
              <p className="text-sm text-muted-foreground">
                Receive a monthly summary of your financial activity
              </p>
            </div>
            <Switch 
              id="monthly-report" 
              checked={notifications.monthlyReport}
              onCheckedChange={(checked) => 
                handleNotificationChange('monthlyReport', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new-features">New Features</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new features and improvements
              </p>
            </div>
            <Switch 
              id="new-features" 
              checked={notifications.newFeatures}
              onCheckedChange={(checked) => 
                handleNotificationChange('newFeatures', checked)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
