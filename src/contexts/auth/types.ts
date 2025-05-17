import { User } from "../../types/user";

export type BankCard = {
  id: string;
  userId: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  isDefault: boolean;
};

export type AccountSetupData = {
  billingAddress: string;
  phoneNumber: string;
};

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUserProfile: (updatedProfile: Partial<User>) => Promise<User | null>;
  linkedCards: BankCard[];
  addBankCard: (cardDetails: Omit<BankCard, "id">) => Promise<BankCard | null>;
  removeBankCard: (cardId: string) => Promise<boolean>;
  setDefaultCard: (cardId: string) => Promise<boolean>;
  completeAccountSetup: (profileData: AccountSetupData) => Promise<boolean>;
  needsAccountSetup: boolean;
  loading: boolean;
  isLoading: boolean; // Add this property to match what's being used in Login.tsx
  // Biometric authentication methods
  registerBiometrics: () => Promise<{ success: boolean; error?: string } | boolean>;
  loginWithBiometrics: (email: string) => Promise<boolean>;
  removeBiometrics: () => Promise<boolean>;
  isBiometricsSupported: boolean;
  isBiometricsRegistered: boolean;
};
