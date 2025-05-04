
import { toast } from "sonner";
import { User, UserPreferences, AvatarSettings } from "../../types/user";

export class UserService {
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
      console.error("[UserService] Error loading stored user:", error);
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
      console.log("[UserService] Initializing default avatarSettings for existing avatar");
      updatedUser.avatarSettings = this.getDefaultAvatarSettings();
    }
    
    // Ensure preferences are initialized properly
    if (!updatedUser.preferences) {
      console.log("[UserService] Initializing default preferences");
      updatedUser.preferences = this.getDefaultPreferences();
    }
    
    return updatedUser;
  }

  /**
   * Returns default avatar settings
   */
  private getDefaultAvatarSettings(): AvatarSettings {
    return {
      zoom: 100,
      position: { x: 0, y: 0 }
    };
  }

  /**
   * Returns default user preferences
   */
  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'light',
      assistantCharacter: 'fin',
      notifications: true,
      emailNotifications: true,
      appNotifications: true,
      currencyFormat: 'usd',
      dateFormat: 'MM/DD/YYYY',
      language: 'en'
    };
  }

  /**
   * Updates the user profile with new values
   */
  async updateProfile(currentUser: User | null, updates: Partial<User>): Promise<User | null> {
    return new Promise((resolve, reject) => {
      try {
        if (!currentUser) {
          console.error("[UserService] Cannot update profile: No user logged in");
          reject(new Error("No user logged in"));
          return null;
        }
        
        this.logUpdateDetails(updates);
        
        // Create a deep copy of the user object
        const updatedUser = this.applyUserUpdates(currentUser, updates);
        
        // Save to localStorage
        this.saveUser(updatedUser);
        toast("Profile updated successfully");
        
        // Give the browser a moment to process localStorage changes
        setTimeout(() => resolve(updatedUser), 50);
        
        return updatedUser;
      } catch (error) {
        console.error("[UserService] Error updating profile:", error);
        reject(error);
        return null;
      }
    });
  }

  /**
   * Logs details about what is being updated
   */
  private logUpdateDetails(updates: Partial<User>): void {
    console.log("[UserService] Updating user profile with:", 
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
        user.avatarSettings = this.getDefaultAvatarSettings();
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
   * Saves user to localStorage
   */
  private saveUser(user: User): void {
    console.log("[UserService] Saving updated user:", 
      "Name:", user.name,
      "Avatar exists:", !!user.avatar, 
      "Avatar settings:", user.avatarSettings ? 
        `zoom:${user.avatarSettings.zoom}, pos:(${user.avatarSettings.position.x},${user.avatarSettings.position.y})` : 
        "none",
      "Preferences:", user.preferences ? JSON.stringify(user.preferences) : "none");
    
    localStorage.setItem("finsight_user", JSON.stringify(user));
  }

  /**
   * Marks the account setup as complete
   */
  async completeAccountSetup(currentUser: User | null): Promise<User | null> {
    return new Promise((resolve, reject) => {
      try {
        if (!currentUser) {
          console.error("[UserService] Cannot complete setup: No user logged in");
          reject(new Error("No user logged in"));
          return null;
        }
        
        // Make a complete copy of the current user object
        const updatedUser = { ...currentUser };
        
        // Only update the hasCompletedSetup flag, preserving everything else
        updatedUser.hasCompletedSetup = true;

        console.log("[UserService] Completing setup with complete user data:", 
          "Name:", updatedUser.name,
          "User has avatar:", !!updatedUser.avatar,
          "Avatar length:", updatedUser.avatar?.length || 0,
          "Avatar settings:", updatedUser.avatarSettings ? 
            `zoom:${updatedUser.avatarSettings.zoom}, pos:(${updatedUser.avatarSettings.position.x},${updatedUser.avatarSettings.position.y})` : 
            "none");
        
        // Save to localStorage with full data
        this.saveUser(updatedUser);
        
        console.log("[UserService] Account setup completed successfully");
        toast("Account setup completed!");
        
        // Give the browser time to process localStorage changes
        setTimeout(() => resolve(updatedUser), 100);
        
        return updatedUser;
      } catch (error) {
        console.error("[UserService] Error completing setup:", error);
        reject(error);
        return null;
      }
    });
  }

  /**
   * Handles user login
   */
  async login(email: string, password: string): Promise<User | null> {
    try {
      if (!email || !password) {
        toast("Please enter both email and password");
        return null;
      }
      
      // Check if this email already exists in localStorage
      const savedUserStr = localStorage.getItem("finsight_user");
      let mockUser: User;
      
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        
        // If the email matches, use the existing user data instead of creating a new one
        if (savedUser && savedUser.email === email) {
          console.log("[UserService] Found existing user with matching email, preserving all user data");
          mockUser = savedUser; // Use the complete saved user data
        } else {
          // Different email, create new mock user with default setup=false
          mockUser = this.createNewUser(email);
        }
      } else {
        // No saved user, create a new user
        mockUser = this.createNewUser(email);
      }
      
      console.log("[UserService] Logging in user with hasCompletedSetup:", mockUser.hasCompletedSetup,
                 "Avatar exists:", !!mockUser.avatar,
                 "Avatar length:", mockUser.avatar?.length || 0);
      
      this.saveUser(mockUser);
      
      // Also store a login timestamp to potentially expire the session after some time
      localStorage.setItem("finsight_login_timestamp", Date.now().toString());
      
      toast("Successfully logged in");
      return mockUser;
    } catch (error) {
      console.error("[UserService] Login failed:", error);
      toast("Login failed. Please try again.");
      return null;
    }
  }

  /**
   * Creates a new user with default values
   */
  private createNewUser(email: string): User {
    return {
      id: "user-123",
      name: email.split('@')[0] || "User",
      email: email,
      avatar: "",
      avatarSettings: this.getDefaultAvatarSettings(),
      hasCompletedSetup: false
    };
  }

  /**
   * Handles user signup
   */
  async signup(name: string, email: string, password: string): Promise<User | null> {
    try {
      if (!name || !email || !password) {
        toast("Please fill in all fields");
        return null;
      }
      
      if (password.length < 6) {
        toast("Password must be at least 6 characters long");
        return null;
      }
      
      // Create a new user with the provided information
      const mockUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        avatar: "",
        avatarSettings: this.getDefaultAvatarSettings(),
        hasCompletedSetup: false
      };
      
      this.saveUser(mockUser);
      
      // Store login timestamp
      localStorage.setItem("finsight_login_timestamp", Date.now().toString());
      
      toast("Successfully signed up!");
      return mockUser;
    } catch (error) {
      console.error("[UserService] Signup failed:", error);
      toast("Signup failed. Please try again.");
      return null;
    }
  }

  /**
   * Logs out the user
   */
  logout(): void {
    localStorage.removeItem("finsight_user");
    localStorage.removeItem("finsight_login_timestamp");
    toast("You have been logged out");
  }
}
