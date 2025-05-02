
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CharacterOption, { CharacterData } from "./CharacterOption";

// Default character options - in a real app, these would come from an API
const defaultCharacters: CharacterData[] = [
  {
    id: "finn",
    name: "Finn",
    thumbnailUrl: "/characters/finn.png",
    description: "A friendly and helpful financial advisor with expertise in budgeting and saving."
  },
  {
    id: "luna",
    name: "Luna",
    thumbnailUrl: "/characters/luna.png",
    description: "A tech-savvy assistant who specializes in investment strategies and market trends."
  },
  {
    id: "oliver",
    name: "Oliver",
    thumbnailUrl: "/characters/oliver.png",
    description: "A detail-oriented character who helps with expense tracking and financial planning."
  },
  {
    id: "zoe",
    name: "Zoe",
    thumbnailUrl: "/characters/zoe.png",
    description: "An energetic advisor focused on helping you reach your financial goals."
  }
];

// Placeholder images for development - in production, replace with actual character images
const placeholderImages = {
  "finn": "https://placehold.co/200x200/9b87f5/FFFFFF/?text=Finn",
  "luna": "https://placehold.co/200x200/33C3F0/FFFFFF/?text=Luna",
  "oliver": "https://placehold.co/200x200/10B981/FFFFFF/?text=Oliver",
  "zoe": "https://placehold.co/200x200/F97316/FFFFFF/?text=Zoe",
};

const CharacterSelector: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [selectedCharacter, setSelectedCharacter] = useState<string>(
    user?.preferences?.assistantCharacter || "finn"
  );
  const [isSaving, setIsSaving] = useState(false);

  // Get character thumbnail URL - handles development placeholders
  const getCharacterThumbnail = (characterId: string) => {
    if (process.env.NODE_ENV === "development") {
      return placeholderImages[characterId as keyof typeof placeholderImages] || placeholderImages.finn;
    }
    return `/characters/${characterId}.png`;
  };

  // Update character data with correct thumbnails
  const characters = defaultCharacters.map(char => ({
    ...char,
    thumbnailUrl: getCharacterThumbnail(char.id)
  }));

  const handleSelectCharacter = (character: CharacterData) => {
    setSelectedCharacter(character.id);
  };

  const handleSaveSelection = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would be an API call
      if (updateUser && user) {
        await updateUser({
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
          {characters.map((character) => (
            <CharacterOption
              key={character.id}
              character={character}
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
