import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilLine, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export const AppearanceSettings = () => {
  const { user, updateUserProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // Initialize state from user preferences with fallbacks
  const [appearance, setAppearance] = useState({
    darkMode: user?.preferences?.theme === "dark",
    compactView: user?.preferences?.compactView || false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep UI state in sync with actual theme
  useEffect(() => {
    setAppearance(prev => ({
      ...prev,
      darkMode: theme === "dark"
    }));
  }, [theme]);

  // Handle appearance changes
  const handleAppearanceChange = async (key: string, checked: boolean) => {
    setAppearance(prev => ({
      ...prev,
      [key]: checked
    }));
    
    // Update the theme immediately for instant feedback
    if (key === "darkMode") {
      setTheme(checked ? "dark" : "light");
    }
    
    // Apply compact view class to body if needed
    if (key === "compactView") {
      document.body.classList.toggle("compact-view", checked);
    }
    
    // Save to user preferences
    setIsSubmitting(true);
    try {
      const updatedPreferences = {
        ...user?.preferences,
        theme: key === "darkMode" ? (checked ? "dark" : "light") : user?.preferences?.theme,
        compactView: key === "compactView" ? checked : user?.preferences?.compactView
      };
      
      await updateUserProfile({
        preferences: updatedPreferences
      });
      
      toast("Display settings updated", {
        description: `${key === "darkMode" ? "Theme" : "View mode"} has been changed.`
      });
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast("Failed to save settings", {
        description: "Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
              {appearance.darkMode ? (
                <Moon className="h-5 w-5 text-blue-400" />
              ) : (
                <Sun className="h-5 w-5 text-ptcustom-yellow" />
              )}
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
              disabled={isSubmitting}
              onCheckedChange={(checked) => 
                handleAppearanceChange('darkMode', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex items-center gap-2">
              <PencilLine className="h-5 w-5 text-ptcustom-blue" />
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
              disabled={isSubmitting}
              onCheckedChange={(checked) => 
                handleAppearanceChange('compactView', checked)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
