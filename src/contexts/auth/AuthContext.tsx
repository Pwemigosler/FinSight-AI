
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { User } from "../../types/user";
import { AuthContextType, BankCard } from "./types";
import { useAuthInitialization } from "./hooks/useAuthInitialization";
import { useProfileManagement } from "./hooks/useProfileManagement";
import { useCardManagement } from "./hooks/useCardManagement";
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
  // Use custom hooks to manage different aspects of authentication
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  
  const { 
    user, 
    linkedCards, 
    initialized, 
    loading, 
    isBiometricsSupported, 
    isBiometricsRegistered,
  } = useAuthInitialization();
  
  const [userData, setUserData] = useState<User | null>(user);
  const [linkedCardsData, setLinkedCardsData] = useState<BankCard[]>(linkedCards);
  
  // Update state when initialization completes
  React.useEffect(() => {
    if (initialized) {
      setUserData(user);
      setLinkedCardsData(linkedCards);
    }
  }, [initialized, user, linkedCards]);
  
  const { updateUserProfile, completeAccountSetup } = useProfileManagement({
    user: userData,
    lastUpdateTime,
    setLastUpdateTime
  });
  
  const { addBankCard, removeBankCard, setDefaultCard, refreshCards, isLoading: cardsLoading } = useCardManagement({
    setLinkedCards: setLinkedCardsData,
    userId: userData?.id || null
  });
  
  // When userId changes, refresh cards to ensure they're properly encrypted
  React.useEffect(() => {
    if (userData?.id) {
      refreshCards().catch(console.error);
    }
  }, [userData?.id, refreshCards]);
  
  const { 
    login, 
    signup, 
    logout,
    loginWithBiometrics,
    registerBiometrics,
    removeBiometrics
  } = useAuthentication({
    setUser: setUserData
  });

  // Check if user needs to complete account setup
  const needsAccountSetup = userData !== null && userData.hasCompletedSetup !== true;

  // Only render children once we've checked localStorage and Supabase
  if (!initialized) {
    return null; // Or a loading spinner
  }

  const value = {
    user: userData,
    login,
    signup,
    logout,
    isAuthenticated: !!userData,
    updateUserProfile,
    linkedCards: linkedCardsData,
    addBankCard,
    removeBankCard,
    setDefaultCard,
    completeAccountSetup,
    needsAccountSetup,
    loading: loading || cardsLoading,
    // Biometric methods
    registerBiometrics,
    loginWithBiometrics,
    removeBiometrics,
    isBiometricsSupported,
    isBiometricsRegistered
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
