
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard = ({ title, value, icon, trend, className }: StatCardProps) => {
  return (
    <div className={cn("financial-card flex flex-col", className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {icon && <div className="text-finsight-purple">{icon}</div>}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <div className="mt-1 flex items-center text-sm">
          <span className={`${trend.isPositive ? 'text-finsight-green' : 'text-finsight-red'} font-medium`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-gray-500 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
