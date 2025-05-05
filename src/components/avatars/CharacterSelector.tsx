
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCharacterSelector } from "@/hooks/useCharacterSelector";
import CharacterGrid from "./CharacterGrid";
import { CharacterData } from "./CharacterOption";

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
  const {
    selectedCharacter,
    isSaving,
    charactersWithUrls,
    defaultCharacters,
    handleSelectCharacter,
    handleSaveSelection,
    addTimeStampToUrl
  } = useCharacterSelector(isSetupMode, propSelectedCharacter, onSelectCharacter);

  const handleSelect = (character: CharacterData) => {
    handleSelectCharacter(character);
  };

  // For setup mode, render just the character options
  if (isSetupMode) {
    return (
      <CharacterGrid
        characters={charactersWithUrls.length > 0 ? charactersWithUrls : defaultCharacters}
        selectedCharacter={selectedCharacter}
        onSelectCharacter={handleSelect}
        addTimeStampToUrl={addTimeStampToUrl}
      />
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
        <CharacterGrid
          characters={charactersWithUrls.length > 0 ? charactersWithUrls : defaultCharacters}
          selectedCharacter={selectedCharacter}
          onSelectCharacter={handleSelect}
          addTimeStampToUrl={addTimeStampToUrl}
        />
        <Button 
          className="w-full mt-6" 
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
