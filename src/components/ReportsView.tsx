
import React, { useState } from 'react';
import ReportHeader from './reports/ReportHeader';
import MonthlyExpensesChart from './reports/MonthlyExpensesChart';
import CategorySpendingChart from './reports/CategorySpendingChart';
import SavingsChart from './reports/SavingsChart';
import FinancialSummaryCard from './reports/FinancialSummaryCard';
import ReportExporter from './reports/ReportExporter';
import { 
  monthlyExpensesData, 
  categorySpendingData, 
  savingsHistoryData, 
  MONTHS,
  calculateAverageSavings
} from './reports/ReportData';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/auth';

const ReportsView = () => {
  const [reportPeriod, setReportPeriod] = useState("last6months");
  const { toast } = useToast();
  const { user } = useAuth();
  
  // If user is logged in but has no data, show empty state
  const hasData = user ? false : true; // In a real app, check if user has data
  
  const handleReportPeriodChange = (period: string) => {
    setReportPeriod(period);
  };

  // Handler functions for detail buttons
  const handleExpensesDetails = () => {
    toast({
      title: "Monthly Expenses Details",
      description: "Detailed monthly expenses view will be available soon.",
      duration: 3000,
    });
  };

  const handleCategoryDetails = () => {
    toast({
      title: "Category Spending Details",
      description: "Detailed category spending breakdown will be available soon.",
      duration: 3000,
    });
  };

  const handleSavingsDetails = () => {
    toast({
      title: "Savings History Details",
      description: "Detailed savings history analytics will be available soon.",
      duration: 3000,
    });
  };

  const averageSavings = calculateAverageSavings(savingsHistoryData);
  
  // Empty state component
  const EmptyReportsState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="bg-gray-100 p-6 rounded-full mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold mb-2">No reports available yet</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">
        Start adding transactions to generate financial reports and insights.
      </p>
    </div>
  );
  
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <ReportHeader 
          reportPeriod={reportPeriod} 
          onReportPeriodChange={handleReportPeriodChange} 
        />
        <ReportExporter />
      </div>

      {hasData ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income vs Expenses Chart */}
            <MonthlyExpensesChart 
              data={monthlyExpensesData} 
              onViewDetails={handleExpensesDetails} 
            />

            {/* Category Spending Chart */}
            <CategorySpendingChart 
              data={categorySpendingData} 
              onViewDetails={handleCategoryDetails}
            />

            {/* Monthly Savings Chart */}
            <SavingsChart 
              data={savingsHistoryData} 
              onViewDetails={handleSavingsDetails}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Financial Summary Cards */}
            <FinancialSummaryCard 
              title="Average Monthly Savings"
              value={`$${averageSavings}`}
              subtitle={`For ${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`}
            />

            <FinancialSummaryCard 
              title="Highest Expense Category"
              value="Housing"
              subtitle="$1,800 this month"
            />

            <FinancialSummaryCard 
              title="Year-to-Date Savings"
              value="$12,680"
              subtitle="24% increase from last year"
            />
          </div>
        </>
      ) : (
        <EmptyReportsState />
      )}
    </div>
  );
};

export default ReportsView;
