
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Receipt, ChevronRight, CreditCard, PieChart, FileText, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import SidebarFooter from "./SidebarFooter";

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  separator?: boolean;
}

interface SidebarProps {
  className?: string;
  activeView?: string;
  handleNavigation?: (view: string) => void;
}

const Sidebar = ({ 
  className,
  activeView = "", 
  handleNavigation = () => {}
}: SidebarProps) => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/",
    },
    {
      title: "AI Assistant",
      icon: <MessageSquare className="h-5 w-5" />,
      path: "/chat",
    },
    {
      title: "Transactions",
      icon: <CreditCard className="h-5 w-5" />,
      path: "/transactions",
    },
    {
      title: "Bills",
      icon: <Receipt className="h-5 w-5" />,
      path: "/bills",
    },
    {
      title: "Budgets",
      icon: <PieChart className="h-5 w-5" />,
      path: "/budgets",
    },
    {
      title: "Documents & AI",
      icon: <FileText className="h-5 w-5" />,
      path: "/documents",
      separator: true,
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/settings",
    },
  ];

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-white border-r", className)}>
      <div className="p-4 flex items-center">
        <h2 className="text-xl font-bold text-finsight-purple-dark">
          FinSight<span className="ml-1 text-finsight-purple">AI</span>
        </h2>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.separator && <div className="h-px bg-gray-200 my-2 mx-4" />}
              <Link 
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-2 text-sm mx-2 rounded-md",
                  isCurrentPath(item.path)
                    ? "bg-finsight-purple/10 text-finsight-purple font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.title}</span>
                {isCurrentPath(item.path) && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
      
      <SidebarFooter activeView={activeView} handleNavigation={handleNavigation} />
    </div>
  );
};

export default Sidebar;
