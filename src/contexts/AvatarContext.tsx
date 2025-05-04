
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AvatarState } from '@/components/avatars/types/avatar-types';
import { analyze } from '@/utils/sentimentAnalysis';

// Define the types for our context
type AvatarContextType = {
  avatarState: AvatarState;
  characterId: string;
  setAvatarState: (state: AvatarState) => void;
  setCharacterId: (id: string) => void;
  reactToMessage: (message: string) => void;
  speakMessage: (message: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
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
  
  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynth(window.speechSynthesis);
    }
  }, []);

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

  // Use Web Speech API to speak a message
  const speakMessage = (message: string) => {
    if (!speechSynth) return;
    
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
        isSpeaking
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
