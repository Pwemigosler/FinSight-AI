
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Mail, BarChart2, Megaphone, Save } from "lucide-react";
import { useNotificationPreferences } from "@/contexts/notifications/NotificationPreferencesContext";

export const NotificationSettings = () => {
  const { preferences, updatePreference, savePreferences } = useNotificationPreferences();
  
  const handleNotificationChange = (key: keyof typeof preferences, checked: boolean) => {
    updatePreference(key, checked);
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
            <div className="space-y-0.5 flex items-center gap-2">
              <Mail className="h-5 w-5 text-ptcustom-blue" />
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important updates via email
                </p>
              </div>
            </div>
            <Switch 
              id="email-notifications" 
              checked={preferences.email}
              onCheckedChange={(checked) => 
                handleNotificationChange('email', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-2">
              <Bell className="h-5 w-5 text-ptcustom-orange" />
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts on your device
                </p>
              </div>
            </div>
            <Switch 
              id="push-notifications" 
              checked={preferences.push}
              onCheckedChange={(checked) => 
                handleNotificationChange('push', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-ptcustom-green" />
              <div>
                <Label htmlFor="monthly-report">Monthly Report</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a monthly summary of your financial activity
                </p>
              </div>
            </div>
            <Switch 
              id="monthly-report" 
              checked={preferences.monthlyReport}
              onCheckedChange={(checked) => 
                handleNotificationChange('monthlyReport', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-ptcustom-purple" />
              <div>
                <Label htmlFor="new-features">New Features</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about new features and improvements
                </p>
              </div>
            </div>
            <Switch 
              id="new-features" 
              checked={preferences.newFeatures}
              onCheckedChange={(checked) => 
                handleNotificationChange('newFeatures', checked)
              }
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={savePreferences} className="ml-auto">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};
