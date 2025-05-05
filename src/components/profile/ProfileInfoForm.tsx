
import React from "react";
import { Button } from "@/components/ui/button";
import { User, Mail } from "lucide-react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileInfoFormProps {
  profileName: string;
  setProfileName: (name: string) => void;
  profileEmail: string;
  setProfileEmail: (email: string) => void;
  handleSave: () => void;
  handleCancel: () => void;
}

const ProfileInfoForm: React.FC<ProfileInfoFormProps> = ({
  profileName,
  setProfileName,
  profileEmail,
  setProfileEmail,
  handleSave,
  handleCancel
}) => {
  return (
    <>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Update your personal information and how we can reach you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NameInput 
            value={profileName}
            onChange={setProfileName}
          />
          <EmailInput 
            value={profileEmail}
            onChange={setProfileEmail}
          />
        </div>
        <div className="flex justify-end">
          <Button variant="outline" className="mr-2" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </CardContent>
    </>
  );
};

interface InputProps {
  value: string;
  onChange: (value: string) => void;
}

const NameInput: React.FC<InputProps> = ({ value, onChange }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium">Full Name</label>
    <div className="flex">
      <div className="flex h-10 items-center px-3 bg-gray-100 border border-r-0 border-input rounded-l-md">
        <User className="h-4 w-4 text-gray-500" />
      </div>
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  </div>
);

const EmailInput: React.FC<InputProps> = ({ value, onChange }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium">Email Address</label>
    <div className="flex">
      <div className="flex h-10 items-center px-3 bg-gray-100 border border-r-0 border-input rounded-l-md">
        <Mail className="h-4 w-4 text-gray-500" />
      </div>
      <input 
        type="email" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  </div>
);

export default ProfileInfoForm;
