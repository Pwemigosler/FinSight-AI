import { toast } from "sonner";
import { User } from "../../../types/user";
import { DefaultsService } from "./DefaultsService";

/**
 * Service responsible for reading and writing user data to storage
 */
export class UserStorageService {
  private defaultsService: DefaultsService;
  private lastSaveTimestamp: number = 0;
  
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
   * Safely saves user to localStorage with a check for possible race conditions
   * by verifying there hasn't been a more recent save operation
   */
  saveUser(user: User): void {
    const saveTime = Date.now();
    this.lastSaveTimestamp = saveTime;
    
    // Log save operation details
    console.log("[UserStorageService] Saving user at timestamp", saveTime, ":", 
      "Name:", user.name,
      "Avatar exists:", !!user.avatar, 
      "Avatar length:", user.avatar?.length || 0,
      "Avatar settings:", user.avatarSettings ? 
        `zoom:${user.avatarSettings.zoom}, pos:(${user.avatarSettings.position.x},${user.avatarSettings.position.y})` : 
        "none",
      "Preferences:", user.preferences ? JSON.stringify(user.preferences) : "none",
      "HasCompletedSetup:", user.hasCompletedSetup);
    
    // Wait a bit before saving to ensure any newer save operations happen first
    setTimeout(() => {
      // Only save if this is still the most recent save operation
      if (saveTime >= this.lastSaveTimestamp) {
        try {
          // Check for any newer data that might have been saved while we were waiting
          const currentData = localStorage.getItem("finsight_user");
          if (currentData) {
            const currentUser = JSON.parse(currentData);
            
            // If current data is newer (has completed setup) and we're trying to save data that hasn't,
            // we should merge the data instead of overwriting
            if (currentUser.hasCompletedSetup && !user.hasCompletedSetup) {
              console.log("[UserStorageService] Merging with more recent user data");
              // Keep the completed setup flag from the current data
              user.hasCompletedSetup = true;
            }
          }
          
          localStorage.setItem("finsight_user", JSON.stringify(user));
          console.log("[UserStorageService] User saved successfully at timestamp", saveTime);
        } catch (error) {
          console.error("[UserStorageService] Error saving user:", error);
        }
      } else {
        console.log("[UserStorageService] Skipped outdated save operation from timestamp", saveTime);
      }
    }, 10);
  }

  /**
   * Clears user data from localStorage
   */
  clearUserData(): void {
    localStorage.removeItem("finsight_user");
    localStorage.removeItem("finsight_login_timestamp");
  }
}
