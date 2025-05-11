
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const PasswordSection = () => {
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const handlePasswordChange = () => {
    setPasswordUpdated(true);
    toast("Password updated", {
      description: "Your password has been successfully changed."
    });
  };

  return (
    <div className="space-y-3">
      <Label>Password</Label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="password"
          value="••••••••••"
          readOnly
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1"
        />
        <Button variant="outline" onClick={handlePasswordChange} className="border-finsight-purple text-finsight-purple hover:bg-finsight-purple/10">
          Change Password
        </Button>
      </div>
    </div>
  );
};
