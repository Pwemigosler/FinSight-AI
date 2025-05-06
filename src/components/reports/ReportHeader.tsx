
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportHeaderProps {
  reportPeriod: string;
  onReportPeriodChange: (period: string) => void;
}

const ReportHeader = ({ reportPeriod, onReportPeriodChange }: ReportHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
      <h1 className="text-2xl font-bold">Financial Reports</h1>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="text-xs">
          <Filter className="h-3 w-3 mr-1" />
          Filter
        </Button>
        <select 
          value={reportPeriod} 
          onChange={(e) => onReportPeriodChange(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="last3months">Last 3 Months</option>
          <option value="last6months">Last 6 Months</option>
          <option value="lastyear">Last Year</option>
        </select>
      </div>
    </div>
  );
};

export default ReportHeader;
