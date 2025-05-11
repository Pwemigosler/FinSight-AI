
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SessionItemProps = {
  id: string;
  isActive?: boolean;
  device: string;
  browser: string;
  lastActive: string;
  onTerminate?: (id: string) => Promise<boolean>;
};

export const SessionItem = ({ 
  id,
  isActive = false, 
  device, 
  browser, 
  lastActive,
  onTerminate
}: SessionItemProps) => {
  const [isTerminating, setIsTerminating] = useState(false);
  
  const handleTerminate = async () => {
    if (!onTerminate) return;
    
    setIsTerminating(true);
    try {
      const success = await onTerminate(id);
      
      if (success) {
        toast.success("Session terminated successfully");
      } else {
        toast.error("Failed to terminate session");
      }
    } catch (error) {
      console.error("Error terminating session:", error);
      toast.error("An error occurred while terminating the session");
    } finally {
      setIsTerminating(false);
    }
  };

  return (
    <div className="p-4 flex items-start justify-between">
      <div className="space-y-1">
        <p className="font-medium">{isActive ? 'Current Session' : 'Session'}</p>
        <p className="text-sm text-muted-foreground">
          {device} • {browser} • Last active {lastActive}
        </p>
      </div>
      <div className="flex items-center gap-2">
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
        
        {onTerminate && !isTerminating && (
          <Button
            variant="ghost" 
            size="sm" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleTerminate}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Terminate Session</span>
          </Button>
        )}
        
        {isTerminating && (
          <Button
            variant="ghost" 
            size="sm" 
            disabled
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="sr-only">Terminating...</span>
          </Button>
        )}
      </div>
    </div>
  );
};
