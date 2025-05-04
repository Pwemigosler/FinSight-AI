
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CharacterOption, { CharacterData } from "./CharacterOption";
import { characterImages } from "./utils/avatar-utils";
import { useAvatar } from "@/contexts/AvatarContext";

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

const CharacterSelector: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { characterId: currentCharacterId, setCharacterId } = useAvatar();
  const [selectedCharacter, setSelectedCharacter] = useState<string>(
    currentCharacterId || user?.preferences?.assistantCharacter || "fin"
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectCharacter = (character: CharacterData) => {
    setSelectedCharacter(character.id);
  };

  const handleSaveSelection = async () => {
    setIsSaving(true);
    try {
      // Update avatar context
      setCharacterId(selectedCharacter);
      
      // In a real app, this would be an API call
      if (updateUserProfile && user) {
        await updateUserProfile({
          ...user,
          preferences: {
            ...user.preferences,
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
          {defaultCharacters.map((character) => (
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
