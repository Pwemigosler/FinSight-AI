
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
  
  console.log(`Attempting to upload ${characters.length} character images to Supabase`);
  
  for (const character of characters) {
    try {
      console.log(`Fetching local image for ${character.id} from ${character.path}`);
      // Fetch the local image file
      const response = await fetch(character.path);
      if (!response.ok) {
        console.error(`Failed to fetch local image for ${character.id}:`, response.statusText);
        console.error(`HTTP Status: ${response.status}`);
        continue;
      }
      
      const blob = await response.blob();
      console.log(`Successfully fetched ${character.id} image, size: ${blob.size} bytes, type: ${blob.type}`);
      
      if (blob.size === 0) {
        console.error(`Empty blob for ${character.id}, skipping upload`);
        continue;
      }
      
      // Upload to Supabase
      const filePath = `${character.id}.png`;
      console.log(`Uploading ${character.id} to Supabase storage as ${filePath}`);
      
      const uploaded = await uploadFile(
        filePath,
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
  
  console.log("Character image upload process completed");
};
