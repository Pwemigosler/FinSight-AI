
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  LineChart, 
  ListChecks, 
  Target, 
  CreditCard, 
  Settings
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  handleNavigation: (view: string) => void;
}

const Sidebar = ({ activeView, handleNavigation }: SidebarProps) => {
  return (
    <div className="p-4 flex-1">
      <div className="space-y-1">
        <Button 
          variant={activeView === "dashboard" ? "default" : "ghost"} 
          className={`w-full justify-start gap-3 ${activeView === "dashboard" ? "bg-ptcustom-blue text-white" : ""}`}
          onClick={() => handleNavigation("dashboard")}
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Button>
        <Button 
          variant={activeView === "transactions" ? "default" : "ghost"} 
          className={`w-full justify-start gap-3 ${activeView === "transactions" ? "bg-ptcustom-blue text-white" : "text-gray-500"}`}
          onClick={() => handleNavigation("transactions")}
        >
          <CreditCard className="h-5 w-5" />
          Transactions
        </Button>
        <Button 
          variant={activeView === "budgets" ? "default" : "ghost"} 
          className={`w-full justify-start gap-3 ${activeView === "budgets" ? "bg-ptcustom-blue text-white" : "text-gray-500"}`}
          onClick={() => handleNavigation("budgets")}
        >
          <ListChecks className="h-5 w-5" />
          Budgets
        </Button>
        <Button 
          variant={activeView === "goals" ? "default" : "ghost"} 
          className={`w-full justify-start gap-3 ${activeView === "goals" ? "bg-ptcustom-blue text-white" : "text-gray-500"}`}
          onClick={() => handleNavigation("goals")}
        >
          <Target className="h-5 w-5" />
          Goals
        </Button>
        <Button 
          variant={activeView === "reports" ? "default" : "ghost"} 
          className={`w-full justify-start gap-3 ${activeView === "reports" ? "bg-ptcustom-blue text-white" : "text-gray-500"}`}
          onClick={() => handleNavigation("reports")}
        >
          <LineChart className="h-5 w-5" />
          Reports
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
