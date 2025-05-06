
import { uploadFile, checkFileExists } from './supabaseStorage';

// List of default character images to ensure they exist in storage
const defaultCharacters = ['fin', 'luna', 'oliver', 'zoe'];

/**
 * Uploads character images from public/characters to Supabase storage
 * This is called during app initialization to ensure characters exist
 */
export const uploadCharacterImages = async (): Promise<void> => {
  try {
    console.log("Starting character image uploads...");
    
    for (const character of defaultCharacters) {
      const fileName = `${character}.png`;
      
      // Check if this character image already exists in Supabase
      try {
        const exists = await checkFileExists(fileName);
        
        if (!exists) {
          console.log(`Character ${character} doesn't exist in storage, uploading from public folder...`);
          await uploadCharacterFromLocal(character, fileName);
        } else {
          console.log(`Character ${character} already exists in storage, verifying accessibility...`);
          
          // Verify the file is accessible by trying to get its URL
          const verifyUrl = await fetch(`/api/verify-image?character=${character}`);
          if (!verifyUrl.ok) {
            console.warn(`Character ${character} exists but may not be accessible. Re-uploading...`);
            await uploadCharacterFromLocal(character, fileName);
          }
        }
      } catch (error) {
        console.error(`Error checking if ${fileName} exists:`, error);
        // Try uploading anyway as a fallback
        await uploadCharacterFromLocal(character, fileName);
      }
    }
    
    console.log("Character image upload process completed");
  } catch (error) {
    console.error("Error in uploadCharacterImages:", error);
  }
};

/**
 * Helper function to upload a character image from local public folder
 */
async function uploadCharacterFromLocal(character: string, fileName: string): Promise<boolean> {
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      // Fetch from public folder with cache busting
      const response = await fetch(`/characters/${fileName}?t=${Date.now()}`, {
        cache: 'no-store' // Prevent browser caching
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch local character image for ${character}: ${response.status} ${response.statusText}`);
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Retrying fetch for ${character} (attempt ${retryCount + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        }
        return false;
      }
      
      const blob = await response.blob();
      
      // Upload to Supabase
      const success = await uploadFile(fileName, blob, 'image/png');
      
      if (success) {
        console.log(`Successfully uploaded ${character} to storage`);
        return true;
      } else {
        console.error(`Failed to upload ${character} to storage`);
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Retrying upload for ${character} (attempt ${retryCount + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    } catch (fetchError) {
      console.error(`Error fetching/uploading ${character} image (attempt ${retryCount + 1}):`, fetchError);
      retryCount++;
      if (retryCount < maxRetries) {
        console.log(`Retrying after error for ${character}...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }
  }
  
  return false;
}
