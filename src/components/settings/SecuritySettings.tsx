
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { AlertCircle, Fingerprint, ShieldCheck } from "lucide-react";

export const SecuritySettings = () => {
  const [security, setSecurity] = useState({
    twoFactor: false,
    passwordUpdated: false
  });
  
  const { 
    user, 
    isBiometricsSupported, 
    isBiometricsRegistered,
    registerBiometrics,
    removeBiometrics
  } = useAuth();
  
  const [isBiometricLoading, setBiometricLoading] = useState(false);

  const handlePasswordChange = () => {
    setSecurity(prev => ({ ...prev, passwordUpdated: true }));
    toast("Password updated", {
      description: "Your password has been successfully changed."
    });
  };

  const handle2FAToggle = () => {
    setSecurity(prev => ({ ...prev, twoFactor: !prev.twoFactor }));
    
    if (!security.twoFactor) {
      toast("Two-Factor Authentication Enabled", {
        description: "Your account is now more secure with 2FA."
      });
    } else {
      toast("Two-Factor Authentication Disabled", {
        description: "2FA has been turned off for your account."
      });
    }
  };

  const handleBiometricsToggle = async () => {
    setBiometricLoading(true);
    
    try {
      let success;
      
      if (isBiometricsRegistered) {
        success = removeBiometrics();
      } else {
        success = await registerBiometrics();
      }
      
      if (success) {
        toast(isBiometricsRegistered 
          ? "Biometric authentication removed" 
          : "Biometric authentication enabled", {
          description: isBiometricsRegistered
            ? "You can re-enable biometric login at any time."
            : "You can now log in using your fingerprint or face."
        });
      }
    } catch (error) {
      console.error("Error toggling biometrics:", error);
      toast("Biometric operation failed", {
        description: "Please try again later."
      });
    } finally {
      setBiometricLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Manage your account security and authentication options.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-6">
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
          
          {isBiometricsSupported && (
            <div className="space-y-3">
              <Label>Biometric Authentication</Label>
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-medium">Use biometrics for faster login</p>
                      <p className="text-sm text-muted-foreground">
                        Sign in using your fingerprint, face recognition, or security key for quicker and more secure access.
                      </p>
                    </div>
                    <Button 
                      variant={isBiometricsRegistered ? "outline" : "default"}
                      onClick={handleBiometricsToggle}
                      disabled={isBiometricLoading}
                      className={isBiometricsRegistered ? 
                        "border-finsight-purple text-finsight-purple hover:bg-finsight-purple/10" : 
                        "bg-finsight-purple hover:bg-finsight-purple-dark"
                      }
                    >
                      {isBiometricLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Fingerprint className="h-4 w-4" />
                          {isBiometricsRegistered ? "Disable Biometrics" : "Enable Biometrics"}
                        </span>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!isBiometricsSupported && (
            <div className="p-3 text-sm bg-amber-50 border border-amber-200 rounded flex items-center gap-2 text-amber-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>
                Biometric authentication is not supported on this device or browser.
              </span>
            </div>
          )}
          
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
                    variant={security.twoFactor ? "outline" : "default"}
                    onClick={handle2FAToggle}
                    className={security.twoFactor ? 
                      "border-finsight-purple text-finsight-purple hover:bg-finsight-purple/10" : 
                      "bg-finsight-purple hover:bg-finsight-purple-dark"
                    }
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      {security.twoFactor ? "Disable 2FA" : "Enable 2FA"}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
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
        </div>
      </CardContent>
    </Card>
  );
};
