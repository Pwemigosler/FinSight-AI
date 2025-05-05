
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { User } from "../../types/user";
import { AuthContextType, BankCard } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { UserService } from "./UserService";
import { BankCardService } from "./BankCardService";
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
            } else {
              setUser(null);
            }
          }
        );

        // Load initial user data if session exists
        if (session?.user) {
          const userData = await userService.getUserProfile(session.user.id);
          setUser(userData);
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
        } else if (error.message.includes("Invalid login")) {
          toast("Invalid credentials", {
            description: "Please check your email and password.",
          });
        } else {
          toast("Login error", {
            description: error.message || "An unexpected error occurred during login."
          });
        }
        
        return false;
      }

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
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
