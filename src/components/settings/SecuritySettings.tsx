
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { AlertCircle, Fingerprint, ShieldCheck, AlertTriangle } from "lucide-react";

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
  const [biometricError, setBiometricError] = useState<string | null>(null);

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
    // Clear any previous errors
    setBiometricError(null);
    setBiometricLoading(true);
    
    try {
      let success;
      let errorMessage;
      
      if (isBiometricsRegistered) {
        success = removeBiometrics();
        if (!success) {
          setBiometricError("Failed to remove biometric authentication");
        }
      } else {
        const result = await registerBiometrics();
        if (typeof result === 'object' && result !== null && 'error' in result) {
          // Handle case where registerBiometrics returns {success: boolean, error: string}
          success = result.success;
          errorMessage = result.error;
        } else {
          // Handle case where registerBiometrics returns boolean
          success = result;
        }
        
        if (!success) {
          setBiometricError(errorMessage || "Failed to set up biometric authentication");
        }
      }
      
      if (success) {
        setBiometricError(null);
        toast(isBiometricsRegistered 
          ? "Biometric authentication removed" 
          : "Biometric authentication enabled", {
          description: isBiometricsRegistered
            ? "You can re-enable biometric login at any time."
            : "You can now log in using your fingerprint or face."
        });
      }
    } catch (error: any) {
      console.error("Error toggling biometrics:", error);
      setBiometricError(error.message || "Failed to set up biometric authentication");
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
                      variant="blue"
                      onClick={handleBiometricsToggle}
                      disabled={isBiometricLoading}
                      className={isBiometricLoading ? "opacity-70" : ""}
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
                  
                  {biometricError && (
                    <div className="mt-4">
                      <Alert variant="destructive" className="text-sm bg-red-50 border-red-200">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{biometricError}</AlertDescription>
                      </Alert>
                      
                      {biometricError.includes("secure context") && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          <strong>Note:</strong> Biometric authentication requires a secure context (HTTPS or localhost).
                          The feature may not work on non-secure origins or in iframes.
                        </p>
                      )}
                    </div>
                  )}
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
                    variant="blue"
                    onClick={handle2FAToggle}
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
