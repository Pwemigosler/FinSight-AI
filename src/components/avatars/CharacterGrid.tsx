
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
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {characters.map((character) => (
        <CharacterOption
          key={character.id}
          character={{
            ...character,
            thumbnailUrl: addTimeStampToUrl(character.thumbnailUrl)
          }}
          selected={selectedCharacter === character.id}
          onSelect={onSelectCharacter}
        />
      ))}
    </div>
  );
};

export default CharacterGrid;
