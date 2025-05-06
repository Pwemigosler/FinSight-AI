
import React from "react";
import PersonalDetailsStep from "./PersonalDetailsStep";
import AssistantStep from "./AssistantStep";
import PreferencesStep from "./PreferencesStep";
import NotificationsStep from "./NotificationsStep";

interface StepRendererProps {
  currentStepId: string;
  formData: {
    fullName: string;
    emailNotifications: boolean;
    appNotifications: boolean;
    currency: string;
    language: string;
    assistantCharacter: string;
  };
  avatarHandler: any;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onCharacterSelect: (characterId: string) => void;
}

const StepRenderer: React.FC<StepRendererProps> = ({
  currentStepId,
  formData,
  avatarHandler,
  onNameChange,
  onInputChange,
  onCharacterSelect
}) => {
  // Create an adapter function for boolean switches in NotificationsStep
  const handleBooleanChange = (field: string, value: boolean) => {
    // Create a synthetic event object that mimics what onInputChange expects
    const syntheticEvent = {
      target: {
        name: field,
        type: 'checkbox',
        checked: value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onInputChange(syntheticEvent);
  };

  switch (currentStepId) {
    case "personal":
      return (
        <PersonalDetailsStep 
          name={formData.fullName}
          onNameChange={onNameChange}
          previewImage={avatarHandler.previewImage}
          zoomLevel={avatarHandler.zoomLevel}
          imagePosition={avatarHandler.imagePosition}
          onZoomChange={avatarHandler.handleZoomChange}
          isDragging={avatarHandler.isDragging}
          isDraggingImage={avatarHandler.isDraggingImage}
          onImageMouseDown={avatarHandler.handleImageMouseDown}
          onImageMouseMove={avatarHandler.handleImageMouseMove}
          onImageMouseUp={avatarHandler.handleImageMouseUp}
          onDragOver={avatarHandler.handleDragOver}
          onDragLeave={avatarHandler.handleDragLeave}
          onDrop={avatarHandler.handleDrop}
          onFileSelect={avatarHandler.processSelectedFile}
          onDeleteImage={avatarHandler.deleteImage}
        />
      );
    case "assistant":
      return (
        <AssistantStep 
          selectedCharacter={formData.assistantCharacter}
          onCharacterSelect={onCharacterSelect}
        />
      );
    case "preferences":
      return (
        <PreferencesStep 
          currency={formData.currency}
          language={formData.language}
          onInputChange={onInputChange}
        />
      );
    case "notification":
      return (
        <NotificationsStep 
          emailNotifications={formData.emailNotifications}
          appNotifications={formData.appNotifications}
          onInputChange={handleBooleanChange}
        />
      );
    default:
      return null;
  }
};

export default StepRenderer;
