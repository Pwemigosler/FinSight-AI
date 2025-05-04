import { toast } from "sonner";
import { User } from "../../types/user";

export class UserService {
  getStoredUser(): User | null {
    try {
      const savedUser = localStorage.getItem("finsight_user");
      if (!savedUser) return null;
      
      const parsedUser = JSON.parse(savedUser);
      
      // Ensure avatar settings are initialized properly
      if (parsedUser && parsedUser.avatar && !parsedUser.avatarSettings) {
        console.log("[UserService] Initializing default avatarSettings for existing avatar");
        parsedUser.avatarSettings = {
          zoom: 100,
          position: { x: 0, y: 0 }
        };
      }
      
      // Ensure preferences are initialized properly
      if (parsedUser && !parsedUser.preferences) {
        console.log("[UserService] Initializing default preferences");
        parsedUser.preferences = {
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
      
      return parsedUser;
    } catch (error) {
      console.error("[UserService] Error loading stored user:", error);
      return null;
    }
  }

  async updateProfile(currentUser: User | null, updates: Partial<User>): Promise<User | null> {
    return new Promise((resolve, reject) => {
      try {
        if (!currentUser) {
          console.error("[UserService] Cannot update profile: No user logged in");
          reject(new Error("No user logged in"));
          return null;
        }
        
        console.log("[UserService] Updating user profile with:", 
          updates.avatar ? `avatar (length: ${updates.avatar.length})` : "no avatar", 
          updates.avatarSettings ? `avatarSettings zoom:${updates.avatarSettings.zoom}` : "no avatarSettings",
          updates.preferences ? `preferences: ${JSON.stringify(updates.preferences)}` : "no preferences",
          "other fields:", Object.keys(updates).filter(k => k !== "avatar" && k !== "avatarSettings" && k !== "preferences").join(", "));
        
        // Create a deep copy of the user object to avoid mutation issues
        const updatedUser = { ...currentUser };
        
        // Special handling for avatar and its settings
        if (updates.avatar !== undefined) {
          updatedUser.avatar = updates.avatar;
          
          // When setting avatar, always ensure avatar settings exist
          if (updates.avatarSettings) {
            updatedUser.avatarSettings = { ...updates.avatarSettings };
          } else if (!updatedUser.avatarSettings) {
            updatedUser.avatarSettings = {
              zoom: 100,
              position: { x: 0, y: 0 }
            };
          }
        } else if (updates.avatarSettings && updatedUser.avatar) {
          // If only updating settings but we have an avatar, update settings
          updatedUser.avatarSettings = { ...updates.avatarSettings };
        }
        
        // Special handling for preferences
        if (updates.preferences) {
          updatedUser.preferences = {
            ...updatedUser.preferences || {},  // Keep existing preferences if any
            ...updates.preferences            // Override with new preferences
          };
        }
        
        // Apply all other updates
        Object.keys(updates).forEach(key => {
          if (key !== "avatar" && key !== "avatarSettings" && key !== "preferences") {
            // Need to use any here since we're accessing dynamic properties
            (updatedUser as any)[key] = (updates as any)[key];
          }
        });
        
        console.log("[UserService] Saving updated user:", 
          "Name:", updatedUser.name,
          "Avatar exists:", !!updatedUser.avatar, 
          "Avatar settings:", updatedUser.avatarSettings ? 
            `zoom:${updatedUser.avatarSettings.zoom}, pos:(${updatedUser.avatarSettings.position.x},${updatedUser.avatarSettings.position.y})` : 
            "none",
          "Preferences:", updatedUser.preferences ? JSON.stringify(updatedUser.preferences) : "none");
        
        // Save to localStorage
        localStorage.setItem("finsight_user", JSON.stringify(updatedUser));
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
        localStorage.setItem("finsight_user", JSON.stringify(updatedUser));
        
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
          mockUser = {
            id: "user-123",
            name: email.split('@')[0] || "User",
            email: email,
            avatar: "",
            avatarSettings: {
              zoom: 100,
              position: {
                x: 0,
                y: 0
              }
            },
            hasCompletedSetup: false
          };
        }
      } else {
        // No saved user, create a new user
        mockUser = {
          id: "user-123",
          name: email.split('@')[0] || "User",
          email: email,
          avatar: "",
          avatarSettings: {
            zoom: 100,
            position: {
              x: 0,
              y: 0
            }
          },
          hasCompletedSetup: false
        };
      }
      
      console.log("[UserService] Logging in user with hasCompletedSetup:", mockUser.hasCompletedSetup,
                 "Avatar exists:", !!mockUser.avatar,
                 "Avatar length:", mockUser.avatar?.length || 0);
      
      localStorage.setItem("finsight_user", JSON.stringify(mockUser));
      
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
      
      // In a real app, this would create a user in a backend service
      // For now, we're just simulating signup with mock data
      const mockUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        avatar: "", // Initialize with empty avatar
        avatarSettings: {
          zoom: 100,
          position: { x: 0, y: 0 }
        },
        hasCompletedSetup: false // New users haven't completed setup
      };
      
      localStorage.setItem("finsight_user", JSON.stringify(mockUser));
      
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

  logout(): void {
    localStorage.removeItem("finsight_user");
    localStorage.removeItem("finsight_login_timestamp");
    toast("You have been logged out");
  }
}
