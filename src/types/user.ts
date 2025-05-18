
// This file defines the types for user data in the application

export interface AvatarSettings {
  zoom: number;
  position: {
    x: number;
    y: number;
  };
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  compactView?: boolean;
  assistantCharacter?: string;
  notifications?: boolean;
  currencyFormat?: string;
  dateFormat?: string;
  emailNotifications?: boolean;
  appNotifications?: boolean;
  language?: string;
  speechEnabled?: boolean;
  billingAddress?: string; // Added for account setup
  phoneNumber?: string; // Added for account setup
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  avatarSettings?: AvatarSettings;
  preferences?: UserPreferences;
  role?: 'user' | 'admin';
  hasCompletedSetup?: boolean;
}
