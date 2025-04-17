
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
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserProfile: (updates: Partial<User>) => void;
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

  // Function to update user profile
  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("finsight_user", JSON.stringify(updatedUser));
    toast("Profile updated successfully");
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
