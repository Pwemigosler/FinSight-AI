
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadFile, getPublicUrl } from "@/utils/supabaseStorage";

const CharacterUploader: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const characters = ["fin", "luna", "oliver", "zoe"];
  const [uploadStatus, setUploadStatus] = useState<Record<string, {
    status: 'idle' | 'uploading' | 'success' | 'error',
    url?: string
  }>>({});

  const handleFileSelect = async (character: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadStatus(prev => ({
        ...prev,
        [character]: { status: 'uploading' }
      }));

      // Upload file to Supabase
      const path = `${character}.png`;
      const success = await uploadFile(path, file, file.type);
      
      if (success) {
        const url = getPublicUrl(path);
        setUploadStatus(prev => ({
          ...prev,
          [character]: { status: 'success', url }
        }));
        
        toast.success(`Uploaded ${character} avatar`, {
          description: "Character will be available after cache clears"
        });
      } else {
        setUploadStatus(prev => ({
          ...prev,
          [character]: { status: 'error' }
        }));
        
        toast.error(`Failed to upload ${character} avatar`);
      }
    } catch (error) {
      console.error(`Error uploading ${character} avatar:`, error);
      setUploadStatus(prev => ({
        ...prev,
        [character]: { status: 'error' }
      }));
      
      toast.error(`Error uploading ${character} avatar`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Character Avatars</CardTitle>
        <CardDescription>
          Upload character avatar images to Supabase Storage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {characters.map((character) => (
            <div key={character} className="flex items-center justify-between border p-3 rounded-md">
              <div>
                <p className="font-medium capitalize">{character}</p>
                <p className="text-xs text-gray-500">
                  {uploadStatus[character]?.status === 'success' 
                    ? 'Uploaded successfully' 
                    : uploadStatus[character]?.status === 'uploading'
                    ? 'Uploading...'
                    : uploadStatus[character]?.status === 'error'
                    ? 'Upload failed'
                    : 'Select a PNG image file'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {uploadStatus[character]?.status === 'success' && (
                  <div className="h-10 w-10 border rounded overflow-hidden">
                    <img 
                      src={uploadStatus[character]?.url || ''}
                      alt={`${character} preview`}
                      className="h-full w-full object-cover" 
                    />
                  </div>
                )}
                <input
                  type="file"
                  id={`file-${character}`}
                  className="hidden"
                  accept="image/png"
                  onChange={(e) => handleFileSelect(character, e)}
                  disabled={uploading}
                />
                <Button 
                  size="sm"
                  variant={
                    uploadStatus[character]?.status === 'success'
                      ? "outline"
                      : uploadStatus[character]?.status === 'error'
                      ? "destructive"
                      : "secondary"
                  }
                  onClick={() => document.getElementById(`file-${character}`)?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {uploadStatus[character]?.status === 'success' ? 'Replace' : 'Upload'}
                </Button>
              </div>
            </div>
          ))}
          
          <div className="mt-4 text-xs text-gray-500">
            <p>Note: After uploading, it may take a few minutes for the cache to update and show the new images.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterUploader;
