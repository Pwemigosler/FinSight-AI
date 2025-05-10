
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { User } from "../../types/user";
import { AuthContextType, BankCard } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { UserService } from "./UserService";
import { BankCardService } from "./BankCardService";
import { AuthService } from "./services/AuthService"; // Add the missing import
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const [isBiometricsSupported, setIsBiometricsSupported] = useState(false);
  const [isBiometricsRegistered, setIsBiometricsRegistered] = useState(false);
  
  // Initialize services
  const userService = new UserService();
  const bankCardService = new BankCardService();

  // Initialize auth state with Supabase session
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Set up auth change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            if (newSession?.user) {
              // Get profile data from Supabase when auth state changes
              const userData = await userService.getUserProfile(newSession.user.id);
              setUser(userData);
              
              // Force update avatar state when user is updated
              if (userData) {
                console.log("[AuthContext] Updated user from auth state change, triggering avatar refresh");
                // Use a custom event to notify components about avatar updates
                window.dispatchEvent(new CustomEvent('avatar-updated', { 
                  detail: { 
                    avatarData: userData.avatar, 
                    timestamp: Date.now(),
                    source: 'auth-state-change'
                  }
                }));
              }
            } else {
              setUser(null);
            }
          }
        );

        // Load initial user data if session exists
        if (session?.user) {
          const userData = await userService.getUserProfile(session.user.id);
          setUser(userData);
          
          // Also trigger avatar update event on initial load
          if (userData) {
            console.log("[AuthContext] Loaded initial user, triggering avatar refresh");
            window.dispatchEvent(new CustomEvent('avatar-updated', { 
              detail: { 
                avatarData: userData.avatar, 
                timestamp: Date.now(),
                source: 'initial-load'
              }
            }));
          }
        }
        
        // Load linked cards
        const cards = bankCardService.getCards();
        setLinkedCards(cards);
        
        setInitialized(true);
      } catch (error) {
        console.error("[AuthContext] Error initializing auth:", error);
        localStorage.removeItem("finsight_user");
        localStorage.removeItem("finsight_linked_cards");
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Check if biometrics are supported
  useEffect(() => {
    setIsBiometricsSupported(window.PublicKeyCredential !== undefined);
  }, []);

  // Check biometric registration status when user changes
  useEffect(() => {
    if (user && isBiometricsSupported) {
      const authService = new AuthService();
      setIsBiometricsRegistered(authService.canUseBiometrics(user));
    } else {
      setIsBiometricsRegistered(false);
    }
  }, [user, isBiometricsSupported]);

  // User profile management
  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    const updateTimeStamp = Date.now();
    setLastUpdateTime(updateTimeStamp);
    
    console.log("[AuthContext] Updating user profile with:", 
      "Name:", updates.name,
      "Has avatar:", !!updates.avatar,
      "Avatar length:", updates.avatar?.length || 0);
    
    if (!user) {
      console.error("[AuthContext] Cannot update profile: No user logged in");
      return;
    }
    
    const updatedUser = await userService.updateProfile(user, updates);
    
    // Only update state if this is the most recent update request
    if (updateTimeStamp >= lastUpdateTime && updatedUser) {
      console.log("[AuthContext] Setting updated user to state:", 
        "Name:", updatedUser.name,
        "Has avatar:", !!updatedUser.avatar,
        "Avatar length:", updatedUser.avatar?.length || 0);
      
      setUser(updatedUser);
      
      // Dispatch event for avatar update to notify all components
      if (updates.avatar !== undefined) {
        console.log("[AuthContext] Avatar updated, dispatching avatar-updated event");
        window.dispatchEvent(new CustomEvent('avatar-updated', { 
          detail: { 
            avatarData: updatedUser.avatar, 
            timestamp: updateTimeStamp,
            source: 'profile-update'
          }
        }));
        
        // Dispatch a second time after a short delay to ensure UI components catch it
        // This helps components that might have missed the first event due to timing
        setTimeout(() => {
          console.log("[AuthContext] Sending delayed avatar-updated event");
          window.dispatchEvent(new CustomEvent('avatar-updated', { 
            detail: { 
              avatarData: updatedUser.avatar, 
              timestamp: updateTimeStamp + 1, 
              source: 'profile-update-delayed'
            }
          }));
        }, 300);
      }
    } else if (!updatedUser) {
      console.error("[AuthContext] Failed to update user profile");
    } else {
      console.log("[AuthContext] Skipped stale user update");
    }
  };

  const completeAccountSetup = async (): Promise<void> => {
    const updateTimeStamp = Date.now();
    setLastUpdateTime(updateTimeStamp);
    
    console.log("[AuthContext] Completing account setup");
    
    if (!user) {
      console.error("[AuthContext] Cannot complete setup: No user logged in");
      return;
    }
    
    const updatedUser = await userService.completeAccountSetup(user);
    
    // Only update state if this is the most recent update request
    if (updateTimeStamp >= lastUpdateTime && updatedUser) {
      console.log("[AuthContext] Setting completed setup user to state:", 
        "Name:", updatedUser.name,
        "Has avatar:", !!updatedUser.avatar,
        "Avatar length:", updatedUser.avatar?.length || 0,
        "Has completed setup:", updatedUser.hasCompletedSetup);
      
      setUser(updatedUser);
      
      // Always dispatch avatar update event when account setup completes
      // This ensures the header and other components show the avatar immediately
      if (updatedUser.avatar) {
        console.log("[AuthContext] Dispatching avatar-updated event after setup completion");
        window.dispatchEvent(new CustomEvent('avatar-updated', { 
          detail: { 
            avatarData: updatedUser.avatar, 
            timestamp: updateTimeStamp,
            source: 'setup-completion'
          }
        }));
        
        // Send another event after a delay to catch any components that missed the first one
        setTimeout(() => {
          console.log("[AuthContext] Sending delayed avatar-updated event after setup completion");
          window.dispatchEvent(new CustomEvent('avatar-updated', { 
            detail: { 
              avatarData: updatedUser.avatar, 
              timestamp: updateTimeStamp + 1,
              source: 'setup-completion-delayed'
            }
          }));
        }, 300);
      }
    } else if (!updatedUser) {
      console.error("[AuthContext] Failed to complete account setup");
    } else {
      console.log("[AuthContext] Skipped stale user update");
    }
  };

  // Card management
  const addBankCard = (card: Omit<BankCard, "id">) => {
    const updatedCards = bankCardService.addCard(card);
    setLinkedCards(updatedCards);
  };

  const removeBankCard = (cardId: string) => {
    const updatedCards = bankCardService.removeCard(cardId);
    setLinkedCards(updatedCards);
  };

  const setDefaultCard = (cardId: string) => {
    const updatedCards = bankCardService.setDefaultCard(cardId);
    setLinkedCards(updatedCards);
  };

  // Biometric authentication methods
  const registerBiometrics = async (): Promise<boolean> => {
    if (!user) {
      console.error("[AuthContext] Cannot register biometrics: No user logged in");
      toast.error("Must be logged in to register biometrics");
      return false;
    }

    const authService = new AuthService();
    const result = await authService.registerBiometrics(user);
    
    if (result) {
      setIsBiometricsRegistered(true);
      toast.success("Biometric authentication registered successfully");
    }
    
    return result;
  };

  const loginWithBiometrics = async (email: string): Promise<boolean> => {
    const authService = new AuthService();
    const loggedInUser = await authService.loginWithBiometrics(email);
    
    if (loggedInUser) {
      setUser(loggedInUser);
      toast.success("Biometric login successful");
      return true;
    }
    
    return false;
  };

  const removeBiometrics = (): boolean => {
    if (!user) {
      console.error("[AuthContext] Cannot remove biometrics: No user logged in");
      toast.error("Must be logged in to remove biometrics");
      return false;
    }
    
    const authService = new AuthService();
    const result = authService.removeBiometrics(user);
    
    if (result) {
      setIsBiometricsRegistered(false);
      toast.success("Biometric authentication removed");
    }
    
    return result;
  };

  // Authentication
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[AuthContext] Login error:", error.message);
        
        // Provide specific messages for common errors
        if (error.message.includes("Email not confirmed")) {
          toast("Email not verified", {
            description: "Please check your email for a verification link or contact support if you didn't receive it.",
          });
          return false;
        } 
        else if (error.message.includes("Invalid login")) {
          toast("Invalid credentials", {
            description: "Please check your email and password.",
          });
          return false;
        } 
        // Handle other errors
        else {
          toast("Login error", {
            description: error.message || "An unexpected error occurred during login."
          });
          return false;
        }
      }

      // Successfully logged in
      toast("Login successful", {
        description: "Welcome back!"
      });
      return true;
    } catch (e) {
      console.error("[AuthContext] Unexpected login error:", e);
      toast("Login failed", {
        description: "An unexpected error occurred. Please try again later.",
      });
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) {
        console.error("[AuthContext] Signup error:", error.message);
        toast("Signup error", {
          description: error.message || "An unexpected error occurred during signup."
        });
        return false;
      }

      if (data?.user && !data.session) {
        // This means email confirmation is required
        toast("Verification required", {
          description: "A verification link has been sent to your email address.",
        });
      }

      return true;
    } catch (e) {
      console.error("[AuthContext] Unexpected signup error:", e);
      toast("Signup failed", {
        description: "An unexpected error occurred. Please try again later.",
      });
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    userService.logout(); // Clear local storage
    setUser(null);
  };

  // Check if user needs to complete account setup
  const needsAccountSetup = user !== null && user.hasCompletedSetup !== true;

  // Only render children once we've checked localStorage and Supabase
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
    loading,
    // Add new biometric methods
    registerBiometrics,
    loginWithBiometrics,
    removeBiometrics,
    isBiometricsSupported,
    isBiometricsRegistered
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
