
import React from "react";
import Header from "@/components/Header";
import AvatarSection from "@/components/profile/AvatarSection";
import ProfileFormSection from "@/components/profile/ProfileFormSection";
import LinkedCardsSection from "@/components/profile/LinkedCardsSection";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-finsight-purple mb-6">Profile</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <AvatarSection />
          </div>

          <div className="md:col-span-2 space-y-6">
            <ProfileFormSection />
            <LinkedCardsSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
