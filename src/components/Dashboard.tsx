
import { useEffect, useState } from 'react';
import { LineChart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import BudgetOverview from './BudgetOverview';
import AIInsights from './AIInsights';
import ReceiptCard from './dashboard/ReceiptCard';
import StatCardsSection from './dashboard/StatCardsSection';
import SpendingTrends from './dashboard/SpendingTrends';
import { spendingData } from './dashboard/DashboardData';

interface DashboardProps {
  onNavigate?: (view: string) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleViewDetails = () => {
    if (onNavigate) {
      onNavigate('reports');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">Financial Dashboard</h1>
      
      {/* Stats Overview */}
      <StatCardsSection />

      {/* Spending Chart, Budget Overview, and Receipt Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SpendingTrends 
          data={spendingData} 
          onViewDetails={handleViewDetails} 
        />

        <Card className="animate-fade-in animate-delay-200">
          <CardContent className="p-6">
            <BudgetOverview onNavigate={onNavigate} />
          </CardContent>
        </Card>
      </div>

      {/* Second row with Receipt Card and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 animate-fade-in animate-delay-200">
          <ReceiptCard />
        </div>
        
        <div className="lg:col-span-2 animate-fade-in animate-delay-300">
          <AIInsights />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
