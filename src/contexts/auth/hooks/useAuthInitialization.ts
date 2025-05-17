
import { useState, useEffect, useCallback } from "react";
import { User } from "../../../types/user";
import { BankCard } from "../types";
import { UserService } from "../UserService";
import { BankCardService } from "../BankCardService";
import { AuthService } from "../services/AuthService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  // Function to load and update user data
  const updateUserData = useCallback(async (userId: string) => {
    try {
      console.log("[AuthInit] Loading user data for:", userId);
      const userData = await userService.getUserProfile(userId);
      
      if (userData) {
        console.log("[AuthInit] User data loaded successfully");
        setUser(userData);
        
        // Trigger avatar update event
        window.dispatchEvent(new CustomEvent('avatar-updated', { 
          detail: { 
            avatarData: userData.avatar, 
            timestamp: Date.now(),
            source: 'auth-initialization'
          }
        }));
      } else {
        console.warn("[AuthInit] Failed to load user data");
      }
    } catch (error) {
      console.error("[AuthInit] Error loading user data:", error);
    }
  }, [userService]);

  // Initialize auth state with Supabase session
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Get the current session
        console.log("[AuthInit] Checking for existing session");
        const { data: { session } } = await supabase.auth.getSession();
        
        // Set up auth state listener
        console.log("[AuthInit] Setting up auth state listener");
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            console.log("[AuthInit] Auth state changed, event:", _event);
            
            if (newSession?.user) {
              console.log("[AuthInit] New session detected, updating user data");
              // Don't call updateUserData directly in the callback to avoid deadlocks
              setTimeout(() => updateUserData(newSession.user!.id), 0);
            } else {
              console.log("[AuthInit] No session in auth state change");
              setUser(null);
            }
          }
        );

        // Load initial user data if session exists
        if (session?.user) {
          console.log("[AuthInit] Existing session found, loading initial user data");
          await updateUserData(session.user.id);
        } else {
          console.log("[AuthInit] No existing session found");
          // Check for local storage user as fallback
          const localUser = userService.getStoredUser();
          if (localUser) {
            console.log("[AuthInit] Found user in local storage, attempting to restore session");
            // We found a user in local storage but no active session
            // This indicates a potential sync issue - clear the local storage
            userService.logout();
            toast.info("Your session has expired. Please sign in again.");
          }
        }
        
        // Load linked cards
        const cards = bankCardService.getCards();
        setLinkedCards(cards);
        
        setInitialized(true);
      } catch (error) {
        console.error("[AuthInit] Error initializing auth:", error);
        localStorage.removeItem("finsight_user");
        localStorage.removeItem("finsight_linked_cards");
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [userService, bankCardService, updateUserData]);

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
  }, [user, isBiometricsSupported, authService]);

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
