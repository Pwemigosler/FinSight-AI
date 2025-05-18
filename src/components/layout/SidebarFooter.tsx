
import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface SidebarFooterProps {
  activeView: string;
  handleNavigation: (view: string) => void;
}

const SidebarFooter = ({ activeView, handleNavigation }: SidebarFooterProps) => {
  return (
    <div className="p-4 border-t border-gray-100">
      <div className="space-y-1">
        <Button 
          variant={activeView === "settings" ? "default" : "ghost"}
          className={`w-full justify-start gap-3 ${activeView === "settings" ? "bg-ptcustom-blue text-white" : "text-gray-500"}`}
          onClick={() => handleNavigation("settings")}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default SidebarFooter;
