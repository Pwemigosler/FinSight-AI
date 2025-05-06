
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * Hook to manage profile form state and actions
 * 
 * @returns Form state and handlers for profile information
 */
export const useProfileForm = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
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
      toast("Name cannot be empty");
      return;
    }
    
    updateUserProfile({
      name: profileName,
      email: profileEmail,
    });
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form state
    setProfileName(user?.name || "");
    setProfileEmail(user?.email || "");
    setIsEditing(false);
    
    // Navigate back to the home page
    navigate('/');
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
