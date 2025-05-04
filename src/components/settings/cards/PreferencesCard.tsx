
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { User } from "@/types/user";

interface PreferencesCardProps {
  user: User | null;
  isSubmitting: boolean;
  onSave: (formData: { currency: string; language: string }) => void;
}

export const PreferencesCard: React.FC<PreferencesCardProps> = ({ 
  user,
  isSubmitting,
  onSave
}) => {
  const [formData, setFormData] = useState({
    currency: user?.preferences?.currencyFormat || "usd",
    language: user?.preferences?.language || "en"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveChanges = () => {
    onSave(formData);
  };

  return (
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
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.currency}
              onChange={handleInputChange}
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.language}
                onChange={handleInputChange}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveChanges}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
