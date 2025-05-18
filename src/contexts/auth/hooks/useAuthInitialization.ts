
import { useState, useEffect, useCallback } from "react";
import { User } from "../../../types/user";
import { BankCard } from "../types";
import { UserService } from "../UserService";
import { BankCardService } from "../services/BankCardService";
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
  const bankCardService = new BankCardService(""); // Fix: Pass empty string as userId
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
    let authSubscription: { unsubscribe: () => void } | null = null;
    let timeoutId: number | null = null;
    
    const initializeAuth = async () => {
      setLoading(true);
      
      // Circuit breaker - after 5 seconds, mark as initialized to prevent infinite loading
      timeoutId = window.setTimeout(() => {
        if (!initialized) {
          console.warn("[AuthInit] Circuit breaker activated - initialization taking too long");
          setLoading(false);
          setInitialized(true);
        }
      }, 5000);
      
      try {
        console.log("[AuthInit] Checking for existing session");
        
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            console.log("[AuthInit] Auth state changed, event:", event);
            
            if (newSession?.user) {
              console.log("[AuthInit] New session detected, updating user data");
              // Avoid deadlock by using setTimeout
              setTimeout(() => updateUserData(newSession.user!.id), 0);
            } else {
              console.log("[AuthInit] No session in auth state change");
              setUser(null);
            }
          }
        );
        
        // Store subscription so we can clean it up later
        authSubscription = subscription;
        
        // THEN check for existing session
        const { data: { session } } = await supabase.auth.getSession();

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
        try {
          // Fix: Use an async/await pattern and then set state with the resolved value
          const cards = await bankCardService.getCards();
          setLinkedCards(cards);
        } catch (cardError) {
          console.error("[AuthInit] Error loading card data:", cardError);
          // Don't block initialization due to card loading failures
          setLinkedCards([]);
        }
      } catch (error) {
        console.error("[AuthInit] Error initializing auth:", error);
        localStorage.removeItem("finsight_user");
        localStorage.removeItem("finsight_linked_cards");
      } finally {
        // Clear timeout if we're done before the circuit breaker kicks in
        if (timeoutId) window.clearTimeout(timeoutId);
        
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
    
    // Cleanup function
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, [userService, bankCardService, updateUserData]);

  // Check if biometrics are supported
  useEffect(() => {
    setIsBiometricsSupported(window.PublicKeyCredential !== undefined);
  }, []);

  // Check biometric registration status when user changes
  useEffect(() => {
    const checkBiometricStatus = async () => {
      if (user && isBiometricsSupported) {
        try {
          const canUseBiometrics = await authService.canUseBiometrics(user);
          setIsBiometricsRegistered(canUseBiometrics);
        } catch (error) {
          console.error("[AuthInit] Error checking biometrics:", error);
          setIsBiometricsRegistered(false);
        }
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
