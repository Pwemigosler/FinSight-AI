
import { useState, useEffect } from "react";
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
import Header from "@/components/Header";
import { useTheme } from "@/contexts/theme/ThemeContext";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const { isDarkMode, isCompactView } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // Apply dark mode class to body
    document.body.classList.toggle('dark', isDarkMode);
    document.body.classList.toggle('compact', isCompactView);
    return () => {
      document.body.classList.remove('dark', 'compact');
    };
  }, [isDarkMode, isCompactView]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigation = (view: string) => {
    if (view === "settings") {
      navigate('/settings');
      return;
    }
    
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
          className={`bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 w-64 flex-shrink-0 transition-all duration-300 ease-in-out flex flex-col 
                     ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
                     fixed md:relative h-[calc(100vh-64px)] z-20`}
        >
          <div className="p-4 flex-1">
            <div className="space-y-1">
              <Button 
                variant={activeView === "dashboard" ? "default" : "ghost"} 
                className={`w-full justify-start gap-3 ${activeView === "dashboard" ? "bg-ptcustom-blue text-white" : ""}`}
                onClick={() => handleNavigation("dashboard")}
                data-view="dashboard"
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Button>
              <Button 
                variant={activeView === "transactions" ? "default" : "ghost"} 
                className={`w-full justify-start gap-3 ${activeView === "transactions" ? "bg-ptcustom-blue text-white" : "text-gray-500 dark:text-gray-300"}`}
                onClick={() => handleNavigation("transactions")}
                data-view="transactions"
              >
                <CreditCard className="h-5 w-5" />
                Transactions
              </Button>
              <Button 
                variant={activeView === "budgets" ? "default" : "ghost"} 
                className={`w-full justify-start gap-3 ${activeView === "budgets" ? "bg-ptcustom-blue text-white" : "text-gray-500 dark:text-gray-300"}`}
                onClick={() => handleNavigation("budgets")}
                data-view="budgets"
              >
                <ListChecks className="h-5 w-5" />
                Budgets
              </Button>
              <Button 
                variant={activeView === "goals" ? "default" : "ghost"} 
                className={`w-full justify-start gap-3 ${activeView === "goals" ? "bg-ptcustom-blue text-white" : "text-gray-500 dark:text-gray-300"}`}
                onClick={() => handleNavigation("goals")}
                data-view="goals"
              >
                <Target className="h-5 w-5" />
                Goals
              </Button>
              <Button 
                variant={activeView === "reports" ? "default" : "ghost"} 
                className={`w-full justify-start gap-3 ${activeView === "reports" ? "bg-ptcustom-blue text-white" : "text-gray-500 dark:text-gray-300"}`}
                onClick={() => handleNavigation("reports")}
                data-view="reports"
              >
                <LineChart className="h-5 w-5" />
                Reports
              </Button>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <div className="space-y-1">
              <Button 
                variant="ghost"
                className="w-full justify-start gap-3 text-gray-500 dark:text-gray-300"
                onClick={() => handleNavigation("settings")}
                data-view="settings"
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
        
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <div className="max-w-[1600px] mx-auto">
            <div className="hidden md:block">
              {activeView === "dashboard" && <Dashboard />}
              {activeView === "transactions" && <TransactionsView />}
              {activeView === "goals" && <GoalTracker />}
              {activeView === "budgets" && <BudgetsView />}
              {activeView === "reports" && <ReportsView />}
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
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
