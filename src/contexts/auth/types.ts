
import { User } from "../../types/user";

export type BankCard = {
  id: string;
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  isDefault: boolean;
  cardType?: string; // visa, mastercard, etc.
};

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  linkedCards: BankCard[];
  addBankCard: (card: Omit<BankCard, "id">) => void;
  removeBankCard: (cardId: string) => void;
  setDefaultCard: (cardId: string) => void;
  completeAccountSetup: () => Promise<void>;
  needsAccountSetup: boolean;
  loading: boolean;
  // Updated biometric methods with proper return types
  registerBiometrics: () => Promise<{success: boolean; error?: string} | boolean>;
  loginWithBiometrics: (email: string) => Promise<boolean>;
  removeBiometrics: () => boolean;
  isBiometricsSupported: boolean;
  isBiometricsRegistered: boolean;
};
