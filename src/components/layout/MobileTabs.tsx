
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "@/components/Dashboard";
import TransactionsView from "@/components/TransactionsView";
import GoalTracker from "@/components/GoalTracker";
import BudgetsView from "@/components/BudgetsView";
import ReportsView from "@/components/ReportsView";
import SettingsView from "@/components/SettingsView";
import BillsView from "@/components/BillsView";

interface MobileTabsProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onNavigate: (view: string) => void;
}

const MobileTabs = ({ activeView, onViewChange, onNavigate }: MobileTabsProps) => {
  return (
    <Tabs value={activeView} onValueChange={onViewChange} className="w-full">
      <TabsList className="w-full grid grid-cols-4 mb-4">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="bills">Bills</TabsTrigger>
        <TabsTrigger value="goals">Goals</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard">
        <Dashboard onNavigate={onNavigate} />
      </TabsContent>
      <TabsContent value="transactions">
        <div className="p-4">
          <TransactionsView />
        </div>
      </TabsContent>
      <TabsContent value="bills">
        <div className="p-4">
          <BillsView />
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
  );
};

export default MobileTabs;
