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
  // State for the last profile update time
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);

  // Get basic auth/user/card state from custom hooks
  const {
    user,
    linkedCards,
    initialized,
    loading,
    isBiometricsSupported,
    isBiometricsRegistered,
  } = useAuthInitialization();

  // Context-level user/card state that can be updated by profile management
  const [userData, setUserData] = useState<User | null>(user);
  const [linkedCardsData, setLinkedCardsData] = useState<BankCard[]>(linkedCards);

  // Keep userData/linkedCardsData in sync with initialization
  useEffect(() => {
    if (initialized) {
      setUserData(user);
      setLinkedCardsData(linkedCards);
    }
  }, [initialized, user, linkedCards]);

  // --- UPDATE: Pass setUserData to useProfileManagement
  const { updateUserProfile, completeAccountSetup } = useProfileManagement({
    user: userData,
    lastUpdateTime,
    setLastUpdateTime,
    setUser: setUserData, // ensures account setup updates context state!
  });

  const {
    addBankCard,
    removeBankCard,
    setDefaultCard,
    refreshCards,
    isLoading: cardsLoading,
  } = useCardManagement({
    setLinkedCards: setLinkedCardsData,
    userId: userData?.id || null,
  });

  // Refresh cards when the userId changes
  useEffect(() => {
    if (userData?.id) {
      refreshCards().catch(console.error);
    }
  }, [userData?.id, refreshCards]);

  // Auth actions (login, signup, logout, biometrics, etc.)
  const {
    login,
    signup,
    logout,
    loginWithBiometrics,
    registerBiometrics,
    removeBiometrics,
  } = useAuthentication({
    setUser: setUserData,
  });

  // Should the user be forced through account setup?
  const needsAccountSetup = userData !== null && userData.hasCompletedSetup !== true;

  // --- LOGGING: Show state every render for debugging ---
  console.log(
    "[AuthProvider] userData:", userData,
    "| needsAccountSetup:", needsAccountSetup,
    "| initialized:", initialized
  );

  // Wait for initialization (prevents flashing/loading bugs)
  if (!initialized) {
    return null; // or a loading spinner if you prefer
  }

  // Everything the app needs in the auth context
  const value: AuthContextType = {
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
    isBiometricsRegistered,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
