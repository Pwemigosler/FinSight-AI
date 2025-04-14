
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  LineChart, 
  ListChecks, 
  Target, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react";
import Dashboard from "@/components/Dashboard";
import TransactionsView from "@/components/TransactionsView";
import GoalTracker from "@/components/GoalTracker";
import Header from "@/components/Header";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`bg-white border-r border-gray-100 w-64 flex-shrink-0 transition-all duration-300 ease-in-out flex flex-col 
                     ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
                     fixed md:relative h-[calc(100vh-64px)] z-20`}
        >
          <div className="p-4 flex-1">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500">
                <CreditCard className="h-5 w-5" />
                Transactions
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500">
                <ListChecks className="h-5 w-5" />
                Budgets
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500">
                <Target className="h-5 w-5" />
                Goals
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500">
                <LineChart className="h-5 w-5" />
                Reports
              </Button>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-100">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500">
                <Settings className="h-5 w-5" />
                Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-gray-500">
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </aside>
        
        {/* Sidebar overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1600px] mx-auto">
            <div className="hidden md:block">
              <Dashboard />
            </div>
            
            <div className="md:hidden">
              <Tabs defaultValue="dashboard" className="w-full">
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
              </Tabs>
            </div>

            <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
              <div className="lg:col-span-2">
                <TransactionsView />
              </div>
              <div>
                <GoalTracker />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
