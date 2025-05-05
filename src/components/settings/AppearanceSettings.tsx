
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilLine, Sun } from "lucide-react";

export const AppearanceSettings = () => {
  const [appearance, setAppearance] = useState({
    darkMode: false,
    compactView: false
  });

  const handleAppearanceChange = (key: string, checked: boolean) => {
    setAppearance(prev => ({
      ...prev,
      [key]: checked
    }));
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
