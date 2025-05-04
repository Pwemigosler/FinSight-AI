
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { PersonalInfoCard } from "./cards/PersonalInfoCard";
import { PreferencesCard } from "./cards/PreferencesCard";

export const AccountSettings = () => {
  const { user, updateUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSavePersonalInfo = async (formData: { name: string; email: string }) => {
    try {
      setIsSubmitting(true);
      
      await updateUserProfile({
        name: formData.name,
        email: formData.email,
      });
      
      toast("Profile information updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast("Failed to update profile information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePreferences = async (formData: { currency: string; language: string }) => {
    try {
      setIsSubmitting(true);
      
      await updateUserProfile({
        preferences: {
          ...user?.preferences,
          currencyFormat: formData.currency,
          language: formData.language
        }
      });
      
      toast("Preferences updated successfully");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast("Failed to update preferences");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6">
      <PersonalInfoCard 
        user={user} 
        isSubmitting={isSubmitting}
        onSave={handleSavePersonalInfo}
      />
      <PreferencesCard 
        user={user} 
        isSubmitting={isSubmitting}
        onSave={handleSavePreferences}
      />
    </div>
  );
};
