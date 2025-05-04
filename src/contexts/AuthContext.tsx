
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { User } from "../types/user";

interface BankCard {
  id: string;
  last4: string;
  bank: string;
  type: string;
  isDefault: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  linkedCards: BankCard[];
  addBankCard: (card: Omit<BankCard, "id">) => void;
  removeBankCard: (cardId: string) => void;
  setDefaultCard: (cardId: string) => void;
  completeAccountSetup: () => Promise<void>;
  needsAccountSetup: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [linkedCards, setLinkedCards] = useState<BankCard[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load user data and linked cards from localStorage on mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
        // Load user data
        const savedUser = localStorage.getItem("finsight_user");
        const parsedUser = savedUser ? JSON.parse(savedUser) : null;
        
        // Ensure avatar settings are initialized properly
        if (parsedUser && parsedUser.avatar && !parsedUser.avatarSettings) {
          console.log("[AuthContext] Initializing default avatarSettings for existing avatar");
          parsedUser.avatarSettings = {
            zoom: 100,
            position: { x: 0, y: 0 }
          };
        }
        
        // Debug log for avatar
        if (parsedUser && parsedUser.avatar) {
          console.log("[AuthContext] Loading user from storage with avatar:", 
            "length:", parsedUser.avatar.length,
            "settings:", parsedUser.avatarSettings ? "present" : "missing");
        } else {
          console.log("[AuthContext] No avatar found in stored user data");
        }
        
        setUser(parsedUser);
        
        // Load linked cards
        const savedCards = localStorage.getItem("finsight_linked_cards");
        const parsedCards = savedCards ? JSON.parse(savedCards) : [];
        setLinkedCards(parsedCards);
      } catch (error) {
        console.error("[AuthContext] Error loading stored auth data:", error);
        // If there's an error parsing, reset the storage
        localStorage.removeItem("finsight_user");
        localStorage.removeItem("finsight_linked_cards");
      } finally {
        setInitialized(true);
      }
    };

    loadStoredData();
  }, []);

  // Function to update user profile - now with more robust avatar handling
  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        if (!user) {
          console.error("[AuthContext] Cannot update profile: No user logged in");
          reject(new Error("No user logged in"));
          return;
        }
        
        console.log("[AuthContext] Updating user profile with:", 
          updates.avatar ? `avatar (length: ${updates.avatar.length})` : "no avatar", 
          updates.avatarSettings ? `avatarSettings zoom:${updates.avatarSettings.zoom}` : "no avatarSettings",
          "other fields:", Object.keys(updates).filter(k => k !== "avatar" && k !== "avatarSettings").join(", "));
        
        // Create a deep copy of the user object to avoid mutation issues
        const updatedUser = { ...user };
        
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
        
        // Apply all other updates
        Object.keys(updates).forEach(key => {
          if (key !== "avatar" && key !== "avatarSettings") {
            // Need to use any here since we're accessing dynamic properties
            (updatedUser as any)[key] = (updates as any)[key];
          }
        });
        
        console.log("[AuthContext] Saving updated user:", 
          "Name:", updatedUser.name,
          "Avatar exists:", !!updatedUser.avatar, 
          "Avatar length:", updatedUser.avatar?.length || 0,
          "Avatar settings:", updatedUser.avatarSettings ? 
            `zoom:${updatedUser.avatarSettings.zoom}, pos:(${updatedUser.avatarSettings.position.x},${updatedUser.avatarSettings.position.y})` : 
            "none");
        
        // Save to localStorage first to ensure data is persisted
        localStorage.setItem("finsight_user", JSON.stringify(updatedUser));
        
        // Then update state
        setUser(updatedUser);
        toast("Profile updated successfully");
        
        // Give the browser a moment to process localStorage changes
        setTimeout(() => resolve(), 50);
      } catch (error) {
        console.error("[AuthContext] Error updating profile:", error);
        reject(error);
      }
    });
  };

  // FIXED: Fixed completeAccountSetup to properly preserve avatar data
  const completeAccountSetup = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        if (!user) {
          console.error("[AuthContext] Cannot complete setup: No user logged in");
          reject(new Error("No user logged in"));
          return;
        }
        
        // IMPORTANT: Create a full copy of ALL user data
        const updatedUser = JSON.parse(JSON.stringify(user));
        
        // Only update the hasCompletedSetup flag
        updatedUser.hasCompletedSetup = true;

        console.log("[AuthContext] Completing setup with FULL user data:", 
          "User has avatar:", !!updatedUser.avatar,
          "Avatar length:", updatedUser.avatar?.length || 0,
          "Avatar settings:", updatedUser.avatarSettings ? 
            `zoom:${updatedUser.avatarSettings.zoom}, pos:(${updatedUser.avatarSettings.position.x},${updatedUser.avatarSettings.position.y})` : 
            "none");
        
        // Save to localStorage with full data, ensuring nothing is lost
        localStorage.setItem("finsight_user", JSON.stringify(updatedUser));
        
        // Update state with the complete object that includes all data
        setUser(updatedUser);
        
        console.log("[AuthContext] Account setup completed successfully, state updated");
        toast("Account setup completed!");
        
        // Give the browser a moment to process localStorage changes
        setTimeout(() => resolve(), 100);
      } catch (error) {
        console.error("[AuthContext] Error completing setup:", error);
        reject(error);
      }
    });
  };

  // Check if user needs to complete account setup
  const needsAccountSetup = user !== null && user.hasCompletedSetup !== true;

  // Function to add a new bank card
  const addBankCard = (card: Omit<BankCard, "id">) => {
    const newCard = {
      ...card,
      id: `card-${Date.now()}` // Generate a unique ID
    };
    
    const updatedCards = [...linkedCards];
    
    // If this is the first card or isDefault is true, make it the default
    if (updatedCards.length === 0 || newCard.isDefault) {
      // Set all other cards to non-default
      updatedCards.forEach(c => c.isDefault = false);
    }
    
    updatedCards.push(newCard);
    setLinkedCards(updatedCards);
    localStorage.setItem("finsight_linked_cards", JSON.stringify(updatedCards));
    toast("Bank card linked successfully");
  };

  // Function to remove a bank card
  const removeBankCard = (cardId: string) => {
    const updatedCards = linkedCards.filter(card => card.id !== cardId);
    
    // If we removed the default card and there are other cards, set a new default
    if (linkedCards.find(c => c.id === cardId)?.isDefault && updatedCards.length > 0) {
      updatedCards[0].isDefault = true;
    }
    
    setLinkedCards(updatedCards);
    localStorage.setItem("finsight_linked_cards", JSON.stringify(updatedCards));
    toast("Bank card removed");
  };

  // Function to set a card as default
  const setDefaultCard = (cardId: string) => {
    const updatedCards = linkedCards.map(card => ({
      ...card,
      isDefault: card.id === cardId
    }));
    
    setLinkedCards(updatedCards);
    localStorage.setItem("finsight_linked_cards", JSON.stringify(updatedCards));
    toast("Default payment method updated");
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email || !password) {
        toast("Please enter both email and password");
        return false;
      }
      
      // Check if this email already exists in localStorage
      const savedUserStr = localStorage.getItem("finsight_user");
      let mockUser: User;
      
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        
        // If the email matches, use the existing user data instead of creating a new one
        if (savedUser && savedUser.email === email) {
          console.log("[AuthContext] Found existing user with matching email, preserving setup status");
          mockUser = {
            ...savedUser,
            // Ensure we preserve the hasCompletedSetup flag
            hasCompletedSetup: savedUser.hasCompletedSetup === true
          };
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
      
      console.log("[AuthContext] Logging in user with hasCompletedSetup:", mockUser.hasCompletedSetup);
      
      setUser(mockUser);
      localStorage.setItem("finsight_user", JSON.stringify(mockUser));
      
      // Also store a login timestamp to potentially expire the session after some time
      localStorage.setItem("finsight_login_timestamp", Date.now().toString());
      
      toast("Successfully logged in");
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast("Login failed. Please try again.");
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      if (!name || !email || !password) {
        toast("Please fill in all fields");
        return false;
      }
      
      if (password.length < 6) {
        toast("Password must be at least 6 characters long");
        return false;
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
      
      setUser(mockUser);
      localStorage.setItem("finsight_user", JSON.stringify(mockUser));
      
      // Store login timestamp
      localStorage.setItem("finsight_login_timestamp", Date.now().toString());
      
      toast("Successfully signed up!");
      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      toast("Signup failed. Please try again.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    // Don't remove linked cards on logout to preserve user preferences
    localStorage.removeItem("finsight_user");
    localStorage.removeItem("finsight_login_timestamp");
    toast("You have been logged out");
  };

  // Only render children once we've checked localStorage
  if (!initialized) {
    return null; // Or a loading spinner
  }

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    updateUserProfile,
    linkedCards,
    addBankCard,
    removeBankCard,
    setDefaultCard,
    completeAccountSetup,
    needsAccountSetup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
