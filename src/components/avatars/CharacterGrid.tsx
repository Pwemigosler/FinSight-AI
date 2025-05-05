
import React from "react";
import CharacterOption, { CharacterData } from "./CharacterOption";

interface CharacterGridProps {
  characters: CharacterData[];
  selectedCharacter: string;
  onSelectCharacter: (character: CharacterData) => void;
  addTimeStampToUrl: (url: string) => string;
}

const CharacterGrid: React.FC<CharacterGridProps> = ({
  characters,
  selectedCharacter,
  onSelectCharacter,
  addTimeStampToUrl
}) => {
  // Process character URLs to ensure they have proper timestamps and use Supabase when available
  const processCharacterUrl = (character: CharacterData): CharacterData => {
    // Always ensure the URL is fresh with a timestamp
    return {
      ...character,
      thumbnailUrl: addTimeStampToUrl(character.thumbnailUrl)
    };
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {characters.map((character) => (
        <CharacterOption
          key={character.id}
          character={processCharacterUrl(character)}
          selected={selectedCharacter === character.id}
          onSelect={onSelectCharacter}
        />
      ))}
    </div>
  );
};

export default CharacterGrid;
