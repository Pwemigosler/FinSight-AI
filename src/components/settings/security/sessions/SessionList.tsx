
import { Loader2 } from "lucide-react";
import { SessionItem } from "./SessionItem";

export type Session = {
  id: string;
  isActive: boolean;
  device: string;
  browser: string;
  lastActive: string;
};

type SessionListProps = {
  sessions: Session[];
  loading?: boolean;
  onTerminateSession?: (id: string) => Promise<boolean>;
};

export const SessionList = ({ sessions, loading, onTerminateSession }: SessionListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8 border rounded-md">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading sessions...</p>
        </div>
      </div>
    );
  }
  
  if (sessions.length === 0) {
    return (
      <div className="py-8 text-center border rounded-md">
        <p className="text-muted-foreground">No active sessions found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border divide-y">
      {sessions.map((session) => (
        <SessionItem
          key={session.id}
          id={session.id}
          isActive={session.isActive}
          device={session.device}
          browser={session.browser}
          lastActive={session.lastActive}
          onTerminate={onTerminateSession}
        />
      ))}
    </div>
  );
};
