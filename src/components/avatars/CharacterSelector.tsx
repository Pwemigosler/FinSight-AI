
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CharacterOption, { CharacterData } from "./CharacterOption";
import { characterImages } from "./utils/avatar-utils";
import { useAvatar } from "@/contexts/AvatarContext";
import { getPublicUrl } from "@/utils/supabaseStorage";

// Default character options with their descriptions and paths
const defaultCharacters: CharacterData[] = [
  {
    id: "fin",
    name: "Fin",
    thumbnailUrl: characterImages.fin,
    description: "Your friendly robot financial assistant with expertise in budgeting and investment strategies."
  },
  {
    id: "luna",
    name: "Luna",
    thumbnailUrl: characterImages.luna,
    description: "A tech-savvy assistant who specializes in investment strategies and market trends."
  },
  {
    id: "oliver",
    name: "Oliver",
    thumbnailUrl: characterImages.oliver,
    description: "A detail-oriented character who helps with expense tracking and financial planning."
  },
  {
    id: "zoe",
    name: "Zoe",
    thumbnailUrl: characterImages.zoe,
    description: "An energetic advisor focused on helping you reach your financial goals."
  }
];

interface CharacterSelectorProps {
  isSetupMode?: boolean;
  selectedCharacter?: string;
  onSelectCharacter?: (characterId: string) => void;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ 
  isSetupMode = false, 
  selectedCharacter: propSelectedCharacter,
  onSelectCharacter
}) => {
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

  // For setup mode, render just the character options
  if (isSetupMode) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(charactersWithUrls.length > 0 ? charactersWithUrls : defaultCharacters).map((character) => (
          <CharacterOption
            key={character.id}
            character={{
              ...character,
              thumbnailUrl: addTimeStampToUrl(character.thumbnailUrl)
            }}
            selected={selectedCharacter === character.id}
            onSelect={handleSelectCharacter}
          />
        ))}
      </div>
    );
  }

  // Standard mode with card and save button
  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Your AI Assistant</CardTitle>
        <CardDescription>
          Select a character to represent your AI financial assistant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(charactersWithUrls.length > 0 ? charactersWithUrls : defaultCharacters).map((character) => (
            <CharacterOption
              key={character.id}
              character={{
                ...character,
                thumbnailUrl: addTimeStampToUrl(character.thumbnailUrl) // Add timestamp to force refresh
              }}
              selected={selectedCharacter === character.id}
              onSelect={handleSelectCharacter}
            />
          ))}
        </div>
        <Button 
          className="w-full" 
          onClick={handleSaveSelection} 
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Selection"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CharacterSelector;
