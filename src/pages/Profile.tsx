
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PencilLine, Mail, User, Crop, Move } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(user?.avatar || null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(user?.avatarSettings?.zoom || 100);
  const [imagePosition, setImagePosition] = useState({ 
    x: user?.avatarSettings?.position?.x || 0, 
    y: user?.avatarSettings?.position?.y || 0 
  });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [avatarKey, setAvatarKey] = useState(Date.now());

  // Update local state when user changes
  useEffect(() => {
    if (user) {
      console.log("[Profile] User updated:", 
        "Name:", user.name,
        "Avatar exists:", !!user.avatar,
        "Avatar length:", user.avatar?.length || 0,
        "Avatar settings:", user.avatarSettings ? 
          `zoom:${user.avatarSettings.zoom}, pos:(${user.avatarSettings.position.x},${user.avatarSettings.position.y})` : 
          "none"
      );
      
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
      
      // Always update preview image when user avatar changes
      if (user.avatar) {
        setPreviewImage(user.avatar);
        console.log("[Profile] Setting preview image from user avatar, length:", user.avatar.length);
      } else {
        console.log("[Profile] No avatar found in user data");
        setPreviewImage(null);
      }
      
      // Initialize zoom and position from user settings if available
      if (user.avatarSettings) {
        setZoomLevel(user.avatarSettings.zoom);
        setImagePosition(user.avatarSettings.position);
        console.log("[Profile] Setting zoom and position from user settings");
      }
      
      // Force re-render of avatar
      setAvatarKey(Date.now());
    }
  }, [user]);
  
  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSave = () => {
    if (!profileName.trim()) {
      toast("Name cannot be empty");
      return;
    }
    
    updateUserProfile({
      name: profileName,
      email: profileEmail,
    });
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileName(user?.name || "");
    setProfileEmail(user?.email || "");
    setIsEditing(false);
  };

  const handleProfilePictureClick = () => {
    // Make sure we're using any existing avatar when opening the dialog
    if (user?.avatar && !previewImage) {
      console.log("[Profile] Setting preview image from user avatar before dialog");
      setPreviewImage(user.avatar);
    }
    setIsDialogOpen(true);
    
    // Reset zoom level and position when opening the dialog if no existing settings
    if (!user?.avatarSettings) {
      setZoomLevel(100);
      setImagePosition({ x: 0, y: 0 });
    } else {
      // Use existing settings
      setZoomLevel(user.avatarSettings.zoom);
      setImagePosition(user.avatarSettings.position);
    }
  };

  const handleFileSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only trigger file selection if there's no image already
    if (!previewImage) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast("Image size should be less than 5MB");
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      console.log("[Profile] New image loaded, length:", imageData.length);
      setPreviewImage(imageData);
      // Reset zoom level when loading a new image
      setZoomLevel(100);
      setImagePosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleZoomChange = (value: number[]) => {
    setZoomLevel(value[0]);
  };

  // Image dragging handlers
  const handleImageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering file selector
    setIsDraggingImage(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingImage) return;
    e.preventDefault();
    e.stopPropagation();
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setDragStart({ x: e.clientX, y: e.clientY });
    setImagePosition(prev => ({ 
      x: prev.x + dx, 
      y: prev.y + dy 
    }));
  };

  const handleImageMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
  };

  const handleUpload = () => {
    if (!previewImage) return;
    
    console.log("[Profile] Uploading profile picture with settings:",
      "Zoom:", zoomLevel,
      "Position:", JSON.stringify(imagePosition)
    );
    
    // Save the image with transformation settings
    updateUserProfile({
      avatar: previewImage,
      avatarSettings: {
        zoom: zoomLevel,
        position: imagePosition
      }
    }).then(() => {
      console.log("[Profile] Profile picture updated successfully");
      setIsDialogOpen(false);
      toast("Profile picture updated successfully");
      
      // Force a re-render of the avatar after update
      setAvatarKey(Date.now());
    }).catch(error => {
      console.error("[Profile] Error updating profile picture:", error);
      toast("Failed to update profile picture");
    });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  // Handle clicking the empty image container or "change image" text
  const handleImageContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!previewImage) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-finsight-purple mb-6">Profile</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4" key={`profile-avatar-${avatarKey}`}>
                  {user?.avatar ? (
                    <AvatarImage 
                      src={user.avatar} 
                      alt={user.name || "Profile"} 
                      style={{ 
                        transform: user.avatarSettings ? `scale(${user.avatarSettings.zoom / 100})` : undefined,
                        marginLeft: user.avatarSettings ? `${user.avatarSettings.position.x * 0.25}px` : undefined,
                        marginTop: user.avatarSettings ? `${user.avatarSettings.position.y * 0.25}px` : undefined,
                      }}
                      onError={() => {
                        console.error("[Profile] Failed to load avatar image in profile display");
                      }}
                      data-avatar-length={user.avatar.length || 0}
                    />
                  ) : null}
                  <AvatarFallback className="bg-finsight-purple text-white text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <p className="text-gray-500 mb-4">{user?.email}</p>
                <Button 
                  className="w-full flex items-center gap-2"
                  onClick={handleProfilePictureClick}
                >
                  <PencilLine className="h-4 w-4" />
                  Edit Profile Picture
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal information and how we can reach you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <div className="flex">
                      <div className="flex h-10 items-center px-3 bg-gray-100 border border-r-0 border-input rounded-l-md">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <input 
                        type="text" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="flex h-10 w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <div className="flex">
                      <div className="flex h-10 items-center px-3 bg-gray-100 border border-r-0 border-input rounded-l-md">
                        <Mail className="h-4 w-4 text-gray-500" />
                      </div>
                      <input 
                        type="email" 
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="flex h-10 w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" className="mr-2" onClick={handleCancel}>Cancel</Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Profile Picture Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a headshot image for your profile. A square image centered on your face works best.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            
            <div
              className={`border-2 border-dashed rounded-md p-6 text-center ${isDragging ? 'border-finsight-purple bg-finsight-purple bg-opacity-5' : 'border-gray-300'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleFileSelect}
            >
              {previewImage ? (
                <div className="space-y-4">
                  <div 
                    className="w-48 h-48 mx-auto rounded-full overflow-hidden cursor-move relative"
                    onMouseDown={handleImageMouseDown}
                    onMouseMove={handleImageMouseMove}
                    onMouseUp={handleImageMouseUp}
                    onMouseLeave={handleImageMouseUp}
                    onClick={(e) => e.stopPropagation()} // Prevent triggering file select
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-70 bg-black bg-opacity-40 text-white transition-opacity">
                      <Move className="h-8 w-8" />
                    </div>
                    <img
                      ref={imageRef}
                      src={previewImage}
                      alt="Preview"
                      className="object-cover h-full w-full"
                      style={{ 
                        transform: `scale(${zoomLevel / 100})`,
                        transformOrigin: 'center',
                        marginLeft: `${imagePosition.x}px`,
                        marginTop: `${imagePosition.y}px`
                      }}
                    />
                  </div>
                  
                  {/* Image adjustment controls */}
                  <div className="space-y-2 pt-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        <Crop className="h-4 w-4 inline mr-1" />
                        Adjust Image
                      </span>
                      <span className="text-xs text-gray-400">{zoomLevel}%</span>
                    </div>
                    <Slider
                      value={[zoomLevel]}
                      min={100} 
                      max={200}
                      step={1}
                      onValueChange={handleZoomChange}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  <p className="text-xs text-center text-gray-500">
                    Drag the image to reposition
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center" onClick={handleImageContainerClick}>
                  <div className="w-48 h-48 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Click to select a headshot image or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG or GIF up to 5MB
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleUpload}
              disabled={!previewImage}
            >
              Upload Picture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
