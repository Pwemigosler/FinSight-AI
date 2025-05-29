import { User } from "../../types/user";
import { supabase } from "@/integrations/supabase/client";
import { DefaultsService } from "./services/DefaultsService";
import { UserStorageService } from "./services/UserStorageService";
import { ProfileUpdateService } from "./services/ProfileUpdateService";

export class UserService {
  private defaultsService: DefaultsService;
  private storageService: UserStorageService;
  private profileService: ProfileUpdateService;
  
  constructor() {
    this.defaultsService = new DefaultsService();
    this.storageService = new UserStorageService();
    this.profileService = new ProfileUpdateService();
  }

  async getUserProfile(userId: string): Promise<User | null> {
    try {
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
      
      const { data: authUser } = await supabase.auth.getUser();

      const user: User = {
        id: profile.id,
        email: authUser?.user?.email || '',
        name: profile.name,
        avatar: profile.avatar,
        avatarSettings: profile.avatar_settings as unknown as User['avatarSettings'],
        preferences: profile.preferences as unknown as User['preferences'],
        hasCompletedSetup: profile.has_completed_setup
      };

      console.log("[UserService] Returning user profile:", user);

      this.storageService.saveUser(user);
      
      return user;
    } catch (error) {
      console.error("[UserService] Error fetching user profile:", error);
      return this.getStoredUser();
    }
  }

  getStoredUser(): User | null {
    return this.storageService.getStoredUser();
  }

  async updateProfile(currentUser: User | null, updates: Partial<User>): Promise<User | null> {
    return this.profileService.updateProfile(currentUser, updates);
  }

  async completeAccountSetup(currentUser: User | null): Promise<User | null> {
    return this.profileService.completeAccountSetup(currentUser);
  }

  logout(): void {
    this.storageService.clearUserData();
  }
}
