
import React, { useEffect, useState } from 'react';
import { initializeCharacterAvatars } from "@/utils/supabaseStorage";
import { uploadCharacterImages } from "@/utils/uploadCharacters";

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [imagesInitialized, setImagesInitialized] = useState(false);
  
  useEffect(() => {
    // Initialize character avatars when app starts, but don't block rendering
    const init = async () => {
      try {
        console.log("Starting Supabase storage initialization...");
        
        // Start initialization but do not await it to avoid blocking the app
        const initPromise = initializeCharacterAvatars();
        
        // Set initialized immediately to avoid blocking the app
        setImagesInitialized(true);
        
        // Now await the initialization - this will happen in the background
        await initPromise;
        
        // Upload characters to Supabase on app start - also in background
        console.log("Starting character image upload to Supabase...");
        uploadCharacterImages().catch(err => {
          console.error("Error uploading character images:", err);
          // Non-critical error, don't block app rendering
        });
      } catch (error) {
        console.error("Error initializing images:", error);
        // Even on error, we set initialized to true to avoid blocking the app
        setImagesInitialized(true);
      }
    };
    
    // Start initialization without blocking
    init();
    
    // Set up periodic check for image availability - but use a longer interval to reduce load
    const imageCheckInterval = setInterval(() => {
      if (imagesInitialized) {
        uploadCharacterImages().catch(console.error);
      }
    }, 60 * 60 * 1000); // Check every hour instead of 30 minutes
    
    return () => clearInterval(imageCheckInterval);
  }, []);
  
  // Always render children immediately to avoid blocking the app
  return <>{children}</>;
};

export default AppInitializer;
