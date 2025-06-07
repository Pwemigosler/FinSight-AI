import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Fingerprint, AlertTriangle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth";

export const BiometricSection = () => {
  const { 
    user,
    isBiometricsSupported, 
    isBiometricsRegistered,
    registerBiometrics,
    removeBiometrics
  } = useAuth();
  
  const [isBiometricLoading, setBiometricLoading] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const [localBiometricsRegistered, setLocalBiometricsRegistered] = useState<boolean>(isBiometricsRegistered);

  // Keep local state in sync with context
  useEffect(() => {
    setLocalBiometricsRegistered(isBiometricsRegistered);
  }, [isBiometricsRegistered]);

  const handleBiometricsToggle = async () => {
    // Clear any previous errors
    setBiometricError(null);
    setBiometricLoading(true);
    
    try {
      let success = false;
      let errorMessage: string | undefined;
      
      if (localBiometricsRegistered) {
        success = await removeBiometrics();
        if (success) {
          setLocalBiometricsRegistered(false);
        } else {
          setBiometricError("Failed to remove biometric authentication");
        }
      } else {
        const result = await registerBiometrics();
        
        // Handle different return types from registerBiometrics
        if (result) {
          if (typeof result === 'object' && result !== null) {
            success = result.success;
            errorMessage = result.error;
          } else {
            success = !!result;
          }
        } else {
          success = false;
          errorMessage = "Failed to set up biometric authentication";
        }
        
        if (success) {
          setLocalBiometricsRegistered(true);
          setBiometricError(null);
        } else {
          setBiometricError(errorMessage || "Failed to set up biometric authentication");
        }
      }
    } catch (error: unknown) {
      console.error("Error toggling biometrics:", error);
      const err = error as { message?: string } | undefined;
      setBiometricError(err?.message || "Failed to set up biometric authentication");
    } finally {
      setBiometricLoading(false);
    }
  };

  if (!isBiometricsSupported) {
    return (
      <div className="p-3 text-sm bg-amber-50 border border-amber-200 rounded flex items-center gap-2 text-amber-700">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>
          Biometric authentication is not supported on this device or browser.
        </span>
      </div>
    );
  }

  return (
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
                  {localBiometricsRegistered ? "Disable Biometrics" : "Enable Biometrics"}
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
              
              {biometricError.includes("origin of the document") && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <strong>Note:</strong> This error often occurs when the app is running in an iframe or a shared environment.
                  Try opening the app in a new tab or window for biometric features.
                </p>
              )}

              {biometricError.includes("Not logged in") && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <strong>Note:</strong> You need to be logged in to use biometric authentication.
                  Please log in and try again.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
