
import { Brain, TrendingUp, AlertTriangle, Award, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const insights = [
  {
    id: 1,
    type: 'success',
    message: "You've reduced dining expenses by 15% this month. Keep it up!",
    icon: <Award className="h-5 w-5" />,
    bgColor: 'bg-green-50',
    iconColor: 'text-ptcustom-green',
  },
  {
    id: 2,
    type: 'warning',
    message: 'Subscription spending increased by $45 compared to last month.',
    icon: <AlertTriangle className="h-5 w-5" />,
    bgColor: 'bg-orange-50',
    iconColor: 'text-ptcustom-orange',
  },
  {
    id: 3,
    type: 'insight',
    message: 'Based on your recent spending, you could save an additional $320 next month.',
    icon: <TrendingUp className="h-5 w-5" />,
    bgColor: 'bg-blue-50',
    iconColor: 'text-ptcustom-blue',
  },
  {
    id: 4,
    type: 'suggestion',
    message: 'Your electricity bill seems higher than usual. Consider energy-saving options.',
    icon: <Sparkles className="h-5 w-5" />,
    bgColor: 'bg-blue-50',
    iconColor: 'text-ptcustom-blue',
  },
];

const AIInsights = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-ptcustom-blue" />
          <h2 className="text-lg font-bold">AI Financial Insights</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <div 
              key={insight.id}
              className={`${insight.bgColor} p-4 rounded-xl flex gap-3 items-start`}
            >
              <div className={`${insight.iconColor} p-2 bg-white rounded-full`}>
                {insight.icon}
              </div>
              <p className="text-sm">{insight.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
