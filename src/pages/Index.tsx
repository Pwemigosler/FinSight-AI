
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  LineChart, 
  ListChecks, 
  Target, 
  CreditCard, 
  Settings
} from "lucide-react";
import Dashboard from "@/components/Dashboard";
import TransactionsView from "@/components/TransactionsView";
import GoalTracker from "@/components/GoalTracker";
import BudgetsView from "@/components/BudgetsView";
import ReportsView from "@/components/ReportsView";
import SettingsView from "@/components/SettingsView";
import Header from "@/components/Header";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigation = (view: string) => {
    setActiveView(view);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <aside 
          className={`bg-white border-r border-gray-100 w-64 flex-shrink-0 transition-all duration-300 ease-in-out flex flex-col 
                     ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
                     fixed md:relative h-[calc(100vh-64px)] z-20`}
        >
          <div className="p-4 flex-1">
            <div className="space-y-1">
              <Button 
                variant={activeView === "dashboard" ? "default" : "ghost"} 
                className={`w-full justify-start gap-3 ${activeView === "dashboard" ? "bg-finsight-purple text-white" : ""}`}
                onClick={() => handleNavigation("dashboard")}
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Button>
              <Button 
                variant={activeView === "transactions" ? "default" : "ghost"} 
                className={`w-full justify-start gap-3 ${activeView === "transactions" ? "bg-finsight-purple text-white" : "text-gray-500"}`}
                onClick={() => handleNavigation("transactions")}
              >
                <CreditCard className="h-5 w-5" />
                Transactions
              </Button>
              <Button 
                variant={activeView === "budgets" ? "default" : "ghost"} 
                className={`w-full justify-start gap-3 ${activeView === "budgets" ? "bg-finsight-purple text-white" : "text-gray-500"}`}
                onClick={() => handleNavigation("budgets")}
              >
                <ListChecks className="h-5 w-5" />
                Budgets
              </Button>
              <Button 
                variant={activeView === "goals" ? "default" : "ghost"} 
                className={`w-full justify-start gap-3 ${activeView === "goals" ? "bg-finsight-purple text-white" : "text-gray-500"}`}
                onClick={() => handleNavigation("goals")}
              >
                <Target className="h-5 w-5" />
                Goals
              </Button>
              <Button 
                variant={activeView === "reports" ? "default" : "ghost"} 
                className={`w-full justify-start gap-3 ${activeView === "reports" ? "bg-finsight-purple text-white" : "text-gray-500"}`}
                onClick={() => handleNavigation("reports")}
              >
                <LineChart className="h-5 w-5" />
                Reports
              </Button>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-100">
            <div className="space-y-1">
              <Button 
                variant={activeView === "settings" ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${activeView === "settings" ? "bg-finsight-purple text-white" : "text-gray-500"}`}
                onClick={() => handleNavigation("settings")}
              >
                <Settings className="h-5 w-5" />
                Settings
              </Button>
            </div>
          </div>
        </aside>
        
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={toggleSidebar}
          />
        )}
        
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1600px] mx-auto">
            <div className="hidden md:block">
              {activeView === "dashboard" && <Dashboard />}
              {activeView === "transactions" && <TransactionsView />}
              {activeView === "goals" && <GoalTracker />}
              {activeView === "budgets" && <BudgetsView />}
              {activeView === "reports" && <ReportsView />}
              {activeView === "settings" && <SettingsView />}
            </div>
            
            <div className="md:hidden">
              <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard">
                  <Dashboard />
                </TabsContent>
                <TabsContent value="transactions">
                  <div className="p-4">
                    <TransactionsView />
                  </div>
                </TabsContent>
                <TabsContent value="goals">
                  <div className="p-4">
                    <GoalTracker />
                  </div>
                </TabsContent>
                <TabsContent value="budgets">
                  <div className="p-4">
                    <BudgetsView />
                  </div>
                </TabsContent>
                <TabsContent value="reports">
                  <div className="p-4">
                    <ReportsView />
                  </div>
                </TabsContent>
                <TabsContent value="settings">
                  <div className="p-4">
                    <SettingsView />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
