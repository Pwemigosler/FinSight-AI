
import { useState } from 'react';
import { Target, Plus, PiggyBank, Home, Car, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Mock goals data
const goalsData = [
  {
    id: 'g1',
    name: 'Emergency Fund',
    currentAmount: 5000,
    targetAmount: 10000,
    date: '2024-03-01',
    icon: <PiggyBank className="h-5 w-5" />,
    color: 'bg-finsight-blue',
    textColor: 'text-finsight-blue',
  },
  {
    id: 'g2',
    name: 'Down Payment',
    currentAmount: 12500,
    targetAmount: 50000,
    date: '2025-06-01',
    icon: <Home className="h-5 w-5" />,
    color: 'bg-finsight-purple',
    textColor: 'text-finsight-purple',
  },
  {
    id: 'g3',
    name: 'New Car',
    currentAmount: 2000,
    targetAmount: 20000,
    date: '2024-12-01',
    icon: <Car className="h-5 w-5" />,
    color: 'bg-finsight-orange',
    textColor: 'text-finsight-orange',
  },
];

const GoalTracker = () => {
  const [goals] = useState(goalsData);

  const calculatePercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-finsight-purple" />
            <h2 className="text-lg font-bold">Financial Goals</h2>
          </div>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            New Goal
          </Button>
        </div>
        
        <div className="space-y-6">
          {goals.map(goal => {
            const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount);
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`${goal.color} bg-opacity-20 p-1.5 rounded-md`}>
                      <div className={goal.textColor}>
                        {goal.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{goal.name}</h3>
                      <p className="text-xs text-gray-500">Target: {formatDate(goal.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatAmount(goal.currentAmount)}</p>
                    <p className="text-xs text-gray-500">of {formatAmount(goal.targetAmount)}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Progress value={percentage} className="h-2 bg-gray-100" indicatorClassName={goal.color} />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{percentage}% complete</span>
                    <span>{formatAmount(goal.targetAmount - goal.currentAmount)} to go</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalTracker;
