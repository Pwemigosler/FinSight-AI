
import { User } from "@/types/user";
import { UserService } from "../UserService";
import { useState, useRef } from "react";

export const useProfileActions = (
  user: User | null, 
  setUser: (user: User | null) => void,
  lastUpdateTime: number,
  setLastUpdateTime: (time: number) => void
) => {
  const userService = useRef(new UserService()).current;

  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    const updateTimeStamp = Date.now();
    setLastUpdateTime(updateTimeStamp);
    
    console.log("[ProfileActions] Updating user profile with:", 
      "Name:", updates.name,
      "Has avatar:", !!updates.avatar,
      "Avatar length:", updates.avatar?.length || 0);
    
    if (!user) {
      console.error("[ProfileActions] Cannot update profile: No user logged in");
      return;
    }
    
    const updatedUser = await userService.updateProfile(user, updates);
    
    // Only update state if this is the most recent update request
    if (updateTimeStamp >= lastUpdateTime && updatedUser) {
      console.log("[ProfileActions] Setting updated user to state:", 
        "Name:", updatedUser.name,
        "Has avatar:", !!updatedUser.avatar,
        "Avatar length:", updatedUser.avatar?.length || 0);
      
      setUser(updatedUser);
      
      // Dispatch event for avatar update to notify all components
      if (updates.avatar !== undefined) {
        console.log("[ProfileActions] Avatar updated, dispatching avatar-updated event");
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
          console.log("[ProfileActions] Sending delayed avatar-updated event");
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
      console.error("[ProfileActions] Failed to update user profile");
    } else {
      console.log("[ProfileActions] Skipped stale user update");
    }
  };

  const completeAccountSetup = async (): Promise<void> => {
    const updateTimeStamp = Date.now();
    setLastUpdateTime(updateTimeStamp);
    
    console.log("[ProfileActions] Completing account setup");
    
    if (!user) {
      console.error("[ProfileActions] Cannot complete setup: No user logged in");
      return;
    }
    
    const updatedUser = await userService.completeAccountSetup(user);
    
    // Only update state if this is the most recent update request
    if (updateTimeStamp >= lastUpdateTime && updatedUser) {
      console.log("[ProfileActions] Setting completed setup user to state:", 
        "Name:", updatedUser.name,
        "Has avatar:", !!updatedUser.avatar,
        "Avatar length:", updatedUser.avatar?.length || 0,
        "Has completed setup:", updatedUser.hasCompletedSetup);
      
      setUser(updatedUser);
      
      // Always dispatch avatar update event when account setup completes
      // This ensures the header and other components show the avatar immediately
      if (updatedUser.avatar) {
        console.log("[ProfileActions] Dispatching avatar-updated event after setup completion");
        window.dispatchEvent(new CustomEvent('avatar-updated', { 
          detail: { 
            avatarData: updatedUser.avatar, 
            timestamp: updateTimeStamp,
            source: 'setup-completion'
          }
        }));
        
        // Send another event after a delay to catch any components that missed the first one
        setTimeout(() => {
          console.log("[ProfileActions] Sending delayed avatar-updated event after setup completion");
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
      console.error("[ProfileActions] Failed to complete account setup");
    } else {
      console.log("[ProfileActions] Skipped stale user update");
    }
  };

  return {
    updateUserProfile,
    completeAccountSetup
  };
};
