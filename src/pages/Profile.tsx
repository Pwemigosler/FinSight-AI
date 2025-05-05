import React from "react";
import Header from "@/components/Header";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileInfoForm from "@/components/profile/ProfileInfoForm";
import AvatarEditor from "@/components/profile/AvatarEditor";
import { useProfileAvatar, useProfileForm } from "@/hooks/profile";
import { useAuth } from "@/contexts/auth";

const Profile = () => {
  const { user } = useAuth();
  
  // Custom hooks for profile functionality
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
    handleUpload
  } = useProfileAvatar();

  const {
    profileName,
    setProfileName,
    profileEmail,
    setProfileEmail,
    handleSave,
    handleCancel
  } = useProfileForm();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-finsight-purple mb-6">Profile</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileHeader 
              user={user}
              avatarKey={avatarKey}
              handleProfilePictureClick={handleProfilePictureClick}
            />
          </div>

          <div className="md:col-span-2">
            <ProfileInfoForm 
              profileName={profileName}
              setProfileName={setProfileName}
              profileEmail={profileEmail}
              setProfileEmail={setProfileEmail}
              handleSave={handleSave}
              handleCancel={handleCancel}
            />
          </div>
        </div>
      </main>

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
      />
    </div>
  );
};

export default Profile;
