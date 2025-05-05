
import React from "react";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import AvatarMenu from "./header/AvatarMenu";
import NotificationBell from "./header/NotificationBell";
import ChatButton from "./header/ChatButton";

interface HeaderProps {
  toggleSidebar?: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-2">
        {toggleSidebar && isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div 
          className="flex items-center cursor-pointer" 
          onClick={handleLogoClick}
        >
          <h1 className="text-xl font-bold text-finsight-purple-dark">
            FinSight<span className="ml-1 text-finsight-purple">AI</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ChatButton />
        <NotificationBell />
        <AvatarMenu user={user} />
      </div>
    </header>
  );
};

export default Header;
