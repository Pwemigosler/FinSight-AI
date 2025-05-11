
import { useState, useEffect } from "react";
import { SessionManagementService } from "@/contexts/auth/services/SessionManagementService";

type Session = {
  id: string;
  isActive: boolean;
  device: string;
  browser: string;
  lastActive: string;
};

export const useSessionManagement = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const sessionService = new SessionManagementService();

  useEffect(() => {
    // Load sessions on mount
    const activeSessions = sessionService.getActiveSessions();
    setSessions(activeSessions);
  }, []);

  const terminateSession = (sessionId: string) => {
    if (sessionService.terminateSession(sessionId)) {
      setSessions((prev) => prev.filter(session => session.id !== sessionId));
    }
  };

  const terminateAllOtherSessions = () => {
    if (sessionService.terminateAllOtherSessions()) {
      setSessions((prev) => prev.filter(session => session.isActive));
    }
  };

  return {
    sessions,
    terminateSession,
    terminateAllOtherSessions
  };
};
