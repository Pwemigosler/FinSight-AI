
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useAvatar } from "@/contexts/AvatarContext";
import { toast } from "sonner";
import { CharacterData } from "@/components/avatars/CharacterOption";
import { getPublicUrl } from "@/utils/supabaseStorage";
import { defaultCharacters } from "@/components/avatars/utils/character-constants";

export const useCharacterSelector = (
  isSetupMode = false,
  propSelectedCharacter?: string,
  onSelectCharacter?: (characterId: string) => void
) => {
  const { user, updateUserProfile } = useAuth();
  const { characterId: contextCharacterId, setCharacterId } = useAvatar();
  const [selectedCharacter, setSelectedCharacter] = useState<string>(
    propSelectedCharacter || contextCharacterId || user?.preferences?.assistantCharacter || "fin"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [charactersWithUrls, setCharactersWithUrls] = useState<CharacterData[]>([]);

  // Update selected character when prop changes (for setup mode)
  useEffect(() => {
    if (propSelectedCharacter && propSelectedCharacter !== selectedCharacter) {
      setSelectedCharacter(propSelectedCharacter);
    }
  }, [propSelectedCharacter]);

  // Load character images from Supabase or fallback to local paths
  useEffect(() => {
    const loadCharacterUrls = async () => {
      const updatedCharacters = await Promise.all(defaultCharacters.map(async (character) => {
        try {
          // Try to get URL from Supabase
          const supabaseUrl = getPublicUrl(`${character.id}.png`);
          
          if (supabaseUrl) {
            console.log(`Loaded Supabase URL for ${character.id}: ${supabaseUrl}`);
            return {
              ...character,
              thumbnailUrl: supabaseUrl
            };
          }
          
          // Fallback to local path if Supabase URL isn't available
          console.log(`Using local path for ${character.id}: ${character.thumbnailUrl}`);
          return character;
        } catch (error) {
          console.error(`Error getting URL for ${character.id}:`, error);
          return character; // Return original character data with local path
        }
      }));
      
      setCharactersWithUrls(updatedCharacters);
    };
    
    loadCharacterUrls();
  }, []);

  const handleSelectCharacter = (character: CharacterData) => {
    setSelectedCharacter(character.id);
    
    // If in setup mode and callback is provided, call it
    if (isSetupMode && onSelectCharacter) {
      onSelectCharacter(character.id);
    }
  };

  const handleSaveSelection = async () => {
    if (isSetupMode) {
      // In setup mode, we don't save directly - parent component handles it
      if (onSelectCharacter) {
        onSelectCharacter(selectedCharacter);
      }
      return;
    }
    
    setIsSaving(true);
    try {
      // Update avatar context
      setCharacterId(selectedCharacter);
      
      // In a real app, this would be an API call
      if (updateUserProfile && user) {
        await updateUserProfile({
          preferences: {
            ...user.preferences || {},
            assistantCharacter: selectedCharacter
          }
        });
        
        toast.success("Assistant character updated", {
          description: "Your preferred AI assistant character has been saved."
        });
      }
    } catch (error) {
      console.error("Failed to save character selection:", error);
      toast.error("Failed to save character", {
        description: "Please try again later."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Force browser to refresh images by adding timestamp to URL
  const addTimeStampToUrl = (url: string): string => {
    return `${url}?t=${Date.now()}`;
  };

  return {
    selectedCharacter,
    isSaving,
    charactersWithUrls,
    defaultCharacters,
    handleSelectCharacter,
    handleSaveSelection,
    addTimeStampToUrl
  };
};
