import { debugLog } from '@/utils/debug';
import { useState, useEffect } from "react";
import { User } from "../../../types/user";
import { BankCard } from "../types";
import { UserService } from "../UserService";
import { BankCardService } from "../BankCardService";
import { AuthService } from "../services/AuthService";
import { supabase } from "@/integrations/supabase/client";

// --- Mapping function to fix snake_case to camelCase
function mapProfileFields(
  profile: (Partial<User> & { has_completed_setup?: boolean }) | null
): User | null {
  if (!profile) return null;
  const { has_completed_setup, ...rest } = profile;
  return {
    ...(rest as User),
    hasCompletedSetup: has_completed_setup,
  };
}

type UseAuthInitializationResult = {
  user: User | null;
  linkedCards: BankCard[];
  initialized: boolean;
  loading: boolean;
  isBiometricsSupported: boolean;
  isBiometricsRegistered: boolean;
  lastUpdateTime: number;
};

export const useAuthInitialization = (): UseAuthInitializationResult => {
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
  const authService = new AuthService();

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        debugLog("[useAuthInitialization] Supabase session:", session);

        // Set up auth change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            debugLog("[useAuthInitialization] Auth state changed:", _event, newSession);
            if (newSession?.user) {
              const userData = await userService.getUserProfile(newSession.user.id);
              debugLog("[useAuthInitialization] Got user profile from state change:", userData);
              setUser(mapProfileFields(userData));
              if (userData) {
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
          debugLog("[useAuthInitialization] Got initial user profile:", userData);
          setUser(mapProfileFields(userData));
          if (userData) {
            window.dispatchEvent(new CustomEvent('avatar-updated', {
              detail: {
                avatarData: userData.avatar,
                timestamp: Date.now(),
                source: 'initial-load'
              }
            }));
          }
        } else {
          debugLog("[useAuthInitialization] No session user found.");
        }

        // Load linked cards
        const cards = bankCardService.getCards();
        setLinkedCards(cards);

        setInitialized(true);
      } catch (error) {
        console.error("[useAuthInitialization] Error initializing auth:", error);
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
    const checkBiometricStatus = async () => {
      if (user && isBiometricsSupported) {
        const canUseBiometrics = await authService.canUseBiometrics(user);
        setIsBiometricsRegistered(canUseBiometrics);
      } else {
        setIsBiometricsRegistered(false);
      }
    };

    checkBiometricStatus();
  }, [user, isBiometricsSupported]);

  // LOG current user info:
  useEffect(() => {
    debugLog("[useAuthInitialization] Final user:", user);
  }, [user]);

  return {
    user,
    linkedCards,
    initialized,
    loading,
    isBiometricsSupported,
    isBiometricsRegistered,
    lastUpdateTime
  };
};
