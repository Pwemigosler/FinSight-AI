
import { SessionItem } from "./SessionItem";

type Session = {
  id: string;
  isActive: boolean;
  device: string;
  browser: string;
  lastActive: string;
};

type SessionListProps = {
  sessions: Session[];
};

export const SessionList = ({ sessions }: SessionListProps) => {
  return (
    <div className="rounded-md border divide-y">
      {sessions.map((session) => (
        <SessionItem
          key={session.id}
          isActive={session.isActive}
          device={session.device}
          browser={session.browser}
          lastActive={session.lastActive}
        />
      ))}
    </div>
  );
};
