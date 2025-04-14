
import { useEffect, useState } from 'react';
import { ArrowUpRight, BadgeDollarSign, CreditCard, LineChart, PiggyBank, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import StatCard from './ui/StatCard';
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import BudgetOverview from './BudgetOverview';
import AIInsights from './AIInsights';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock data for initial display
const spendingData = [
  { name: 'Jan', amount: 2400 },
  { name: 'Feb', amount: 1398 },
  { name: 'Mar', amount: 2800 },
  { name: 'Apr', amount: 3908 },
  { name: 'May', amount: 2800 },
  { name: 'Jun', amount: 3800 },
  { name: 'Jul', amount: 4300 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 rounded-md shadow-md">
        <p className="font-medium">{`${label}`}</p>
        <p className="font-bold text-finsight-purple">{`$${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">Financial Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value="$24,562.00"
          icon={<Wallet className="h-5 w-5" />}
          className="animate-fade-in"
        />
        <StatCard
          title="Monthly Income"
          value="$8,350.00"
          icon={<BadgeDollarSign className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
          className="animate-fade-in animate-delay-100"
        />
        <StatCard
          title="Monthly Spending"
          value="$4,300.00"
          icon={<CreditCard className="h-5 w-5" />}
          trend={{ value: 8, isPositive: false }}
          className="animate-fade-in animate-delay-200"
        />
        <StatCard
          title="Savings"
          value="$12,680.00"
          icon={<PiggyBank className="h-5 w-5" />}
          trend={{ value: 24, isPositive: true }}
          className="animate-fade-in animate-delay-300"
        />
      </div>

      {/* Spending Chart & Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 animate-fade-in animate-delay-100">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Spending Trends</h2>
              <div className="flex items-center gap-1 text-sm font-medium text-finsight-purple">
                View Details
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={spendingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#9b87f5"
                    strokeWidth={2}
                    dot={{ fill: '#9b87f5', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#6E59A5' }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="animate-fade-in animate-delay-200">
          <CardContent className="p-6">
            <BudgetOverview />
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <div className="animate-fade-in animate-delay-300">
        <AIInsights />
      </div>
    </div>
  );
};

export default Dashboard;
