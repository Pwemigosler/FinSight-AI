import { useState } from "react";
import { User } from "../../../types/user";
import { UserService } from "../UserService";

// Add an optional setUser to update context state
type UseProfileManagementProps = {
  user: User | null;
  lastUpdateTime: number;
  setLastUpdateTime: (time: number) => void;
  setUser?: (user: User | null) => void;  // <-- NEW
};

type UseProfileManagementResult = {
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  completeAccountSetup: () => Promise<void>;
};

export const useProfileManagement = ({
  user,
  lastUpdateTime,
  setLastUpdateTime,
  setUser,        // <-- NEW
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

      // If you have setUser, update the state in context
      if (setUser) setUser(updatedUser);

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

        setTimeout(() => {
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

    // 1. Complete setup in Supabase
    await userService.completeAccountSetup(user);

    // 2. Fetch updated user from Supabase!
    const refreshedUser = await userService.getUserProfile(user.id);

    if (refreshedUser) {
      // 3. If you have setUser, update the state in context!
      if (setUser) setUser(refreshedUser);

      // 4. Send avatar update events (as before)
      window.dispatchEvent(new CustomEvent('avatar-updated', {
        detail: {
          avatarData: refreshedUser.avatar,
          timestamp: updateTimeStamp,
          source: 'setup-completion'
        }
      }));

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('avatar-updated', {
          detail: {
            avatarData: refreshedUser.avatar,
            timestamp: updateTimeStamp + 1,
            source: 'setup-completion-delayed'
          }
        }));
      }, 300);

    } else {
      console.error("[AuthContext] Failed to fetch refreshed user profile after setup");
    }
  };

  return {
    updateUserProfile,
    completeAccountSetup
  };
};
