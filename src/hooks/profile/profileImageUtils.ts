
/**
 * Image processing and validation utility functions for profile avatars
 */

/**
 * Validates an image file for type and size restrictions
 * 
 * @param file The file to validate
 * @returns Error message if invalid, null if valid
 */
export const validateImageFile = (file: File): string | null => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    return "Please select an image file";
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return "Image size should be less than 5MB";
  }
  
  return null;
};

/**
 * Process an image file and convert it to a data URL
 * 
 * @param file The image file to process
 * @param onProcessed Callback function with the processed image data
 */
export const processProfileImage = (
  file: File, 
  onProcessed: (imageData: string) => void
): void => {
  const reader = new FileReader();
  
  reader.onload = (event) => {
    const imageData = event.target?.result as string;
    onProcessed(imageData);
  };
  
  reader.readAsDataURL(file);
};

/**
 * Creates a placeholder avatar based on user initials
 * 
 * @param name User's name to extract initials from
 * @returns Initials for avatar
 */
export const getInitialsFromName = (name: string | undefined): string => {
  if (!name) return "U";
  
  return name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};
