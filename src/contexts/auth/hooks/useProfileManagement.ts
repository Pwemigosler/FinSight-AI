import { useState } from "react";
import { User } from "../../../types/user";
import { UserService } from "../UserService";

type UseProfileManagementProps = {
  user: User | null;
  lastUpdateTime: number;
  setLastUpdateTime: (time: number) => void;
  setUser?: (user: User | null) => void;
};

type UseProfileManagementResult = {
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  completeAccountSetup: () => Promise<void>;
};

export const useProfileManagement = ({
  user,
  lastUpdateTime,
  setLastUpdateTime,
  setUser,
}: UseProfileManagementProps): UseProfileManagementResult => {
  const userService = new UserService();

  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    const updateTimeStamp = Date.now();
    setLastUpdateTime(updateTimeStamp);

    if (!user) {
      console.error("[AuthContext] Cannot update profile: No user logged in");
      return;
    }

    const updatedUser = await userService.updateProfile(user, updates);

    if (updateTimeStamp >= lastUpdateTime && updatedUser) {
      if (setUser) setUser(updatedUser);

      if (updates.avatar !== undefined) {
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
    }
  };

  const completeAccountSetup = async (): Promise<void> => {
    const updateTimeStamp = Date.now();
    setLastUpdateTime(updateTimeStamp);

    if (!user) {
      console.error("[AuthContext] Cannot complete setup: No user logged in");
      return;
    }

    // 1. Complete setup in Supabase
    await userService.completeAccountSetup(user);

    // 2. Fetch updated user from Supabase!
    const refreshedUser = await userService.getUserProfile(user.id);

    if (refreshedUser) {
      if (setUser) setUser(refreshedUser);

      // LOG here:
      console.log("[completeAccountSetup] Refreshed user after setup:", refreshedUser);

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
