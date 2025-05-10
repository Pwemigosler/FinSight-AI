
import { User } from "../../types/user";

export interface BankCard {
  id: string;
  last4: string;
  bank: string;
  type: string;
  isDefault: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  linkedCards: BankCard[];
  addBankCard: (card: Omit<BankCard, "id">) => void;
  removeBankCard: (cardId: string) => void;
  setDefaultCard: (cardId: string) => void;
  completeAccountSetup: () => Promise<void>;
  needsAccountSetup: boolean;
  loading: boolean;
  
  // Biometric authentication methods
  registerBiometrics: () => Promise<boolean>;
  loginWithBiometrics: (email: string) => Promise<boolean>;
  removeBiometrics: () => boolean;
  isBiometricsSupported: boolean;
  isBiometricsRegistered: boolean;
}
