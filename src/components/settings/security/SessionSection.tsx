
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SessionList } from "./sessions/SessionList";
import { useSessionManagement } from "./sessions/useSessionManagement";
import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth";

export const SessionSection = () => {
  const { sessions, loading, terminateSession } = useSessionManagement();
  const { user } = useAuth();
  
  const handleTerminateAllSessions = async () => {
    // This function would handle terminating all sessions except the current one
    // In a real application, we would implement this feature
    console.log("Terminate all sessions requested");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Label className="text-base">Session Management</Label>
        
        {sessions.length > 1 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleTerminateAllSessions}
          >
            Terminate All Other Sessions
          </Button>
        )}
      </div>
      
      {!user && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Authentication required</AlertTitle>
          <AlertDescription>
            You need to be logged in to view and manage your sessions.
          </AlertDescription>
        </Alert>
      )}
      
      <SessionList 
        sessions={sessions} 
        loading={loading} 
        onTerminateSession={terminateSession} 
      />
      
      <p className="text-sm text-muted-foreground mt-2">
        Biometric sessions remain active for 30 minutes after last use. For enhanced security, 
        you can terminate any session that you don't recognize.
      </p>
    </div>
  );
};
