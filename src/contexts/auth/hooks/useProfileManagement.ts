
import { useState } from "react";
import { User } from "../../../types/user";
import { UserService } from "../UserService";

type UseProfileManagementProps = {
  user: User | null;
  lastUpdateTime: number;
  setLastUpdateTime: (time: number) => void;
};

type UseProfileManagementResult = {
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  completeAccountSetup: () => Promise<void>;
};

export const useProfileManagement = ({
  user,
  lastUpdateTime,
  setLastUpdateTime
}: UseProfileManagementProps): UseProfileManagementResult => {
  const userService = new UserService();

  // User profile management
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
      console.log("[AuthContext] Setting updated user to state:", 
        "Name:", updatedUser.name,
        "Has avatar:", !!updatedUser.avatar,
        "Avatar length:", updatedUser.avatar?.length || 0);
      
      // Dispatch event for avatar update to notify all components
      if (updates.avatar !== undefined) {
        console.log("[AuthContext] Avatar updated, dispatching avatar-updated event");
        window.dispatchEvent(new CustomEvent('avatar-updated', { 
          detail: { 
            avatarData: updatedUser.avatar, 
            timestamp: updateTimeStamp,
            source: 'profile-update'
          }
        }));
        
        // Dispatch a second time after a short delay to ensure UI components catch it
        // This helps components that might have missed the first event due to timing
        setTimeout(() => {
          console.log("[AuthContext] Sending delayed avatar-updated event");
          window.dispatchEvent(new CustomEvent('avatar-updated', { 
            detail: { 
              avatarData: updatedUser.avatar, 
              timestamp: updateTimeStamp + 1, 
              source: 'profile-update-delayed'
            }
          }));
        }, 300);
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
      console.log("[AuthContext] Setting completed setup user to state:", 
        "Name:", updatedUser.name,
        "Has avatar:", !!updatedUser.avatar,
        "Avatar length:", updatedUser.avatar?.length || 0,
        "Has completed setup:", updatedUser.hasCompletedSetup);
      
      // Always dispatch avatar update event when account setup completes
      // This ensures the header and other components show the avatar immediately
      if (updatedUser.avatar) {
        console.log("[AuthContext] Dispatching avatar-updated event after setup completion");
        window.dispatchEvent(new CustomEvent('avatar-updated', { 
          detail: { 
            avatarData: updatedUser.avatar, 
            timestamp: updateTimeStamp,
            source: 'setup-completion'
          }
        }));
        
        // Send another event after a delay to catch any components that missed the first one
        setTimeout(() => {
          console.log("[AuthContext] Sending delayed avatar-updated event after setup completion");
          window.dispatchEvent(new CustomEvent('avatar-updated', { 
            detail: { 
              avatarData: updatedUser.avatar, 
              timestamp: updateTimeStamp + 1,
              source: 'setup-completion-delayed'
            }
          }));
        }, 300);
      }
    } else if (!updatedUser) {
      console.error("[AuthContext] Failed to complete account setup");
    } else {
      console.log("[AuthContext] Skipped stale user update");
    }
  };

  return {
    updateUserProfile,
    completeAccountSetup
  };
};
