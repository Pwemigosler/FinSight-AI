
import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "character_avatars";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Interface for cached image data
interface CachedImage {
  url: string;
  expiresAt: number;
}

// In-memory cache for image URLs
const imageCache: Record<string, CachedImage> = {};

/**
 * Get the public URL for a file in Supabase Storage
 * @param path Path to the file in the bucket
 * @returns Public URL or null if error
 */
export const getPublicUrl = (path: string): string | null => {
  try {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error(`Error getting public URL for ${path}:`, error);
    return null;
  }
};

/**
 * Fetch an image URL from Supabase Storage with caching
 * @param path Path to the image in the bucket
 * @returns Cached or fresh image URL
 */
export const getImageUrl = async (path: string): Promise<string | null> => {
  const now = Date.now();
  
  // Check if image URL is in cache and not expired
  if (imageCache[path] && imageCache[path].expiresAt > now) {
    console.log(`Using cached URL for ${path}`);
    return imageCache[path].url;
  }
  
  try {
    // Get fresh URL
    const url = getPublicUrl(path);
    
    if (url) {
      // Cache the URL
      imageCache[path] = {
        url,
        expiresAt: now + CACHE_DURATION
      };
      return url;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching image URL for ${path}:`, error);
    return null;
  }
};

/**
 * Check if a file exists in Supabase Storage
 * @param path Path to check
 * @returns Boolean indicating if file exists
 */
export const checkFileExists = async (path: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 1,
        search: path
      });
    
    if (error) {
      console.error(`Error checking if file exists: ${path}`, error);
      return false;
    }
    
    return data && data.length > 0 && data.some(file => file.name === path);
  } catch (error) {
    console.error(`Error checking if file exists: ${path}`, error);
    return false;
  }
};

/**
 * Upload a file to Supabase Storage
 * @param path Path where the file will be stored
 * @param fileBody File data
 * @param contentType MIME type of the file
 * @returns Boolean indicating success
 */
export const uploadFile = async (
  path: string,
  fileBody: File | Blob | ArrayBuffer,
  contentType?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, fileBody, {
        contentType,
        upsert: true
      });
    
    if (error) {
      console.error(`Error uploading file to ${path}:`, error);
      return false;
    }
    
    // Clear cache for this path since we've updated the file
    if (imageCache[path]) {
      delete imageCache[path];
    }
    
    return true;
  } catch (error) {
    console.error(`Error uploading file to ${path}:`, error);
    return false;
  }
};

/**
 * Initialize the character avatars in storage
 * This is a helper function to upload default character images if they don't exist
 */
export const initializeCharacterAvatars = async (): Promise<void> => {
  const characters = ["fin", "luna", "oliver", "zoe"];
  
  for (const character of characters) {
    const path = `${character}.png`;
    const exists = await checkFileExists(path);
    
    if (!exists) {
      console.log(`Character ${character} not found in storage. Will need to be uploaded.`);
      // Note: The actual file upload would happen elsewhere (admin panel, etc.)
    } else {
      console.log(`Character ${character} already exists in storage.`);
    }
  }
};
