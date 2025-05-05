
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import CharacterSelector from "../avatars/CharacterSelector";
import CharacterUploader from "./CharacterUploader";
import { useAuth } from "@/contexts/auth";
import { useAvatar } from "@/contexts/AvatarContext";

export const AvatarSettings = () => {
  const [activeTab, setActiveTab] = useState("select");
  const { user } = useAuth();
  const { speechEnabled, toggleSpeech } = useAvatar();
  
  // Determine if user is an admin
  const isAdmin = user?.role === "admin";

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Voice Settings</CardTitle>
          <CardDescription>
            Configure how your AI assistant communicates with you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              checked={speechEnabled}
              onCheckedChange={toggleSpeech}
              id="voice-enabled"
            />
            <Label htmlFor="voice-enabled">Enable AI voice responses</Label>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="select" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="select">Select Character</TabsTrigger>
          {isAdmin && <TabsTrigger value="upload">Manage Characters</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="select">
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
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="upload">
            <CharacterUploader />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AvatarSettings;
