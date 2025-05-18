
import { useState } from "react";
import Header from "@/components/Header";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { DocumentList } from "@/components/documents/DocumentList";
import { AskPanel } from "@/components/documents/AskPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Documents = () => {
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [selectedDocumentName, setSelectedDocumentName] = useState("");

  const handleDocumentSelect = (docId: string, docName: string) => {
    setSelectedDocumentId(docId);
    setSelectedDocumentName(docName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-finsight-purple mb-6">Documents & AI</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Tabs defaultValue="upload">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="documents">My Documents</TabsTrigger>
              </TabsList>
              <TabsContent value="upload">
                <DocumentUploader />
              </TabsContent>
              <TabsContent value="documents">
                <DocumentList 
                  onSelect={handleDocumentSelect} 
                  selectedDocumentId={selectedDocumentId}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <AskPanel 
              documentId={selectedDocumentId} 
              documentName={selectedDocumentName}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Documents;
