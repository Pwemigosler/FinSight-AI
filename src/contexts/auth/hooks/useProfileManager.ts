
import { useState } from "react";
import { User } from "../../../types/user";
import { UserService } from "../UserService";

export function useProfileManager(
  user: User | null, 
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  userService: UserService
) {
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  
  // Dispatch a single avatar update event
  const dispatchAvatarUpdate = (userData: User, timestamp: number, source: string) => {
    if (userData?.avatar) {
      console.log(`[AuthContext] Dispatching avatar-updated event (source: ${source})`);
      window.dispatchEvent(new CustomEvent('avatar-updated', { 
        detail: { 
          avatarData: userData.avatar, 
          timestamp: timestamp,
          source: source
        }
      }));
    }
  };
  
  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    const updateTimeStamp = Date.now();
    setLastUpdateTime(updateTimeStamp);
    
    console.log("[AuthContext] Updating user profile with:", 
      "Name:", updates.name,
      "Has avatar:", !!updates.avatar,
      "Avatar length:", updates.avatar?.length || 0);
    
    if (!user) {
      console.error("[AuthContext] Cannot update profile: No user logged in");
      return;
    }
    
    const updatedUser = await userService.updateProfile(user, updates);
    
    // Only update state if this is the most recent update request
    if (updateTimeStamp >= lastUpdateTime && updatedUser) {
      setUser(updatedUser);
      
      // Dispatch a single avatar update event if avatar was updated
      if (updates.avatar !== undefined) {
        dispatchAvatarUpdate(updatedUser, updateTimeStamp, 'profile-update');
      }
    } else if (!updatedUser) {
      console.error("[AuthContext] Failed to update user profile");
    } else {
      console.log("[AuthContext] Skipped stale user update");
    }
  };

  const completeAccountSetup = async (): Promise<void> => {
    const updateTimeStamp = Date.now();
    setLastUpdateTime(updateTimeStamp);
    
    console.log("[AuthContext] Completing account setup");
    
    if (!user) {
      console.error("[AuthContext] Cannot complete setup: No user logged in");
      return;
    }
    
    const updatedUser = await userService.completeAccountSetup(user);
    
    // Only update state if this is the most recent update request
    if (updateTimeStamp >= lastUpdateTime && updatedUser) {
      setUser(updatedUser);
      
      // Dispatch avatar update event when account setup completes
      if (updatedUser.avatar) {
        dispatchAvatarUpdate(updatedUser, updateTimeStamp, 'setup-completion');
      }
    } else if (!updatedUser) {
      console.error("[AuthContext] Failed to complete account setup");
    } else {
      console.log("[AuthContext] Skipped stale user update");
    }
  };

  return { updateUserProfile, completeAccountSetup, lastUpdateTime };
}
