
import { toast } from "sonner";
import { User } from "../../../types/user";
import { DefaultsService } from "./DefaultsService";

/**
 * Service responsible for reading and writing user data to storage
 */
export class UserStorageService {
  private defaultsService: DefaultsService;
  
  constructor() {
    this.defaultsService = new DefaultsService();
  }

  /**
   * Retrieves the stored user from localStorage
   */
  getStoredUser(): User | null {
    try {
      const savedUser = localStorage.getItem("finsight_user");
      if (!savedUser) return null;
      
      const parsedUser = JSON.parse(savedUser);
      
      // Initialize with default values if needed
      return this.ensureUserDefaults(parsedUser);
    } catch (error) {
      console.error("[UserStorageService] Error loading stored user:", error);
      return null;
    }
  }

  /**
   * Ensures user object has all required default values
   */
  private ensureUserDefaults(user: User): User {
    if (!user) return user;
    
    // Create a deep copy of the user
    const updatedUser = { ...user };
    
    // Ensure avatar settings are initialized properly
    if (updatedUser.avatar && !updatedUser.avatarSettings) {
      console.log("[UserStorageService] Initializing default avatarSettings for existing avatar");
      updatedUser.avatarSettings = this.defaultsService.getDefaultAvatarSettings();
    }
    
    // Ensure preferences are initialized properly
    if (!updatedUser.preferences) {
      console.log("[UserStorageService] Initializing default preferences");
      updatedUser.preferences = this.defaultsService.getDefaultPreferences();
    }
    
    return updatedUser;
  }

  /**
   * Saves user to localStorage
   */
  saveUser(user: User): void {
    console.log("[UserStorageService] Saving updated user:", 
      "Name:", user.name,
      "Avatar exists:", !!user.avatar, 
      "Avatar settings:", user.avatarSettings ? 
        `zoom:${user.avatarSettings.zoom}, pos:(${user.avatarSettings.position.x},${user.avatarSettings.position.y})` : 
        "none",
      "Preferences:", user.preferences ? JSON.stringify(user.preferences) : "none");
    
    localStorage.setItem("finsight_user", JSON.stringify(user));
  }

  /**
   * Clears user data from localStorage
   */
  clearUserData(): void {
    localStorage.removeItem("finsight_user");
    localStorage.removeItem("finsight_login_timestamp");
  }
}
