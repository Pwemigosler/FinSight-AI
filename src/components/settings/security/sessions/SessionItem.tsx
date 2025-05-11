
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SessionItemProps = {
  isActive?: boolean;
  device: string;
  browser: string;
  lastActive: string;
};

export const SessionItem = ({ 
  isActive = false, 
  device, 
  browser, 
  lastActive 
}: SessionItemProps) => {
  return (
    <div className="p-4 flex items-start justify-between">
      <div className="space-y-1">
        <p className="font-medium">{isActive ? 'Current Session' : 'Session'}</p>
        <p className="text-sm text-muted-foreground">
          {device} • {browser} • Last active {lastActive}
        </p>
      </div>
      {isActive && (
        <Badge 
          variant="outline" 
          className={cn(
            "bg-green-100 text-green-800 hover:bg-green-100 border-transparent"
          )}
        >
          Active
        </Badge>
      )}
    </div>
  );
};
