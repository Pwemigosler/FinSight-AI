import { debugLog } from '@/utils/debug';

import React, { useState, useEffect } from "react";
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
  const [supabaseImageError, setSupabaseImageError] = useState(false);
  const [localImageError, setLocalImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageSrc, setImageSrc] = useState(character.thumbnailUrl);
  
  // Update image source when character changes or thumbnail URL changes
  useEffect(() => {
    // Reset error state when character changes
    setSupabaseImageError(false);
    setLocalImageError(false);
    setRetryCount(0);
    
    // Add timestamp to prevent caching issues
    setImageSrc(`${character.thumbnailUrl}?t=${Date.now()}`);
  }, [character.id, character.thumbnailUrl]);
  
  const handleImageError = () => {
    console.error(`Failed to load character thumbnail: ${character.id} from URL: ${imageSrc}`);
    
    if (!supabaseImageError) {
      // First try local path
      setSupabaseImageError(true);
      setRetryCount(prev => prev + 1);
      
      const localUrl = `/characters/${character.id.toLowerCase()}.png?t=${Date.now()}`;
      debugLog(`Trying local file URL: ${localUrl}`);
      setImageSrc(localUrl);
    } else if (!localImageError && retryCount < 2) {
      // If local path failed once, try again with force refresh
      setRetryCount(prev => prev + 1);
      
      // Try with explicit cache buster
      const fallbackUrl = `/characters/${character.id.toLowerCase()}.png?nocache=true&t=${Date.now()}&retry=${retryCount}`;
      debugLog(`Trying local URL with cache busting: ${fallbackUrl}`);
      setImageSrc(fallbackUrl);
    } else {
      // Both Supabase and local attempts failed
      setLocalImageError(true);
    }
  };

  return (
    <div 
      className={cn(
        "relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all transform hover:scale-105",
        selected ? "border-finsight-purple shadow-lg" : "border-gray-200 hover:border-finsight-purple/50"
      )}
      onClick={() => onSelect(character)}
    >
      {supabaseImageError && localImageError ? (
        <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="text-xs text-gray-500 mt-1">{character.name}</p>
          </div>
        </div>
      ) : (
        <img
          src={imageSrc}
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
