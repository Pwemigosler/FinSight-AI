
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/types/user";
import { toast } from "sonner";

interface PersonalInfoCardProps {
  user: User | null;
  isSubmitting: boolean;
  onSave: (formData: { name: string; email: string }) => void;
}

export const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ 
  user, 
  isSubmitting,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveChanges = () => {
    if (!formData.name.trim()) {
      toast("Name cannot be empty");
      return;
    }
    
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your account details and personal information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <div className="flex mt-1.5">
              <Input 
                id="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="flex mt-1.5">
              <Input 
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveChanges}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
