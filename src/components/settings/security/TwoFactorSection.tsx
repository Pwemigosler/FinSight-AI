
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const TwoFactorSection = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handle2FAToggle = () => {
    setTwoFactorEnabled(prev => !prev);
    
    if (!twoFactorEnabled) {
      toast("Two-Factor Authentication Enabled", {
        description: "Your account is now more secure with 2FA."
      });
    } else {
      toast("Two-Factor Authentication Disabled", {
        description: "2FA has been turned off for your account."
      });
    }
  };

  return (
    <div className="space-y-3">
      <Label>Two-Factor Authentication</Label>
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-medium">Protect your account with 2FA</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security by requiring a verification code when you sign in.
              </p>
            </div>
            <Button 
              variant="blue"
              onClick={handle2FAToggle}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
