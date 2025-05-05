
import { User } from "../../types/user";
import { supabase } from "@/integrations/supabase/client";
import { DefaultsService } from "./services/DefaultsService";
import { UserStorageService } from "./services/UserStorageService";
import { ProfileUpdateService } from "./services/ProfileUpdateService";

/**
 * Main service that coordinates user-related operations
 * Acts as a facade for the specialized services
 */
export class UserService {
  private defaultsService: DefaultsService;
  private storageService: UserStorageService;
  private profileService: ProfileUpdateService;
  
  constructor() {
    this.defaultsService = new DefaultsService();
    this.storageService = new UserStorageService();
    this.profileService = new ProfileUpdateService();
  }

  /**
   * Retrieves the user profile from Supabase
   */
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      // Get user data from Supabase
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("[UserService] Error getting user profile:", error);
        return null;
      }
      
      if (!profile) {
        console.error("[UserService] No profile found for user:", userId);
        return null;
      }
      
      // Get auth user data for email
      const { data: authUser } = await supabase.auth.getUser();
      
      // Combine profile and auth data
      const user: User = {
        id: profile.id,
        email: authUser?.user?.email || '',
        name: profile.name,
        avatar: profile.avatar,
        avatarSettings: profile.avatar_settings,
        preferences: profile.preferences,
        hasCompletedSetup: profile.has_completed_setup
      };

      // Save user data to localStorage for offline access
      this.storageService.saveUser(user);
      
      return user;
    } catch (error) {
      console.error("[UserService] Error fetching user profile:", error);
      
      // Fall back to stored user if available
      return this.getStoredUser();
    }
  }

  /**
   * Retrieves the stored user from localStorage
   */
  getStoredUser(): User | null {
    return this.storageService.getStoredUser();
  }

  /**
   * Updates the user profile with new values
   */
  async updateProfile(currentUser: User | null, updates: Partial<User>): Promise<User | null> {
    return this.profileService.updateProfile(currentUser, updates);
  }

  /**
   * Marks the account setup as complete
   */
  async completeAccountSetup(currentUser: User | null): Promise<User | null> {
    return this.profileService.completeAccountSetup(currentUser);
  }

  /**
   * Logs out the user
   */
  logout(): void {
    this.storageService.clearUserData();
  }
}
