
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AvatarState } from '@/components/avatars/types/avatar-types';
import { analyze } from '@/utils/sentimentAnalysis';
import { useAuth } from './auth';

// Update context type to include speech toggle
type AvatarContextType = {
  avatarState: AvatarState;
  characterId: string;
  setAvatarState: (state: AvatarState) => void;
  setCharacterId: (id: string) => void;
  reactToMessage: (message: string) => void;
  speakMessage: (message: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  speechEnabled: boolean;
  toggleSpeech: () => void;
};

// Create the context
const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

interface AvatarProviderProps {
  children: ReactNode;
  initialCharacterId?: string;
}

export const AvatarProvider: React.FC<AvatarProviderProps> = ({ 
  children, 
  initialCharacterId = 'fin' 
}) => {
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [characterId, setCharacterId] = useState<string>(initialCharacterId);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechSynth, setSpeechSynth] = useState<SpeechSynthesis | null>(null);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  
  // Try to get auth context, but provide fallbacks if not available yet
  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    console.error("Error accessing AuthContext:", error);
    auth = null;
  }
  
  const user = auth?.user || null;
  const updateUserProfile = auth?.updateUserProfile || (async () => {
    console.warn('updateUserProfile not available');
    return null;
  });

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynth(window.speechSynthesis);
    }
  }, []);

  // Load user's speech preference
  useEffect(() => {
    if (user?.preferences?.speechEnabled !== undefined) {
      setSpeechEnabled(user.preferences.speechEnabled);
    }
  }, [user]);

  const toggleSpeech = async () => {
    const newSpeechEnabled = !speechEnabled;
    setSpeechEnabled(newSpeechEnabled);
    
    // Stop any ongoing speech when disabled
    if (!newSpeechEnabled) {
      stopSpeaking();
    }

    // Update user preferences in database
    if (user) {
      try {
        await updateUserProfile({
          preferences: {
            ...user.preferences,
            speechEnabled: newSpeechEnabled
          }
        });
      } catch (error) {
        console.error('Failed to update speech preference:', error);
      }
    }
  };

  // Modified speakMessage to respect speech preference
  const speakMessage = (message: string) => {
    if (!speechEnabled || !speechSynth) return;
    
    // Cancel any ongoing speech
    speechSynth.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(message);
    
    // Set voice to a friendly one if available
    const voices = speechSynth.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Google') || 
      voice.name.includes('Samantha')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Set properties
    utterance.pitch = 1.1;
    utterance.rate = 1.0;
    
    // Set up event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setAvatarState('speaking');
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setAvatarState('idle');
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setAvatarState('confused');
    };
    
    // Start speaking
    speechSynth.speak(utterance);
  };

  // Reset to idle after expressions
  useEffect(() => {
    if (avatarState === 'happy' || avatarState === 'confused' || avatarState === 'speaking') {
      const timer = setTimeout(() => {
        setAvatarState('idle');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [avatarState]);

  // Analyze sentiment in a message and set appropriate avatar state
  const reactToMessage = (message: string) => {
    try {
      // Basic sentiment analysis
      const result = analyze(message);
      
      // Map sentiment score to avatar state
      if (result.score > 2) {
        setAvatarState('happy');
      } else if (result.score < -2) {
        setAvatarState('confused');
      } else if (result.score === 0 && message.includes('?')) {
        setAvatarState('thinking');
      } else {
        // For neutral messages, maintain current state or go to idle
        if (avatarState !== 'speaking' && avatarState !== 'thinking') {
          setAvatarState('idle');
        }
      }
    } catch (error) {
      console.error('Error analyzing message sentiment:', error);
    }
  };

  // Stop any ongoing speech
  const stopSpeaking = () => {
    if (speechSynth) {
      speechSynth.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <AvatarContext.Provider
      value={{
        avatarState,
        characterId,
        setAvatarState,
        setCharacterId,
        reactToMessage,
        speakMessage,
        stopSpeaking,
        isSpeaking,
        speechEnabled,
        toggleSpeech
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
};

// Custom hook to use the avatar context
export const useAvatar = (): AvatarContextType => {
  const context = useContext(AvatarContext);
  
  if (context === undefined) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  
  return context;
};
