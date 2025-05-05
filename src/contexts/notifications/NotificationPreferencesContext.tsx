
import { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  monthlyReport: boolean;
  newFeatures: boolean;
}

interface NotificationPreferencesContextType {
  preferences: NotificationPreferences;
  updatePreference: (key: keyof NotificationPreferences, value: boolean) => void;
  savePreferences: () => void;
}

const defaultPreferences: NotificationPreferences = {
  email: true,
  push: false,
  monthlyReport: true,
  newFeatures: true
};

const NotificationPreferencesContext = createContext<NotificationPreferencesContextType | undefined>(undefined);

export const NotificationPreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Load preferences from localStorage on mount
  useEffect(() => {
    const storedPreferences = localStorage.getItem('notificationPreferences');
    if (storedPreferences) {
      try {
        setPreferences(JSON.parse(storedPreferences));
      } catch (error) {
        console.error('Failed to parse notification preferences', error);
      }
    }
  }, []);

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const savePreferences = () => {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    setHasChanges(false);
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated."
    });
  };

  return (
    <NotificationPreferencesContext.Provider value={{ preferences, updatePreference, savePreferences }}>
      {children}
    </NotificationPreferencesContext.Provider>
  );
};

export const useNotificationPreferences = () => {
  const context = useContext(NotificationPreferencesContext);
  if (context === undefined) {
    throw new Error('useNotificationPreferences must be used within a NotificationPreferencesProvider');
  }
  return context;
};
