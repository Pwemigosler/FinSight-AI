
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

  // User profile management
  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    const updatedUser = await userService.updateProfile(user, updates);
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  const completeAccountSetup = async (): Promise<void> => {
    const updatedUser = await userService.completeAccountSetup(user);
    if (updatedUser) {
      setUser(updatedUser);
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
