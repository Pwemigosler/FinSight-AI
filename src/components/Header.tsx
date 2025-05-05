import { Bell, ChevronDown, Menu, LogOut, User, Settings, Bot } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth";
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
  const lastAvatarUpdateTime = useRef<number>(0);
  
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

  // Calculate avatar position scale factor based on the size difference
  // Editor preview is 32x32 or 48x48 while header avatar is 8x8
  const calculatePositionScale = () => {
    // The header avatar is 8x8, so we need to scale down the position values
    // Since we're applying transforms to a smaller image, use a smaller factor
    return 0.15; // Adjusted scaling factor for position values
  };

  // Listen for avatar update events
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      const { avatarData, timestamp, source } = event.detail;
      console.log("[Header] Received avatar-updated event:", 
        "Has avatar:", !!avatarData, 
        "Length:", avatarData?.length || 0,
        "Timestamp:", timestamp,
        "Source:", source || 'unknown');
      
      // Prioritize account setup related events
      const isPrioritySource = source === 'account-setup' || 
                             source === 'account-setup-final' ||
                             source === 'setup-completion' || 
                             source === 'setup-completion-delayed';
      
      // Only process if this is a newer event than the last one we processed
      // or if we're getting an event from account setup or setup completion
      const isNewerEvent = timestamp > lastAvatarUpdateTime.current;
      
      if ((isNewerEvent || isPrioritySource) && avatarData) {
        // Always prioritize account-setup-final, it should override any other event
        if (source === 'account-setup-final') {
          console.log("[Header] Prioritizing account-setup-final event");
          lastAvatarUpdateTime.current = timestamp;
          setCachedAvatarData(avatarData);
          setAvatarError(false);
          avatarRetryCount.current = 0;
          setAvatarKey(prev => prev + 1000); // Big increase to ensure new key
        }
        // Then handle other events
        else {
          lastAvatarUpdateTime.current = timestamp;
          setCachedAvatarData(avatarData);
          setAvatarError(false);
          avatarRetryCount.current = 0;
          setAvatarKey(prev => prev + 1);
        }
        console.log("[Header] Updated avatar from event, source:", source);
      }
    };

    // Add event listener for avatar updates
    window.addEventListener('avatar-updated', handleAvatarUpdate as EventListener);
    
    return () => {
      window.removeEventListener('avatar-updated', handleAvatarUpdate as EventListener);
    };
  }, []);

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
        console.log("[Header] Avatar settings:", user.avatarSettings ? 
          `zoom:${user.avatarSettings.zoom}, pos:(${user.avatarSettings.position.x},${user.avatarSettings.position.y})` : 
          "none");
        
        // Force re-render avatar when user changes
        setAvatarKey(prev => prev + 1);
      } else {
        console.log("[Header] User updated but no avatar present");
      }
      
      console.log("[Header] User updated:", 
        "Name:", user.name,
        "Avatar exists:", !!user.avatar, 
        "Avatar length:", user.avatar?.length || 0,
        "Avatar settings:", user.avatarSettings ? 
          `zoom:${user.avatarSettings.zoom}, pos:(${user.avatarSettings.position.x},${user.avatarSettings.position.y})` : 
          "none"
      );
      
      // Send a synthetic avatar update event to ensure all components are in sync
      if (user.avatar) {
        const eventTimestamp = Date.now();
        lastAvatarUpdateTime.current = eventTimestamp;
        
        window.dispatchEvent(new CustomEvent('avatar-updated', { 
          detail: { 
            avatarData: user.avatar, 
            timestamp: eventTimestamp,
            source: 'user-object-change'
          }
        }));
      }
    }
  }, [user]);

  // Check localStorage for avatar changes as fallback
  useEffect(() => {
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
  }, [cachedAvatarData]);

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

  // Force avatar refresh when the path changes to account setup
  // This helps ensure the avatar is up to date after setup is completed
  useEffect(() => {
    // Only fire once when component mounts
    const refreshAvatarFromLS = () => {
      try {
        const savedUserJson = localStorage.getItem("finsight_user");
        if (savedUserJson) {
          const savedUser = JSON.parse(savedUserJson);
          if (savedUser?.avatar) {
            console.log("[Header] Initial path change - forcing avatar refresh from localStorage");
            setCachedAvatarData(savedUser.avatar);
            setAvatarKey(prev => prev + 100); // Big jump to ensure new key
          }
        }
      } catch (error) {
        console.error("[Header] Error refreshing avatar on path change:", error);
      }
    };
    
    // When the component mounts, refresh avatar
    refreshAvatarFromLS();
  }, []);

  // Get the position scale factor
  const positionScale = calculatePositionScale();

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
