
import React from "react";
import ProfileHeader from "./ProfileHeader";
import AvatarEditor from "./AvatarEditor";
import { useProfileAvatar } from "@/hooks/profile";
import { useAuth } from "@/contexts/auth";

const AvatarSection = () => {
  const { user } = useAuth();
  
  const {
    isDialogOpen,
    previewImage,
    isDragging,
    zoomLevel,
    setZoomLevel,
    imagePosition,
    setImagePosition,
    avatarKey,
    fileInputRef,
    handleProfilePictureClick,
    handleFileSelect,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDialogClose,
    handleUpload,
    handleDeleteAvatar,
    handleImageMouseDown,
    handleImageMouseMove,
    handleImageMouseUp,
    isDraggingImage
  } = useProfileAvatar();

  return (
    <>
      <ProfileHeader 
        user={user}
        avatarKey={avatarKey}
        handleProfilePictureClick={handleProfilePictureClick}
      />

      {/* Profile Picture Upload Dialog */}
      <AvatarEditor 
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        previewImage={previewImage}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        imagePosition={imagePosition}
        setImagePosition={setImagePosition}
        handleUpload={handleUpload}
        handleFileSelect={handleFileSelect}
        handleDrop={handleDrop}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        isDragging={isDragging}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        handleDeleteAvatar={handleDeleteAvatar}
      />
    </>
  );
};

export default AvatarSection;
