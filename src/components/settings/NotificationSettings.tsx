
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export const NotificationSettings = () => {
  const { user, updateUserProfile } = useAuth();
  
  // Initialize state from user preferences with fallbacks
  const [notifications, setNotifications] = useState({
    email: user?.preferences?.emailNotifications !== false, // Default to true if undefined
    push: user?.preferences?.appNotifications !== false, // Default to true if undefined
    monthlyReport: true,
    newFeatures: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update local state when user preferences change
  useEffect(() => {
    if (user?.preferences) {
      setNotifications(prev => ({
        ...prev,
        email: user.preferences?.emailNotifications !== false,
        push: user.preferences?.appNotifications !== false
      }));
    }
  }, [user?.preferences]);

  const handleNotificationChange = async (key: string, checked: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: checked
    }));
    
    // Only persist email and push notification settings to user preferences
    if (key === 'email' || key === 'push') {
      setIsSubmitting(true);
      try {
        const updatedPreferences = {
          ...user?.preferences,
          emailNotifications: key === 'email' ? checked : user?.preferences?.emailNotifications,
          appNotifications: key === 'push' ? checked : user?.preferences?.appNotifications
        };
        
        await updateUserProfile({
          preferences: updatedPreferences
        });
        
        toast("Notification settings updated", {
          description: `${key === 'email' ? 'Email' : 'Push'} notifications ${checked ? 'enabled' : 'disabled'}.`
        });
      } catch (error) {
        console.error("Failed to save notification preferences:", error);
        toast("Failed to save settings", {
          description: "Please try again later."
        });
        
        // Revert the local state on error
        setNotifications(prev => ({
          ...prev,
          [key]: key === 'email' 
            ? user?.preferences?.emailNotifications !== false 
            : user?.preferences?.appNotifications !== false
        }));
      } finally {
        setIsSubmitting(false);
      }
    }
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
