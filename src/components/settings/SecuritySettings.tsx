
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordSection } from "./security/PasswordSection";
import { BiometricSection } from "./security/BiometricSection";
import { TwoFactorSection } from "./security/TwoFactorSection";
import { SessionSection } from "./security/SessionSection";

export const SecuritySettings = () => {
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
          <PasswordSection />
          <BiometricSection />
          <TwoFactorSection />
          <SessionSection />
        </div>
      </CardContent>
    </Card>
  );
};
