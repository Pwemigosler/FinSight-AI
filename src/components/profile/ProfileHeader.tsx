
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileHeaderProps {
  user: any;
  avatarKey: number;
  handleProfilePictureClick: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  user, 
  avatarKey, 
  handleProfilePictureClick 
}) => {
  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Calculate position scale based on avatar size (24x24)
  const calculatePositionScale = () => {
    // For the profile header avatar (24x24), use a slightly larger scale
    return 0.3;
  };

  const positionScale = calculatePositionScale();

  return (
    <Card>
      <CardContent className="pt-6 flex flex-col items-center">
        <Avatar className="h-24 w-24 mb-4" key={`profile-avatar-${avatarKey}`}>
          {user?.avatar ? (
            <AvatarImage 
              src={user.avatar} 
              alt={user.name || "Profile"} 
              style={{ 
                transform: user.avatarSettings ? `scale(${user.avatarSettings.zoom / 100})` : undefined,
                marginLeft: user.avatarSettings ? `${user.avatarSettings.position.x * positionScale}px` : undefined,
                marginTop: user.avatarSettings ? `${user.avatarSettings.position.y * positionScale}px` : undefined,
              }}
              onError={() => {
                console.error("[Profile] Failed to load avatar image in profile display");
              }}
              data-avatar-length={user?.avatar?.length || 0}
              data-position-scale={positionScale}
            />
          ) : null}
          <AvatarFallback className="bg-ptcustom-blue text-white text-xl">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold">{user?.name}</h2>
        <p className="text-gray-500 mb-4">{user?.email}</p>
        <Button 
          className="w-full flex items-center gap-2"
          onClick={handleProfilePictureClick}
        >
          <PencilLine className="h-4 w-4" />
          Edit Profile Picture
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
