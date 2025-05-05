
import { User } from "../../../types/user";
import { toast } from "sonner";
import { DefaultsService } from "./DefaultsService";
import { UserStorageService } from "./UserStorageService";

/**
 * Service responsible for handling profile updates
 */
export class ProfileUpdateService {
  private defaultsService: DefaultsService;
  private storageService: UserStorageService;
  
  constructor() {
    this.defaultsService = new DefaultsService();
    this.storageService = new UserStorageService();
  }

  /**
   * Updates the user profile with new values
   */
  async updateProfile(currentUser: User | null, updates: Partial<User>): Promise<User | null> {
    return new Promise((resolve, reject) => {
      try {
        if (!currentUser) {
          console.error("[ProfileUpdateService] Cannot update profile: No user logged in");
          reject(new Error("No user logged in"));
          return null;
        }
        
        this.logUpdateDetails(updates);
        
        // Create a deep copy of the user object
        const updatedUser = this.applyUserUpdates(currentUser, updates);
        
        // Save to localStorage
        this.storageService.saveUser(updatedUser);
        toast("Profile updated successfully");
        
        // Give the browser a moment to process localStorage changes
        setTimeout(() => resolve(updatedUser), 50);
        
        return updatedUser;
      } catch (error) {
        console.error("[ProfileUpdateService] Error updating profile:", error);
        reject(error);
        return null;
      }
    });
  }

  /**
   * Logs details about what is being updated
   */
  private logUpdateDetails(updates: Partial<User>): void {
    console.log("[ProfileUpdateService] Updating user profile with:", 
      updates.avatar ? `avatar (length: ${updates.avatar.length})` : "no avatar", 
      updates.avatarSettings ? `avatarSettings zoom:${updates.avatarSettings.zoom}` : "no avatarSettings",
      updates.preferences ? `preferences: ${JSON.stringify(updates.preferences)}` : "no preferences",
      "other fields:", Object.keys(updates).filter(k => 
        k !== "avatar" && k !== "avatarSettings" && k !== "preferences").join(", ")
    );
  }

  /**
   * Applies updates to user object, handling special cases
   */
  private applyUserUpdates(currentUser: User, updates: Partial<User>): User {
    // Create a deep copy of the user object
    const updatedUser = { ...currentUser };
    
    // Handle avatar and avatar settings
    this.updateAvatarAndSettings(updatedUser, updates);
    
    // Handle preferences
    this.updatePreferences(updatedUser, updates);
    
    // Apply all other updates
    Object.keys(updates).forEach(key => {
      if (key !== "avatar" && key !== "avatarSettings" && key !== "preferences") {
        // Need to use any here since we're accessing dynamic properties
        (updatedUser as any)[key] = (updates as any)[key];
      }
    });
    
    return updatedUser;
  }

  /**
   * Updates avatar and avatar settings
   */
  private updateAvatarAndSettings(user: User, updates: Partial<User>): void {
    // Special handling for avatar and its settings
    if (updates.avatar !== undefined) {
      user.avatar = updates.avatar;
      
      // When setting avatar, always ensure avatar settings exist
      if (updates.avatarSettings) {
        user.avatarSettings = { ...updates.avatarSettings };
      } else if (!user.avatarSettings) {
        user.avatarSettings = this.defaultsService.getDefaultAvatarSettings();
      }
    } else if (updates.avatarSettings && user.avatar) {
      // If only updating settings but we have an avatar, update settings
      user.avatarSettings = { ...updates.avatarSettings };
    }
  }

  /**
   * Updates user preferences
   */
  private updatePreferences(user: User, updates: Partial<User>): void {
    if (updates.preferences) {
      user.preferences = {
        ...user.preferences || {},  // Keep existing preferences if any
        ...updates.preferences     // Override with new preferences
      };
    }
  }

  /**
   * Marks the account setup as complete
   */
  async completeAccountSetup(currentUser: User | null): Promise<User | null> {
    return new Promise((resolve, reject) => {
      try {
        if (!currentUser) {
          console.error("[ProfileUpdateService] Cannot complete setup: No user logged in");
          reject(new Error("No user logged in"));
          return null;
        }
        
        // IMPORTANT: Get the most recent user data from localStorage
        // This fixes the issue where profile data is lost when completing setup
        const freshUserData = this.storageService.getStoredUser() || currentUser;
        
        // Make a complete copy of the current user object
        const updatedUser = { ...freshUserData };
        
        // Only update the hasCompletedSetup flag, preserving everything else
        updatedUser.hasCompletedSetup = true;

        console.log("[ProfileUpdateService] Completing setup with complete user data:", 
          "Name:", updatedUser.name,
          "User has avatar:", !!updatedUser.avatar,
          "Avatar length:", updatedUser.avatar?.length || 0,
          "Avatar settings:", updatedUser.avatarSettings ? 
            `zoom:${updatedUser.avatarSettings.zoom}, pos:(${updatedUser.avatarSettings.position.x},${updatedUser.avatarSettings.position.y})` : 
            "none");
        
        // Save to localStorage with full data
        this.storageService.saveUser(updatedUser);
        
        console.log("[ProfileUpdateService] Account setup completed successfully");
        toast("Account setup completed!");
        
        // Give the browser time to process localStorage changes
        setTimeout(() => resolve(updatedUser), 100);
        
        return updatedUser;
      } catch (error) {
        console.error("[ProfileUpdateService] Error completing setup:", error);
        reject(error);
        return null;
      }
    });
  }
}
