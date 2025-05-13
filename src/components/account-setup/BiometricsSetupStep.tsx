
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Fingerprint, AlertTriangle, AlertCircle, Check, Lock } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { Switch } from "@/components/ui/switch";

const BiometricsSetupStep = () => {
  const { 
    user,
    isBiometricsSupported, 
    isBiometricsRegistered,
    registerBiometrics,
    removeBiometrics
  } = useAuth();
  
  const [enableBiometrics, setEnableBiometrics] = useState(isBiometricsRegistered);
  const [isBiometricLoading, setBiometricLoading] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const [setupCompleted, setSetupCompleted] = useState(false);

  // Update local state if context value changes
  useEffect(() => {
    setEnableBiometrics(isBiometricsRegistered);
  }, [isBiometricsRegistered]);

  const handleBiometricsToggle = async (enabled: boolean) => {
    // Clear any previous errors
    setBiometricError(null);
    setBiometricLoading(true);
    
    try {
      let success = false;
      
      if (enabled) {
        const result = await registerBiometrics();
        
        // Handle different return types from registerBiometrics
        if (result) {
          if (typeof result === 'object' && result !== null) {
            success = result.success;
            if (!success && result.error) {
              setBiometricError(result.error);
            }
          } else {
            success = !!result;
          }
        }
        
        if (success) {
          setEnableBiometrics(true);
          setSetupCompleted(true);
          setBiometricError(null);
        }
      } else {
        success = await removeBiometrics();
        if (success) {
          setEnableBiometrics(false);
          setBiometricError(null);
        } else {
          setBiometricError("Failed to remove biometric authentication");
        }
      }
    } catch (error: any) {
      console.error("Error toggling biometrics:", error);
      setBiometricError(error.message || "Failed to set up biometric authentication");
    } finally {
      setBiometricLoading(false);
    }
  };

  if (!isBiometricsSupported) {
    return (
      <div>
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Available</AlertTitle>
          <AlertDescription>
            Biometric authentication is not supported on this device or browser.
            You can still use your password to log in.
          </AlertDescription>
        </Alert>
        
        <p className="text-sm text-muted-foreground mt-4">
          Biometric authentication requires:
        </p>
        <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 ml-2 space-y-1">
          <li>A device with biometric hardware (fingerprint reader, face recognition)</li>
          <li>A browser that supports WebAuthn (most modern browsers)</li>
          <li>A secure connection (HTTPS or localhost)</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-0.5">
          <div className="font-medium">Use biometrics for faster login</div>
          <div className="text-sm text-muted-foreground">
            Sign in using your fingerprint, face recognition, or security key
          </div>
        </div>
        
        {isBiometricLoading ? (
          <Button disabled className="min-w-[140px]">
            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            Processing...
          </Button>
        ) : setupCompleted ? (
          <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 flex gap-2">
            <Check className="h-4 w-4" />
            Setup Complete
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Switch
              id="biometrics"
              checked={enableBiometrics}
              onCheckedChange={handleBiometricsToggle}
              disabled={isBiometricLoading}
            />
            <label htmlFor="biometrics" className="text-sm font-medium">
              {enableBiometrics ? "Enabled" : "Disabled"}
            </label>
          </div>
        )}
      </div>
      
      {biometricError && (
        <Alert variant="destructive" className="text-sm bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{biometricError}</AlertDescription>
        </Alert>
      )}
      
      <div className="bg-blue-50 rounded-lg border-blue-100 border p-4">
        <div className="flex items-start gap-3">
          <Fingerprint className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Why use biometric authentication?</h4>
            <ul className="mt-2 space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <div className="bg-blue-200 rounded-full p-0.5 mt-0.5">
                  <Lock className="h-3 w-3 text-blue-700" />
                </div>
                <span>Enhanced security with unique biometric identifiers</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-blue-200 rounded-full p-0.5 mt-0.5">
                  <Lock className="h-3 w-3 text-blue-700" />
                </div>
                <span>Faster login without typing passwords</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="bg-blue-200 rounded-full p-0.5 mt-0.5">
                  <Lock className="h-3 w-3 text-blue-700" />
                </div>
                <span>Your biometric data never leaves your device</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Note: You can always enable or disable this feature later in Security Settings.
      </p>
    </div>
  );
};

export default BiometricsSetupStep;
