
import { User, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { HeaderAvatar } from "./HeaderAvatar";
import { useNavigate } from "react-router-dom";
import { User as UserType } from "@/types/user";

interface HeaderUserMenuProps {
  user: UserType | null;
  avatarKey: number;
  onAvatarError: () => void;
  logout: () => void;
}

export const HeaderUserMenu = ({ user, avatarKey, onAvatarError, logout }: HeaderUserMenuProps) => {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <HeaderAvatar 
            user={user} 
            avatarKey={avatarKey} 
            onAvatarError={onAvatarError}
          />
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
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
