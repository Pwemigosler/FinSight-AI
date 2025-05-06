
import { Bell, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { HeaderUserMenu } from "./HeaderUserMenu";
import { useAvatarState } from "@/hooks/header/useAvatarState";
import { User } from "@/types/user";

interface HeaderActionsProps {
  user: User | null;
  logout: () => void;
}

export const HeaderActions = ({ user, logout }: HeaderActionsProps) => {
  const navigate = useNavigate();
  const { avatarKey, avatarError, handleAvatarError } = useAvatarState(user);

  return (
    <div className="flex items-center gap-3">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => navigate('/chat')}
      >
        <Bot className="h-5 w-5" />
      </Button>
        
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-finsight-red"></span>
      </Button>
      
      <HeaderUserMenu 
        user={user} 
        avatarKey={avatarKey}
        onAvatarError={handleAvatarError}
        logout={logout}
      />
    </div>
  );
};
