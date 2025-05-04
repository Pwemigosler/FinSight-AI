
import { useState, useEffect } from 'react';
import { useAvatar } from '@/contexts/AvatarContext';

export const useSpeech = (messageContent: string) => {
  const { speakMessage, stopSpeaking, isSpeaking } = useAvatar();
  const [isThisElementSpeaking, setIsThisElementSpeaking] = useState(false);
  
  // Handle text-to-speech
  const handleSpeak = () => {
    if (isThisElementSpeaking) {
      stopSpeaking();
      setIsThisElementSpeaking(false);
    } else {
      speakMessage(messageContent);
      setIsThisElementSpeaking(true);
    }
  };
  
  // Reset speaking state when global speaking state changes
  useEffect(() => {
    if (!isSpeaking && isThisElementSpeaking) {
      setIsThisElementSpeaking(false);
    }
  }, [isSpeaking, isThisElementSpeaking]);

  return {
    isThisElementSpeaking,
    handleSpeak
  };
};
