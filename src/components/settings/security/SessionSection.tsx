
import { Label } from "@/components/ui/label";
import { SessionList } from "./sessions/SessionList";
import { useSessionManagement } from "./sessions/useSessionManagement";

export const SessionSection = () => {
  const { sessions } = useSessionManagement();

  return (
    <div className="space-y-3">
      <Label>Session Management</Label>
      <SessionList sessions={sessions} />
    </div>
  );
};
