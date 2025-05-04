
import React from "react";
import { Label } from "@/components/ui/label";
import CharacterSelector from "../avatars/CharacterSelector";

interface AssistantStepProps {
  selectedCharacter: string;
  onCharacterSelect: (characterId: string) => void;
}

export const AssistantStep: React.FC<AssistantStepProps> = ({ 
  selectedCharacter, 
  onCharacterSelect 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="block mb-1">AI Assistant Character</Label>
        <p className="text-sm text-gray-500 mb-2">Choose your preferred AI assistant character</p>
        <div className="mt-4">
          <CharacterSelector 
            isSetupMode={true}
            selectedCharacter={selectedCharacter}
            onSelectCharacter={onCharacterSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default AssistantStep;
