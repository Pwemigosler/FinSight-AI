
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CharacterSelector from "../avatars/CharacterSelector";

export const AvatarSettings = () => {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Assistant Character</CardTitle>
          <CardDescription>
            Choose your preferred AI assistant character and appearance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CharacterSelector />
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarSettings;
