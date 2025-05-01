
import { Bell, ChevronDown, Menu, LogOut, User, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState, useRef } from "react";

interface HeaderProps {
  toggleSidebar?: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarKey, setAvatarKey] = useState<number>(0);
  const [avatarError, setAvatarError] = useState(false);
  const avatarRetryCount = useRef(0);
  const [cachedAvatarData, setCachedAvatarData] = useState<string | undefined>(user?.avatar);
  
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

  const handleLogoClick = () => {
    navigate('/');
  };

  // Force re-render of avatar when user changes
  useEffect(() => {
    if (user) {
      // Reset error state and retry count when user changes
      setAvatarError(false);
      avatarRetryCount.current = 0;
      
      // Update cached avatar data
      if (user.avatar) {
        setCachedAvatarData(user.avatar);
        console.log("[Header] User avatar updated, length:", user.avatar.length);
      } else {
        console.log("[Header] User updated but no avatar present");
      }
      
      // Force re-render by updating key
      setAvatarKey(prev => prev + 1);
      
      console.log("[Header] User updated:", 
        "Name:", user.name,
        "Avatar exists:", !!user.avatar, 
        "Avatar length:", user.avatar?.length || 0,
        "Avatar settings:", user.avatarSettings ? 
          `zoom:${user.avatarSettings.zoom}, pos:(${user.avatarSettings.position.x},${user.avatarSettings.position.y})` : 
          "none"
      );
    }
  }, [user]);

  // Update specifically when avatar changes
  useEffect(() => {
    const handleAvatarUpdate = () => {
      if (user?.avatar) {
        console.log("[Header] Avatar changed, length:", user.avatar.length);
        setCachedAvatarData(user.avatar);
        setAvatarError(false);
        avatarRetryCount.current = 0;
        setAvatarKey(prev => prev + 1);
      }
    };
    
    handleAvatarUpdate();
    
    // Poll for avatar changes from localStorage
    // This helps catch changes that might have happened in another component
    const checkAvatarInterval = setInterval(() => {
      try {
        const savedUserJson = localStorage.getItem("finsight_user");
        if (savedUserJson) {
          const savedUser = JSON.parse(savedUserJson);
          
          // If localStorage has an avatar but we don't, update
          if (savedUser?.avatar && (!cachedAvatarData || savedUser.avatar.length !== cachedAvatarData.length)) {
            console.log("[Header] Detected avatar change in localStorage");
            setCachedAvatarData(savedUser.avatar);
            setAvatarKey(prev => prev + 1);
            setAvatarError(false); // Reset error state when we get new avatar data
          }
        }
      } catch (error) {
        console.error("[Header] Error checking localStorage for avatar changes:", error);
      }
    }, 2000);
    
    return () => clearInterval(checkAvatarInterval);
  }, [user?.avatar, cachedAvatarData]);

  const handleAvatarError = () => {
    avatarRetryCount.current += 1;
    console.error(`[Header] Failed to load avatar image (attempt ${avatarRetryCount.current})`);
    
    // Only set error after a few retries
    if (avatarRetryCount.current >= 3) {
      setAvatarError(true);
      console.log("[Header] Avatar load failed after multiple attempts, showing fallback");
    } else {
      // Try again with a new key after a short delay
      setTimeout(() => {
        console.log("[Header] Retrying avatar load...");
        setAvatarKey(prev => prev + 1);
      }, 500);
    }
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
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-finsight-red"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar className="h-8 w-8" key={`avatar-${avatarKey}-${Date.now()}`}>
                {(cachedAvatarData || user?.avatar) && !avatarError ? (
                  <AvatarImage 
                    src={cachedAvatarData || user?.avatar} 
                    alt={user?.name || "User avatar"}
                    style={{ 
                      transform: user?.avatarSettings ? `scale(${user.avatarSettings.zoom / 100})` : undefined,
                      marginLeft: user?.avatarSettings ? `${user.avatarSettings.position.x * 0.25}px` : undefined,
                      marginTop: user?.avatarSettings ? `${user.avatarSettings.position.y * 0.25}px` : undefined,
                    }}
                    onError={handleAvatarError}
                    data-avatar-length={user?.avatar?.length || 0}
                  />
                ) : null}
                <AvatarFallback className="bg-finsight-purple text-white">{getInitials()}</AvatarFallback>
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
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
