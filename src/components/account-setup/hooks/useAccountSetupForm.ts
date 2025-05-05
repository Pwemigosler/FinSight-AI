
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useAvatar } from "@/contexts/AvatarContext";
import { User } from "@/types/user";

export const useAccountSetupForm = () => {
  const { user, updateUserProfile, completeAccountSetup } = useAuth();
  const { characterId, setCharacterId } = useAvatar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    avatar: user?.avatar || "",
    currency: user?.preferences?.currencyFormat || "usd",
    language: user?.preferences?.language || "en",
    emailNotifications: user?.preferences?.emailNotifications !== false,
    appNotifications: user?.preferences?.appNotifications !== false,
    assistantCharacter: user?.preferences?.assistantCharacter || characterId || "fin"
  });

  // Update local state when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || "",
        avatar: user.avatar || "",
        currency: user.preferences?.currencyFormat || "usd",
        language: user.preferences?.language || "en",
        emailNotifications: user.preferences?.emailNotifications !== false,
        appNotifications: user.preferences?.appNotifications !== false,
        assistantCharacter: user.preferences?.assistantCharacter || characterId || "fin"
      }));
    }
  }, [user, characterId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCharacterSelect = (characterId: string) => {
    setFormData(prev => ({
      ...prev,
      assistantCharacter: characterId
    }));
    setCharacterId(characterId);
  };

  const completeSetup = async (avatarHandler: any): Promise<boolean> => {
    setLoading(true);
    try {
      // Prepare the final user data with all fields and preferences
      const finalUserData: Partial<User> = {
        name: formData.fullName,
        preferences: {
          currencyFormat: formData.currency,
          language: formData.language,
          emailNotifications: formData.emailNotifications,
          appNotifications: formData.appNotifications,
          assistantCharacter: formData.assistantCharacter,
        },
        // We'll set this flag separately after profile update succeeds
        // Do not set hasCompletedSetup here to avoid race conditions
      };
      
      // Add avatar data if it was uploaded or modified
      if (avatarHandler.avatarModified && avatarHandler.previewImage) {
        finalUserData.avatar = avatarHandler.previewImage;
      }
      
      // Add avatar settings if either the avatar was modified or its position/zoom was adjusted
      if ((avatarHandler.avatarModified || avatarHandler.avatarAdjusted) && avatarHandler.previewImage) {
        finalUserData.avatarSettings = {
          zoom: avatarHandler.zoomLevel,
          position: avatarHandler.imagePosition
        };
      }
      
      console.log("[AccountSetup] Saving profile data:", 
        "Name:", finalUserData.name,
        "Has avatar:", !!finalUserData.avatar,
        "Avatar length:", finalUserData.avatar?.length || 0);
      
      // First update the user profile with all data
      await updateUserProfile(finalUserData);

      // Wait a moment to ensure the data is saved in localStorage
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Set the character in avatar context
      setCharacterId(formData.assistantCharacter);
      
      // Mark setup as complete with separate call to ensure the most recent data is used
      await completeAccountSetup();
      
      return true;
    } catch (error) {
      console.error("[AccountSetup] Error completing setup:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    handleInputChange,
    handleCharacterSelect,
    completeSetup
  };
};
