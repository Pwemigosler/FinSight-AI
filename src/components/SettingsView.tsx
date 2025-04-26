
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Lock, User, Moon } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { AccountSettings } from "./settings/AccountSettings";
import { NotificationSettings } from "./settings/NotificationSettings";
import { AppearanceSettings } from "./settings/AppearanceSettings";
import { SecuritySettings } from "./settings/SecuritySettings";

const SettingsView = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSaveSettings = () => {
    setIsSubmitting(true);
    
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
            <AccountSettings />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>
          
          <TabsContent value="appearance">
            <AppearanceSettings />
          </TabsContent>
          
          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default SettingsView;
