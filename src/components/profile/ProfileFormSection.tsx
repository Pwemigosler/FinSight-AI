
import React from "react";
import { Card } from "@/components/ui/card";
import ProfileInfoForm from "./ProfileInfoForm";
import { useProfileForm } from "@/hooks/profile";

const ProfileFormSection = () => {
  const {
    profileName,
    setProfileName,
    profileEmail,
    setProfileEmail,
    handleSave,
    handleCancel
  } = useProfileForm();

  return (
    <Card>
      <ProfileInfoForm 
        profileName={profileName}
        setProfileName={setProfileName}
        profileEmail={profileEmail}
        setProfileEmail={setProfileEmail}
        handleSave={handleSave}
        handleCancel={handleCancel}
      />
    </Card>
  );
};

export default ProfileFormSection;
