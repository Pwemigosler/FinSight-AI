
import React from 'react';
import Dashboard from "@/components/Dashboard";
import TransactionsView from "@/components/TransactionsView";
import GoalTracker from "@/components/GoalTracker";
import BudgetsView from "@/components/BudgetsView";
import ReportsView from "@/components/ReportsView";
import SettingsView from "@/components/SettingsView";

interface DesktopViewProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const DesktopView = ({ activeView, onNavigate }: DesktopViewProps) => {
  return (
    <div className="hidden md:block">
      {activeView === "dashboard" && <Dashboard onNavigate={onNavigate} />}
      {activeView === "transactions" && <TransactionsView />}
      {activeView === "goals" && <GoalTracker />}
      {activeView === "budgets" && <BudgetsView />}
      {activeView === "reports" && <ReportsView />}
      {activeView === "settings" && <SettingsView />}
    </div>
  );
};

export default DesktopView;
