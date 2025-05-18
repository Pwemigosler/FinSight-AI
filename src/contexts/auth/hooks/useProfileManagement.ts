
import { useState } from "react";
import { User } from "../../../types/user";
import { UserService } from "../UserService";
import { AccountSetupData } from "../types";

type UseProfileManagementProps = {
  user: User | null;
  lastUpdateTime: number;
  setLastUpdateTime: (time: number) => void;
  setUserData: (user: User | null) => void;
};

type UseProfileManagementResult = {
  updateUserProfile: (updates: Partial<User>) => Promise<User | null>;
  completeAccountSetup: (profileData: AccountSetupData) => Promise<boolean>;
};

export const useProfileManagement = ({
  user,
  lastUpdateTime,
  setLastUpdateTime,
  setUserData
}: UseProfileManagementProps): UseProfileManagementResult => {
  const userService = new UserService();

  // User profile management
  const updateUserProfile = async (updates: Partial<User>): Promise<User | null> => {
    const updateTimeStamp = Date.now();
    setLastUpdateTime(updateTimeStamp);
    
    console.log("[AuthContext] Updating user profile with:", 
      "Name:", updates.name,
      "Has avatar:", !!updates.avatar,
      "Avatar length:", updates.avatar?.length || 0);
    
    if (!user) {
      console.error("[AuthContext] Cannot update profile: No user logged in");
      return null;
    }
    
    const updatedUser = await userService.updateProfile(user, updates);
    
    // Only update state if this is the most recent update request
    if (updateTimeStamp >= lastUpdateTime && updatedUser) {
      console.log("[AuthContext] Setting updated user to state:", 
        "Name:", updatedUser.name,
        "Has avatar:", !!updatedUser.avatar,
        "Avatar length:", updatedUser.avatar?.length || 0);
      
      // Update the state with the new user data
      setUserData(updatedUser);
      
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
    
    return updatedUser;
  };

  const completeAccountSetup = async (profileData: AccountSetupData): Promise<boolean> => {
    const updateTimeStamp = Date.now();
    setLastUpdateTime(updateTimeStamp);
    
    console.log("[AuthContext] Completing account setup with data:", profileData);
    
    if (!user) {
      console.error("[AuthContext] Cannot complete setup: No user logged in");
      return false;
    }
    
    // First update the user profile with the profile data
    // Convert AccountSetupData to Partial<User> for the update
    const userUpdates: Partial<User> = {};
    
    // Only add billing address to user preferences if it exists
    if (profileData.billingAddress) {
      userUpdates.preferences = {
        ...(user.preferences || {}),
        billingAddress: profileData.billingAddress
      };
    }
    
    // Only add phone number to user preferences if it exists
    if (profileData.phoneNumber) {
      userUpdates.preferences = {
        ...(userUpdates.preferences || user.preferences || {}),
        phoneNumber: profileData.phoneNumber
      };
    }
    
    const updatedUser = await userService.updateProfile(user, userUpdates);
    
    if (!updatedUser) {
      console.error("[AuthContext] Failed to update profile data during setup");
      return false;
    }
    
    // Then mark setup as complete
    const completedUser = await userService.completeAccountSetup(updatedUser);
    
    // Only update state if this is the most recent update request
    if (updateTimeStamp >= lastUpdateTime && completedUser) {
      console.log("[AuthContext] Setting completed setup user to state:", 
        "Name:", completedUser.name,
        "Has avatar:", !!completedUser.avatar,
        "Avatar length:", completedUser.avatar?.length || 0,
        "Has completed setup:", completedUser.hasCompletedSetup);
      
      // Update the state with the new user data
      setUserData(completedUser);
      
      // Always dispatch avatar update event when account setup completes
      // This ensures the header and other components show the avatar immediately
      if (completedUser.avatar) {
        console.log("[AuthContext] Dispatching avatar-updated event after setup completion");
        window.dispatchEvent(new CustomEvent('avatar-updated', { 
          detail: { 
            avatarData: completedUser.avatar, 
            timestamp: updateTimeStamp,
            source: 'setup-completion'
          }
        }));
        
        // Send another event after a delay to catch any components that missed the first one
        setTimeout(() => {
          console.log("[AuthContext] Sending delayed avatar-updated event after setup completion");
          window.dispatchEvent(new CustomEvent('avatar-updated', { 
            detail: { 
              avatarData: completedUser.avatar, 
              timestamp: updateTimeStamp + 1,
              source: 'setup-completion-delayed'
            }
          }));
        }, 300);
      }
      
      return true;
    } else if (!completedUser) {
      console.error("[AuthContext] Failed to complete account setup");
      return false;
    } else {
      console.log("[AuthContext] Skipped stale user update");
      return false;
    }
  };

  return {
    updateUserProfile,
    completeAccountSetup
  };
};
