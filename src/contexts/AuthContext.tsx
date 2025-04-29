
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  hasCompletedSetup?: boolean;
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
  completeAccountSetup: () => void;
  needsAccountSetup: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [linkedCards, setLinkedCards] = useState<BankCard[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load user data and linked cards from localStorage on mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
        // Load user data
        const savedUser = localStorage.getItem("finsight_user");
        const parsedUser = savedUser ? JSON.parse(savedUser) : null;
        setUser(parsedUser);
        
        // Load linked cards
        const savedCards = localStorage.getItem("finsight_linked_cards");
        const parsedCards = savedCards ? JSON.parse(savedCards) : [];
        setLinkedCards(parsedCards);
      } catch (error) {
        console.error("Error loading stored auth data:", error);
        // If there's an error parsing, reset the storage
        localStorage.removeItem("finsight_user");
        localStorage.removeItem("finsight_linked_cards");
      } finally {
        setInitialized(true);
      }
    };

    loadStoredData();
  }, []);

  // Function to update user profile
  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("finsight_user", JSON.stringify(updatedUser));
    toast("Profile updated successfully");
  };

  // Function to mark account setup as complete
  const completeAccountSetup = () => {
    if (!user) return;
    
    const updatedUser = { ...user, hasCompletedSetup: true };
    setUser(updatedUser);
    localStorage.setItem("finsight_user", JSON.stringify(updatedUser));
    toast("Account setup completed!");
  };

  // Check if user needs to complete account setup
  const needsAccountSetup = user !== null && user.hasCompletedSetup !== true;

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
      
      // In a real app, this would validate against a backend service
      // For now, we're just simulating login with mock data
      const mockUser = {
        id: "user-123",
        name: email.split('@')[0] || "User",
        email: email,
        avatar: "",
      };
      
      setUser(mockUser);
      localStorage.setItem("finsight_user", JSON.stringify(mockUser));
      
      // Also store a login timestamp to potentially expire the session after some time
      localStorage.setItem("finsight_login_timestamp", Date.now().toString());
      
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
      
      // In a real app, this would create a user in a backend service
      // For now, we're just simulating signup with mock data
      const mockUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        avatar: "",
        hasCompletedSetup: false // New users haven't completed setup
      };
      
      setUser(mockUser);
      localStorage.setItem("finsight_user", JSON.stringify(mockUser));
      
      // Store login timestamp
      localStorage.setItem("finsight_login_timestamp", Date.now().toString());
      
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
    // Don't remove linked cards on logout to preserve user preferences
    localStorage.removeItem("finsight_user");
    localStorage.removeItem("finsight_login_timestamp");
    toast("You have been logged out");
  };

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
