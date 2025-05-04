
import { Message } from "@/types/chat";
import { Wallet, CreditCard, PiggyBank, LineChart, Receipt } from "lucide-react";

interface ActionStatusBadgeProps {
  action: Message["action"];
}

export const getActionIcon = (action?: Message["action"]) => {
  if (!action) return null;
  
  switch (action.type) {
    case "allocation":
      return <Wallet className="h-5 w-5 text-finsight-green" />;
    case "transfer":
      return <CreditCard className="h-5 w-5 text-finsight-purple" />;
    case "view":
      return <PiggyBank className="h-5 w-5 text-finsight-blue" />;
    case "analysis":
      return <LineChart className="h-5 w-5 text-finsight-blue" />;
    case "receipts_view":
      return <Receipt className="h-5 w-5 text-finsight-green" />;
    default:
      return null;
  }
};

const ActionStatusBadge = ({ action }: ActionStatusBadgeProps) => {
  if (!action) return null;

  if (action.status === "success") {
    return (
      <div className="flex items-center gap-2 mb-2 py-1 px-2 bg-green-100 text-green-800 rounded-md text-sm">
        {getActionIcon(action)}
        <span>Action completed</span>
      </div>
    );
  }

  if (action.status === "error") {
    return (
      <div className="flex items-center gap-2 mb-2 py-1 px-2 bg-red-100 text-red-800 rounded-md text-sm">
        {getActionIcon(action)}
        <span>Action failed</span>
      </div>
    );
  }

  return null;
};

export default ActionStatusBadge;
