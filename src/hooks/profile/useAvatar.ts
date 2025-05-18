
import { useProfileAvatar } from './useProfileAvatar';

/**
 * Hook for all avatar-related functionality 
 * This is a compatibility layer that extends useProfileAvatar with additional methods
 */
export const useAvatar = () => {
  const profileAvatar = useProfileAvatar();
  
  // Add generateAvatarFromName function for compatibility
  const generateAvatarFromName = (name: string) => {
    console.log(`[Avatar] Generating avatar from name: ${name}`);
    // In a real implementation, this would call an AI service to generate
    // an avatar based on the name, but for now we just log it
  };
  
  return {
    ...profileAvatar,
    generateAvatarFromName
  };
};

export default useAvatar;
