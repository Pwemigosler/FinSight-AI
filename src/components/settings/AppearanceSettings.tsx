
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilLine, Sun, Save } from "lucide-react";
import { useTheme } from "@/contexts/theme/ThemeContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const AppearanceSettings = () => {
  const { isDarkMode, isCompactView, toggleDarkMode, toggleCompactView } = useTheme();
  const { toast } = useToast();
  
  const [appearance, setAppearance] = useState({
    darkMode: isDarkMode,
    compactView: isCompactView
  });

  // Update local state when context values change
  useEffect(() => {
    setAppearance({
      darkMode: isDarkMode,
      compactView: isCompactView
    });
  }, [isDarkMode, isCompactView]);

  const handleAppearanceChange = (key: string, checked: boolean) => {
    setAppearance(prev => ({
      ...prev,
      [key]: checked
    }));
    
    if (key === 'darkMode') {
      toggleDarkMode();
    } else if (key === 'compactView') {
      toggleCompactView();
    }
    
    toast({
      title: "Settings Updated",
      description: `${key === 'darkMode' ? 'Dark mode' : 'Compact view'} has been ${checked ? 'enabled' : 'disabled'}.`
    });
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
              <Sun className="h-5 w-5 text-ptcustom-yellow" />
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
