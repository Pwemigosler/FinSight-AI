
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { HeaderActions } from "./header/HeaderActions";

interface HeaderProps {
  toggleSidebar?: () => void;
  onLogoClick?: () => void; // Custom prop for logo click behavior
}

const Header = ({ toggleSidebar, onLogoClick }: HeaderProps) => {
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
    // Call the onLogoClick callback if provided
    if (onLogoClick) {
      onLogoClick();
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

      <HeaderActions user={user} logout={logout} />
    </header>
  );
};

export default Header;
