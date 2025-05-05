
import React, { useState, useRef } from "react";
import { ChevronDown, LogOut, User, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth";
import { useAvatarDisplay } from "./hooks/useAvatarDisplay";
import { toast } from "sonner";

interface AvatarMenuProps {
  user: any;
}

const AvatarMenu: React.FC<AvatarMenuProps> = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { 
    avatarKey, 
    cachedAvatarData, 
    avatarError, 
    handleAvatarError,
    getInitials,
    positionScale 
  } = useAvatarDisplay(user);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast("You have been logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast("Failed to log out. Please try again.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar className="h-8 w-8" key={`avatar-${avatarKey}`}>
            {(cachedAvatarData || user?.avatar) && !avatarError ? (
              <AvatarImage 
                src={cachedAvatarData || user?.avatar} 
                alt={user?.name || "User avatar"}
                style={{ 
                  transform: user?.avatarSettings ? `scale(${user.avatarSettings.zoom / 100})` : undefined,
                  marginLeft: user?.avatarSettings ? `${user.avatarSettings.position.x * positionScale}px` : undefined,
                  marginTop: user?.avatarSettings ? `${user.avatarSettings.position.y * positionScale}px` : undefined,
                }}
                onError={handleAvatarError}
                data-avatar-length={user?.avatar?.length || 0}
                data-avatar-key={avatarKey}
                data-position-scale={positionScale}
              />
            ) : null}
            <AvatarFallback className="bg-ptcustom-blue text-white">{getInitials()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden md:inline">{user?.name || "User"}</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => navigate('/profile')}
          className="cursor-pointer"
        >
          <User className="h-4 w-4 mr-2" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => navigate('/settings')}
          className="cursor-pointer"
        >
          <Settings className="h-4 w-4 mr-2" /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-500 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AvatarMenu;
