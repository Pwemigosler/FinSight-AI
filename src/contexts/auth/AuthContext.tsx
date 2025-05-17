
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { User } from "../../types/user";
import { AuthContextType, BankCard, AccountSetupData } from "./types";
import { useAuthInitialization } from "./hooks/useAuthInitialization";
import { useProfileManagement } from "./hooks/useProfileManagement";
import { useCardManagement } from "./hooks/useCardManagement";
import { useAuthentication } from "./hooks/useAuthentication";
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
  // Use custom hooks to manage different aspects of authentication
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  const [initError, setInitError] = useState<string | null>(null);
  
  const { 
    user, 
    linkedCards, 
    initialized, 
    loading: initLoading, 
    isBiometricsSupported, 
    isBiometricsRegistered,
  } = useAuthInitialization();
  
  const [userData, setUserData] = useState<User | null>(user);
  const [linkedCardsData, setLinkedCardsData] = useState<BankCard[]>(linkedCards);
  
  // Update state when initialization completes
  useEffect(() => {
    if (initialized) {
      try {
        setUserData(user);
        setLinkedCardsData(linkedCards);
      } catch (error) {
        console.error("[AuthContext] Error updating user data after initialization:", error);
        setInitError("Failed to initialize user data");
      }
    }
  }, [initialized, user, linkedCards]);
  
  const { updateUserProfile, completeAccountSetup } = useProfileManagement({
    user: userData,
    lastUpdateTime,
    setLastUpdateTime,
    setUserData // Pass the setter function to the hook
  });
  
  const { addBankCard, removeBankCard, setDefaultCard, refreshCards, isLoading: cardsLoading } = useCardManagement({
    setLinkedCards: setLinkedCardsData,
    userId: userData?.id || null
  });
  
  // When userId changes, refresh cards to ensure they're properly encrypted
  useEffect(() => {
    if (userData?.id) {
      refreshCards().catch(error => {
        console.error("[AuthContext] Error refreshing cards:", error);
      });
    }
  }, [userData?.id, refreshCards]);
  
  const { 
    login, 
    signup, 
    logout,
    loginWithBiometrics,
    registerBiometrics,
    removeBiometrics,
    isLoading: authActionLoading
  } = useAuthentication({
    setUser: setUserData
  });

  // Combine all loading states
  const loading = initLoading || cardsLoading || authActionLoading;
  // Add isLoading as an alias to loading to match what's being used in Login.tsx
  const isLoading = loading;

  // Check if user needs to complete account setup
  const needsAccountSetup = userData !== null && userData.hasCompletedSetup !== true;

  // Only render children once we've checked localStorage and Supabase
  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-finsight-purple border-t-transparent"></div>
          <p className="text-sm text-gray-500">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <div className="text-red-500 text-3xl mb-2">⚠️</div>
          <p className="font-semibold text-red-500">Authentication Error</p>
          <p className="text-sm text-gray-600 mb-4">{initError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }

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
    loading,
    isLoading, // Add isLoading as an alias to loading
    // Biometric methods
    registerBiometrics,
    loginWithBiometrics,
    removeBiometrics,
    isBiometricsSupported,
    isBiometricsRegistered
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
