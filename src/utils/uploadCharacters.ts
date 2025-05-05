
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
      const exists = await checkFileExists(fileName);
      
      if (!exists) {
        console.log(`Character ${character} doesn't exist in storage, uploading from public folder...`);
        try {
          // Fetch from public folder
          const response = await fetch(`/characters/${fileName}`);
          
          if (!response.ok) {
            console.error(`Failed to fetch local character image for ${character}: ${response.status} ${response.statusText}`);
            continue;
          }
          
          const blob = await response.blob();
          
          // Upload to Supabase
          const success = await uploadFile(fileName, blob, 'image/png');
          
          if (success) {
            console.log(`Successfully uploaded ${character} to storage`);
          } else {
            console.error(`Failed to upload ${character} to storage`);
          }
        } catch (fetchError) {
          console.error(`Error fetching/uploading ${character} image:`, fetchError);
        }
      } else {
        console.log(`Character ${character} already exists in storage, skipping upload`);
      }
    }
    
    console.log("Character image upload process completed");
  } catch (error) {
    console.error("Error in uploadCharacterImages:", error);
  }
};
