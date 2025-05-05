
import { User } from "../../../types/user";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
    try {
      if (!currentUser) {
        console.error("[ProfileUpdateService] Cannot update profile: No user logged in");
        throw new Error("No user logged in");
      }
      
      this.logUpdateDetails(updates);
      
      // Prepare data for Supabase update
      const supabaseUpdates: any = {};
      
      // Handle name field
      if (updates.name !== undefined) {
        supabaseUpdates.name = updates.name;
      }
      
      // Handle avatar
      if (updates.avatar !== undefined) {
        supabaseUpdates.avatar = updates.avatar;
      }
      
      // Handle avatar settings
      if (updates.avatarSettings) {
        supabaseUpdates.avatar_settings = updates.avatarSettings;
      }
      
      // Handle preferences
      if (updates.preferences) {
        // Merge with existing preferences if available
        supabaseUpdates.preferences = {
          ...currentUser.preferences || {},
          ...updates.preferences
        };
      }
      
      // Update profile in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update(supabaseUpdates)
        .eq('id', currentUser.id)
        .select();
      
      if (error) {
        console.error("[ProfileUpdateService] Supabase update error:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.error("[ProfileUpdateService] No data returned from update");
        throw new Error("No data returned from update");
      }
      
      // Create a deep copy of the user object
      const updatedUser = this.applyUserUpdates(currentUser, updates);
      
      // Save to localStorage as a backup
      this.storageService.saveUser(updatedUser);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      return updatedUser;
    } catch (error) {
      console.error("[ProfileUpdateService] Error updating profile:", error);
      
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      
      return null;
    }
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
   * Marks the account setup as complete in Supabase
   */
  async completeAccountSetup(currentUser: User | null): Promise<User | null> {
    try {
      if (!currentUser) {
        console.error("[ProfileUpdateService] Cannot complete setup: No user logged in");
        throw new Error("No user logged in");
      }
      
      // Update the has_completed_setup flag in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update({ has_completed_setup: true })
        .eq('id', currentUser.id)
        .select();
      
      if (error) {
        console.error("[ProfileUpdateService] Supabase update error:", error);
        throw error;
      }
      
      // Make a complete copy of the current user object
      const updatedUser = { ...currentUser };
      
      // Only update the hasCompletedSetup flag, preserving everything else
      updatedUser.hasCompletedSetup = true;

      console.log("[ProfileUpdateService] Completing setup with complete user data:", 
        "Name:", updatedUser.name,
        "User has avatar:", !!updatedUser.avatar,
        "Avatar length:", updatedUser.avatar?.length || 0,
        "Avatar settings:", updatedUser.avatarSettings ? 
          `zoom:${updatedUser.avatarSettings.zoom}, pos:(${updatedUser.avatarSettings.position.x},${updatedUser.avatarSettings.position.y})` : 
          "none");
      
      // Save to localStorage with full data as a backup
      this.storageService.saveUser(updatedUser);
      
      console.log("[ProfileUpdateService] Account setup completed successfully");
      
      toast({
        title: "Success",
        description: "Account setup completed!",
      });
      
      return updatedUser;
    } catch (error) {
      console.error("[ProfileUpdateService] Error completing setup:", error);
      
      toast({
        title: "Error",
        description: "Failed to complete account setup",
        variant: "destructive",
      });
      
      return null;
    }
  }
}
