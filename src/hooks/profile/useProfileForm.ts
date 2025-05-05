
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to manage profile form state and actions
 * 
 * @returns Form state and handlers for profile information
 */
export const useProfileForm = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");

  // Update form state when user changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
    }
  }, [user]);

  const handleSave = () => {
    if (!profileName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    updateUserProfile({
      name: profileName,
      email: profileEmail,
    });
    
    toast({
      title: "Success",
      description: "Profile information updated successfully"
    });
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileName(user?.name || "");
    setProfileEmail(user?.email || "");
    setIsEditing(false);
  };

  return {
    isEditing,
    setIsEditing,
    profileName,
    setProfileName,
    profileEmail,
    setProfileEmail,
    handleSave,
    handleCancel
  };
};

export default useProfileForm;
