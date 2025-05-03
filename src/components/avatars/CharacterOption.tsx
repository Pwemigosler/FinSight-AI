
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, ImageIcon } from "lucide-react";

export interface CharacterData {
  id: string;
  name: string;
  thumbnailUrl: string;
  description: string;
}

interface CharacterOptionProps {
  character: CharacterData;
  selected: boolean;
  onSelect: (character: CharacterData) => void;
}

const CharacterOption: React.FC<CharacterOptionProps> = ({
  character,
  selected,
  onSelect,
}) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    console.error(`Failed to load character thumbnail: ${character.id} from URL: ${character.thumbnailUrl}`);
    setImageError(true);
  };

  return (
    <div 
      className={cn(
        "relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all transform hover:scale-105",
        selected ? "border-finsight-purple shadow-lg" : "border-gray-200 hover:border-finsight-purple/50"
      )}
      onClick={() => onSelect(character)}
    >
      {imageError ? (
        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="text-xs text-gray-500 mt-1">{character.name}</p>
          </div>
        </div>
      ) : (
        <img
          src={character.thumbnailUrl}
          alt={character.name}
          className="w-full h-40 object-cover"
          onError={handleImageError}
        />
      )}
      <div className="p-2 bg-white">
        <h3 className="font-medium text-sm">{character.name}</h3>
        <p className="text-xs text-gray-500 line-clamp-2">{character.description}</p>
      </div>
      {selected && (
        <div className="absolute top-2 right-2 bg-finsight-purple rounded-full p-1">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default CharacterOption;
