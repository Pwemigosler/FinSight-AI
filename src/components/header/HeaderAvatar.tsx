
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/user";

interface HeaderAvatarProps {
  user?: User | null;
  avatarKey: number;
  onAvatarError: () => void;
}

export const HeaderAvatar = ({ user, avatarKey, onAvatarError }: HeaderAvatarProps) => {
  const cachedAvatarData = user?.avatar;
  
  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Calculate position scale factor for the avatar
  const calculatePositionScale = () => {
    // The header avatar is 8x8, so we need to scale down the position values
    // Since we're applying transforms to a smaller image, use a smaller factor
    return 0.15; // Adjusted scaling factor for position values
  };

  const positionScale = calculatePositionScale();

  return (
    <Avatar className="h-8 w-8" key={`avatar-${avatarKey}`}>
      {(cachedAvatarData || user?.avatar) ? (
        <AvatarImage 
          src={cachedAvatarData || user?.avatar} 
          alt={user?.name || "User avatar"}
          style={{ 
            transform: user?.avatarSettings ? `scale(${user.avatarSettings.zoom / 100})` : undefined,
            marginLeft: user?.avatarSettings ? `${user.avatarSettings.position.x * positionScale}px` : undefined,
            marginTop: user?.avatarSettings ? `${user.avatarSettings.position.y * positionScale}px` : undefined,
          }}
          onError={onAvatarError}
          data-avatar-length={user?.avatar?.length || 0}
          data-avatar-key={avatarKey}
          data-position-scale={positionScale}
        />
      ) : null}
      <AvatarFallback className="bg-finsight-purple text-white">{getInitials()}</AvatarFallback>
    </Avatar>
  );
};
