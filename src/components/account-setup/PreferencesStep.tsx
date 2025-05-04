
import React from "react";
import { Label } from "@/components/ui/label";

interface PreferencesStepProps {
  currency: string;
  language: string;
  onInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const PreferencesStep: React.FC<PreferencesStepProps> = ({ 
  currency, 
  language, 
  onInputChange 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="currency">Preferred Currency</Label>
        <select
          id="currency"
          name="currency"
          value={currency}
          onChange={onInputChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
        >
          <option value="usd">USD - US Dollar</option>
          <option value="eur">EUR - Euro</option>
          <option value="gbp">GBP - British Pound</option>
          <option value="jpy">JPY - Japanese Yen</option>
        </select>
      </div>
      <div>
        <Label htmlFor="language">Preferred Language</Label>
        <select
          id="language"
          name="language"
          value={language}
          onChange={onInputChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>
    </div>
  );
};

export default PreferencesStep;
