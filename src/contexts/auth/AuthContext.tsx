
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { User } from "../../types/user";
import { AuthContextType, BankCard } from "./types";
import { UserService } from "./UserService";
import { BankCardService } from "./BankCardService";

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
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  
  // Initialize services
  const userService = new UserService();
  const bankCardService = new BankCardService();

  // Load user data and linked cards from localStorage on mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
        // Load user data
        const savedUser = userService.getStoredUser();
        setUser(savedUser);
        
        // Load linked cards
        const cards = bankCardService.getCards();
        setLinkedCards(cards);
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

  // Add a periodic check for localStorage changes
  useEffect(() => {
    if (!initialized) return;
    
    // Check for user data changes in localStorage that might have been made by other components
    const checkInterval = setInterval(() => {
      try {
        const storedUser = userService.getStoredUser();
        
        // If there's no current user or the localStorage user is newer (determined by timestamps)
        if (
          (storedUser && !user) ||
          (storedUser && user && 
           JSON.stringify(storedUser) !== JSON.stringify(user))
        ) {
          console.log("[AuthContext] Detected user change in localStorage, updating state");
          setUser(storedUser);
        }
      } catch (error) {
        console.error("[AuthContext] Error checking localStorage:", error);
      }
    }, 1000); // Check every second
    
    return () => clearInterval(checkInterval);
  }, [initialized, user]);

  // User profile management
  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    const updateTimeStamp = Date.now();
    setLastUpdateTime(updateTimeStamp);
    
    console.log("[AuthContext] Updating user profile with:", 
      "Name:", updates.name,
      "Has avatar:", !!updates.avatar,
      "Avatar length:", updates.avatar?.length || 0);
    
    const updatedUser = await userService.updateProfile(user, updates);
    
    // Only update state if this is the most recent update request
    // This prevents race conditions where older updates override newer ones
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
    const loggedInUser = await userService.login(email, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    const newUser = await userService.signup(name, email, password);
    if (newUser) {
      setUser(newUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    userService.logout();
    setUser(null);
  };

  // Check if user needs to complete account setup
  const needsAccountSetup = user !== null && user.hasCompletedSetup !== true;

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
