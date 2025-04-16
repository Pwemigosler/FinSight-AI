
import React, { createContext, useState, useContext, ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login functionality - in a real app this would call an API
    try {
      // Simple validation
      if (!email || !password) {
        toast("Please enter both email and password");
        return false;
      }
      
      // Mock successful login
      const mockUser = {
        id: "user-123",
        name: "John Doe",
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem("finsight_user");
    toast("You have been logged out");
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
