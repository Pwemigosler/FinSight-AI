import { User } from "../../../types/user";
import { toast } from "sonner";
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

  async updateProfile(currentUser: User | null, updates: Partial<User>): Promise<User | null> {
    try {
      if (!currentUser) {
        console.error("[ProfileUpdateService] Cannot update profile: No user logged in");
        throw new Error("No user logged in");
      }
      this.logUpdateDetails(updates);

      const supabaseUpdates: any = {};
      if (updates.name !== undefined) supabaseUpdates.name = updates.name;
      if (updates.avatar !== undefined) supabaseUpdates.avatar = updates.avatar;
      if (updates.avatarSettings) supabaseUpdates.avatar_settings = updates.avatarSettings;
      if (updates.preferences) {
        supabaseUpdates.preferences = {
          ...currentUser.preferences || {},
          ...updates.preferences
        };
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: currentUser.id, ...supabaseUpdates }, { onConflict: 'id' })
        .select()
        .single();
      
      if (error) {
        console.error("[ProfileUpdateService] Supabase update error:", error);
        throw error;
      }
      if (!data || data.length === 0) {
        console.error("[ProfileUpdateService] No data returned from update");
        throw new Error("No data returned from update");
      }
      
      const updatedUser = this.applyUserUpdates(currentUser, updates);
      this.storageService.saveUser(updatedUser);
      toast("Profile updated successfully");
      console.log("[ProfileUpdateService] Profile updated and saved:", updatedUser);

      return updatedUser;
    } catch (error) {
      console.error("[ProfileUpdateService] Error updating profile:", error);
      toast("Failed to update profile");
      return null;
    }
  }

  private logUpdateDetails(updates: Partial<User>): void {
    console.log("[ProfileUpdateService] Updating user profile with:", 
      updates.avatar ? `avatar (length: ${updates.avatar.length})` : "no avatar", 
      updates.avatarSettings ? `avatarSettings zoom:${updates.avatarSettings.zoom}` : "no avatarSettings",
      updates.preferences ? `preferences: ${JSON.stringify(updates.preferences)}` : "no preferences",
      "other fields:", Object.keys(updates).filter(k => 
        k !== "avatar" && k !== "avatarSettings" && k !== "preferences").join(", ")
    );
  }

  private applyUserUpdates(currentUser: User, updates: Partial<User>): User {
    const updatedUser = { ...currentUser };
    this.updateAvatarAndSettings(updatedUser, updates);
    this.updatePreferences(updatedUser, updates);
    Object.keys(updates).forEach(key => {
      if (key !== "avatar" && key !== "avatarSettings" && key !== "preferences") {
        (updatedUser as any)[key] = (updates as any)[key];
      }
    });
    return updatedUser;
  }

  private updateAvatarAndSettings(user: User, updates: Partial<User>): void {
    if (updates.avatar !== undefined) {
      user.avatar = updates.avatar;
      if (updates.avatarSettings) {
        user.avatarSettings = { ...updates.avatarSettings };
      } else if (!user.avatarSettings) {
        user.avatarSettings = this.defaultsService.getDefaultAvatarSettings();
      }
    } else if (updates.avatarSettings && user.avatar) {
      user.avatarSettings = { ...updates.avatarSettings };
    }
  }

  private updatePreferences(user: User, updates: Partial<User>): void {
    if (updates.preferences) {
      user.preferences = {
        ...user.preferences || {},
        ...updates.preferences
      };
    }
  }

  async completeAccountSetup(currentUser: User | null): Promise<User | null> {
    try {
      if (!currentUser) {
        console.error("[ProfileUpdateService] Cannot complete setup: No user logged in");
        throw new Error("No user logged in");
      }
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          { id: currentUser.id, has_completed_setup: true },
          { onConflict: 'id' }
        )
        .select()
        .single();
      if (error) {
        console.error("[ProfileUpdateService] Supabase update error:", error);
        throw error;
      }
      const updatedUser = { ...currentUser };
      updatedUser.hasCompletedSetup = true;
      this.storageService.saveUser(updatedUser);
      console.log("[ProfileUpdateService] Account setup completed successfully:", updatedUser);
      toast("Account setup completed!");
      return updatedUser;
    } catch (error) {
      console.error("[ProfileUpdateService] Error completing setup:", error);
      toast("Failed to complete account setup");
      return null;
    }
  }
}
