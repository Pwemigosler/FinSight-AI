
import { useProfileAvatar } from './useProfileAvatar';

/**
 * Hook for all avatar-related functionality 
 * This is a compatibility layer for older code that expects useAvatar
 */
export const useAvatar = () => {
  const avatarHook = useProfileAvatar();
  
  // Add generateAvatarFromName function - a simple implementation
  // that doesn't actually change the avatar but ensures compatibility
  const generateAvatarFromName = (name: string) => {
    console.log(`[Avatar] Would generate avatar from name: ${name}`);
    // In a real implementation, this might call an AI service to generate
    // an avatar based on the name, but for now we just log
  };
  
  return {
    ...avatarHook,
    generateAvatarFromName
  };
};

export default useAvatar;
