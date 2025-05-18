
import React, { useState } from 'react';
import ReportHeader from './reports/ReportHeader';
import MonthlyExpensesChart from './reports/MonthlyExpensesChart';
import CategorySpendingChart from './reports/CategorySpendingChart';
import SavingsChart from './reports/SavingsChart';
import FinancialSummaryCard from './reports/FinancialSummaryCard';
import { 
  monthlyExpensesData, 
  categorySpendingData, 
  savingsHistoryData, 
  MONTHS,
  calculateAverageSavings
} from './reports/ReportData';
import { useToast } from "@/components/ui/use-toast";

const ReportsView = () => {
  const [reportPeriod, setReportPeriod] = useState("last6months");
  const { toast } = useToast();
  
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
  
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <ReportHeader 
        reportPeriod={reportPeriod} 
        onReportPeriodChange={handleReportPeriodChange} 
      />

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
    </div>
  );
};

export default ReportsView;
