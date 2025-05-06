
import { useState, useEffect } from "react";
import { User } from "../../../types/user";
import { BankCard } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { UserService } from "../UserService";
import { BankCardService } from "../BankCardService";

export function useAuthInitializer(
  userService: UserService,
  bankCardService: BankCardService,
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setLinkedCards: React.Dispatch<React.SetStateAction<BankCard[]>>
) {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

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
              
              // Force update avatar state when user is updated
              if (userData) {
                console.log("[AuthContext] Updated user from auth state change, triggering avatar refresh");
                // Use a custom event to notify components about avatar updates
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
          setUser(userData);
          
          // Also trigger avatar update event on initial load
          if (userData) {
            console.log("[AuthContext] Loaded initial user, triggering avatar refresh");
            window.dispatchEvent(new CustomEvent('avatar-updated', { 
              detail: { 
                avatarData: userData.avatar, 
                timestamp: Date.now(),
                source: 'initial-load'
              }
            }));
          }
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
  }, [userService, bankCardService, setUser, setLinkedCards]);

  return { initialized, loading };
}
