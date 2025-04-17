import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Bell, 
  Globe, 
  Lock, 
  User,
  Moon,
  Sun,
  PencilLine,
  Check,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";

const SettingsView = () => {
  // User profile state
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    currency: "usd",
    language: "en"
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    monthlyReport: true,
    newFeatures: true
  });
  
  // Appearance preferences state
  const [appearance, setAppearance] = useState({
    darkMode: false,
    compactView: false
  });

  // Security state
  const [security, setSecurity] = useState({
    twoFactor: false,
    passwordUpdated: false
  });

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle profile field changes
  const handleProfileChange = (e) => {
    const { id, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle notification toggles
  const handleNotificationChange = (key, checked) => {
    setNotifications(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  // Handle appearance toggles
  const handleAppearanceChange = (key, checked) => {
    setAppearance(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  // Handle password change
  const handlePasswordChange = () => {
    setSecurity(prev => ({ ...prev, passwordUpdated: true }));
    toast("Password updated", {
      description: "Your password has been successfully changed."
    });
  };

  // Handle 2FA toggle
  const handle2FAToggle = () => {
    setSecurity(prev => ({ ...prev, twoFactor: !prev.twoFactor }));
    
    if (!security.twoFactor) {
      toast("Two-Factor Authentication Enabled", {
        description: "Your account is now more secure with 2FA."
      });
    } else {
      toast("Two-Factor Authentication Disabled", {
        description: "2FA has been turned off for your account."
      });
    }
  };

  // Handle saving all settings
  const handleSaveSettings = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast("Settings saved", {
        description: "Your preferences have been updated successfully."
      });
    }, 800);
  };

  return (
    <>
      <Header />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-finsight-purple">Settings</h1>
          <Button 
            onClick={handleSaveSettings}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="account">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your account details and personal information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <div className="flex mt-1.5">
                        <input 
                          id="name"
                          value={profile.name}
                          onChange={handleProfileChange}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex mt-1.5">
                        <input 
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={handleProfileChange}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your default currency and regional settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currency">Default Currency</Label>
                      <select 
                        id="currency" 
                        value={profile.currency}
                        onChange={handleProfileChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="usd">USD - US Dollar</option>
                        <option value="eur">EUR - Euro</option>
                        <option value="gbp">GBP - British Pound</option>
                        <option value="jpy">JPY - Japanese Yen</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <div className="flex mt-1.5 items-center gap-2">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <select 
                          id="language" 
                          value={profile.language}
                          onChange={handleProfileChange}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
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
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Customize how the application looks and feels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex items-center gap-2">
                      <Sun className="h-5 w-5 text-orange-500" />
                      <div>
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Switch between light and dark theme
                        </p>
                      </div>
                    </div>
                    <Switch 
                      id="dark-mode" 
                      checked={appearance.darkMode}
                      onCheckedChange={(checked) => 
                        handleAppearanceChange('darkMode', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex items-center gap-2">
                      <PencilLine className="h-5 w-5 text-blue-500" />
                      <div>
                        <Label htmlFor="compact-view">Compact View</Label>
                        <p className="text-sm text-muted-foreground">
                          Show more information in less space
                        </p>
                      </div>
                    </div>
                    <Switch 
                      id="compact-view" 
                      checked={appearance.compactView}
                      onCheckedChange={(checked) => 
                        handleAppearanceChange('compactView', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication options.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Password</Label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="password"
                        value="••••••••••"
                        readOnly
                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
                      />
                      <Button variant="outline" onClick={handlePasswordChange}>Change Password</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Two-Factor Authentication</Label>
                    <Card className="border-dashed">
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <p className="font-medium">Protect your account with 2FA</p>
                            <p className="text-sm text-muted-foreground">
                              Add an extra layer of security by requiring a verification code when you sign in.
                            </p>
                          </div>
                          <Button 
                            variant={security.twoFactor ? "outline" : "secondary"} 
                            onClick={handle2FAToggle}
                          >
                            {security.twoFactor ? "Disable 2FA" : "Enable 2FA"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Session Management</Label>
                    <div className="rounded-md border">
                      <div className="p-4 flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-muted-foreground">
                            Windows • Chrome • Last active now
                          </p>
                        </div>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800 hover:bg-primary/80">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default SettingsView;
