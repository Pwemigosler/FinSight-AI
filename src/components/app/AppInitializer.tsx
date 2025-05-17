
import React, { useEffect, useState } from 'react';
import { initializeCharacterAvatars } from "@/utils/supabaseStorage";
import { uploadCharacterImages } from "@/utils/uploadCharacters";

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [imagesInitialized, setImagesInitialized] = useState(false);
  
  useEffect(() => {
    // Initialize character avatars when app starts
    const init = async () => {
      try {
        console.log("Starting Supabase storage initialization...");
        await initializeCharacterAvatars();
        
        // Upload characters to Supabase on app start
        console.log("Starting character image upload to Supabase...");
        await uploadCharacterImages();
        console.log("Character image upload completed");
        setImagesInitialized(true);
      } catch (error) {
        console.error("Error initializing images:", error);
        // Even on error, we set initialized to true to avoid blocking the app
        setImagesInitialized(true);
      }
    };
    
    init();
    
    // Set up periodic check for image availability
    const imageCheckInterval = setInterval(() => {
      if (imagesInitialized) {
        uploadCharacterImages().catch(console.error);
      }
    }, 30 * 60 * 1000); // Check every 30 minutes
    
    return () => clearInterval(imageCheckInterval);
  }, [imagesInitialized]);
  
  return <>{children}</>;
};

export default AppInitializer;
