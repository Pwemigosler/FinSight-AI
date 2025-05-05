
import React, { createContext, useContext, ReactNode } from "react";
import { AuthContextType } from "./types";
import { useAuthState } from "./hooks/useAuthState";
import { useProfileActions } from "./hooks/useProfileActions";
import { useCardActions } from "./hooks/useCardActions";
import { useAuthentication } from "./hooks/useAuthentication";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // State management
  const {
    user,
    setUser,
    linkedCards,
    setLinkedCards,
    initialized,
    loading,
    lastUpdateTime,
    setLastUpdateTime
  } = useAuthState();

  // Profile actions
  const { updateUserProfile, completeAccountSetup } = useProfileActions(
    user,
    setUser,
    lastUpdateTime,
    setLastUpdateTime
  );

  // Card management
  const { addBankCard, removeBankCard, setDefaultCard } = useCardActions(setLinkedCards);
  
  // Authentication
  const { login, signup, logout: authLogout } = useAuthentication();

  // Combined logout function
  const logout = async () => {
    await authLogout();
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
