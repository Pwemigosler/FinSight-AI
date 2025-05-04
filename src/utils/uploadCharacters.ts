
import { uploadFile } from './supabaseStorage';

/**
 * Utility function to upload character images to Supabase storage
 * This would typically be called from an admin panel or initialization script
 */
export const uploadCharacterImages = async (): Promise<void> => {
  const characters = [
    { id: "fin", path: "/characters/fin.png" },
    { id: "luna", path: "/characters/luna.png" },
    { id: "oliver", path: "/characters/oliver.png" },
    { id: "zoe", path: "/characters/zoe.png" }
  ];
  
  for (const character of characters) {
    try {
      // Fetch the local image file
      const response = await fetch(character.path);
      if (!response.ok) {
        console.error(`Failed to fetch local image for ${character.id}:`, response.statusText);
        continue;
      }
      
      const blob = await response.blob();
      
      // Upload to Supabase
      const uploaded = await uploadFile(
        `${character.id}.png`,
        blob,
        blob.type
      );
      
      if (uploaded) {
        console.log(`Successfully uploaded ${character.id} to Supabase storage`);
      } else {
        console.error(`Failed to upload ${character.id} to Supabase storage`);
      }
    } catch (error) {
      console.error(`Error uploading ${character.id}:`, error);
    }
  }
};
