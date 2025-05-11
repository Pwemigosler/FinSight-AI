
import { Label } from "@/components/ui/label";

export const SessionSection = () => {
  return (
    <div className="space-y-3">
      <Label>Session Management</Label>
      <div className="rounded-md border">
        <div className="p-4 flex items-start justify-between">
          <div className="space-y-1">
            <p className="font-medium">Current Session</p>
            <p className="text-sm text-muted-foreground">
              Windows • Chrome • Last active now
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800 hover:bg-primary/80">
            Active
          </span>
        </div>
      </div>
    </div>
  );
};
