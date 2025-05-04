
import { FinancialInsight } from "@/types/chat";
import { PiggyBank, TrendingUp, TrendingDown, Wallet, AlertCircle, LineChart } from "lucide-react";

interface FinancialInsightCardProps {
  insight: FinancialInsight;
}

const getInsightIcon = (type: string, impact?: string) => {
  switch (type) {
    case "saving":
      return <PiggyBank className="h-4 w-4 text-finsight-green" />;
    case "spending":
      return impact === "negative" 
        ? <TrendingUp className="h-4 w-4 text-finsight-red" />
        : <TrendingDown className="h-4 w-4 text-finsight-green" />;
    case "budget":
      return <Wallet className="h-4 w-4 text-finsight-blue" />;
    case "suggestion":
      return <AlertCircle className="h-4 w-4 text-finsight-purple" />;
    default:
      return <LineChart className="h-4 w-4 text-finsight-blue" />;
  }
};

const FinancialInsightCard = ({ insight }: FinancialInsightCardProps) => {
  const getBgColor = () => {
    switch (insight.impact) {
      case "positive": return "bg-green-50";
      case "negative": return "bg-red-50";
      case "neutral": return "bg-blue-50";
      default: return "bg-gray-50";
    }
  };

  const getTextColor = () => {
    switch (insight.impact) {
      case "positive": return "text-green-700";
      case "negative": return "text-red-700";
      case "neutral": return "text-blue-700";
      default: return "text-gray-700";
    }
  };

  return (
    <div className={`${getBgColor()} rounded-md p-3 mb-2`}>
      <div className="flex items-start gap-2">
        <div className="mt-1">{getInsightIcon(insight.type, insight.impact)}</div>
        <div>
          <h4 className={`font-medium text-sm ${getTextColor()}`}>{insight.title}</h4>
          <p className="text-sm">{insight.description}</p>
          {insight.category && (
            <span className="text-xs text-gray-500">Category: {insight.category}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialInsightCard;
