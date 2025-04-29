
import React, { createContext, useState, useContext, ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface BankCard {
  id: string;
  last4: string;
  bank: string;
  type: string;
  isDefault: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserProfile: (updates: Partial<User>) => void;
  linkedCards: BankCard[];
  addBankCard: (card: Omit<BankCard, "id">) => void;
  removeBankCard: (cardId: string) => void;
  setDefaultCard: (cardId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("finsight_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [linkedCards, setLinkedCards] = useState<BankCard[]>(() => {
    const savedCards = localStorage.getItem("finsight_linked_cards");
    return savedCards ? JSON.parse(savedCards) : [];
  });

  // Function to update user profile
  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("finsight_user", JSON.stringify(updatedUser));
    toast("Profile updated successfully");
  };

  // Function to add a new bank card
  const addBankCard = (card: Omit<BankCard, "id">) => {
    const newCard = {
      ...card,
      id: `card-${Date.now()}` // Generate a unique ID
    };
    
    const updatedCards = [...linkedCards];
    
    // If this is the first card or isDefault is true, make it the default
    if (updatedCards.length === 0 || newCard.isDefault) {
      // Set all other cards to non-default
      updatedCards.forEach(c => c.isDefault = false);
    }
    
    updatedCards.push(newCard);
    setLinkedCards(updatedCards);
    localStorage.setItem("finsight_linked_cards", JSON.stringify(updatedCards));
    toast("Bank card linked successfully");
  };

  // Function to remove a bank card
  const removeBankCard = (cardId: string) => {
    const updatedCards = linkedCards.filter(card => card.id !== cardId);
    
    // If we removed the default card and there are other cards, set a new default
    if (linkedCards.find(c => c.id === cardId)?.isDefault && updatedCards.length > 0) {
      updatedCards[0].isDefault = true;
    }
    
    setLinkedCards(updatedCards);
    localStorage.setItem("finsight_linked_cards", JSON.stringify(updatedCards));
    toast("Bank card removed");
  };

  // Function to set a card as default
  const setDefaultCard = (cardId: string) => {
    const updatedCards = linkedCards.map(card => ({
      ...card,
      isDefault: card.id === cardId
    }));
    
    setLinkedCards(updatedCards);
    localStorage.setItem("finsight_linked_cards", JSON.stringify(updatedCards));
    toast("Default payment method updated");
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email || !password) {
        toast("Please enter both email and password");
        return false;
      }
      
      const mockUser = {
        id: "user-123",
        name: email.split('@')[0] || "User",
        email: email,
        avatar: "",
      };
      
      setUser(mockUser);
      localStorage.setItem("finsight_user", JSON.stringify(mockUser));
      toast("Successfully logged in");
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast("Login failed. Please try again.");
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      if (!name || !email || !password) {
        toast("Please fill in all fields");
        return false;
      }
      
      if (password.length < 6) {
        toast("Password must be at least 6 characters long");
        return false;
      }
      
      const mockUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        avatar: "",
      };
      
      setUser(mockUser);
      localStorage.setItem("finsight_user", JSON.stringify(mockUser));
      toast("Successfully signed up!");
      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      toast("Signup failed. Please try again.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("finsight_user");
    toast("You have been logged out");
  };

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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
