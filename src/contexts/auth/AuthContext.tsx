
import React, { useState } from "react";
import { User } from "../../types/user";
import { AuthContextType, BankCard } from "./types";
import { UserService } from "./UserService";
import { BankCardService } from "./BankCardService";
import { useAuthInitializer } from "./hooks/useAuthInitializer";
import { useAuthMethods } from "./hooks/useAuthMethods";
import { useCardManagement } from "./hooks/useCardManagement";
import { useProfileManager } from "./hooks/useProfileManager";

// Create the context
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Hook for using the auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [linkedCards, setLinkedCards] = useState<BankCard[]>([]);
  
  // Initialize services
  const userService = new UserService();
  const bankCardService = new BankCardService();

  // Initialize auth state with custom hooks
  const { initialized, loading } = useAuthInitializer(
    userService, 
    bankCardService, 
    setUser, 
    setLinkedCards
  );

  // User profile management
  const { updateUserProfile, completeAccountSetup } = useProfileManager(
    user,
    setUser,
    userService
  );

  // Authentication methods
  const { login, signup, logout } = useAuthMethods(userService);

  // Card management
  const { addBankCard, removeBankCard, setDefaultCard } = useCardManagement(
    bankCardService, 
    setLinkedCards
  );

  // Check if user needs to complete account setup
  const needsAccountSetup = user !== null && user.hasCompletedSetup !== true;

  // Only render children once we've checked localStorage and Supabase
  if (!initialized) {
    return null;
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

// Re-export for easy import elsewhere
export * from './types';
