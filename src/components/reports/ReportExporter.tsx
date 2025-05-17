
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Download, FileDown, Loader } from "lucide-react";
import { toast } from "sonner";

// Mock function to generate CSV
const generateCSV = (data: any, options: any): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, this would generate actual CSV data
      const csvContent = "data:text/csv;charset=utf-8,Date,Category,Amount\n2023-05-10,Groceries,$120.50\n2023-05-15,Utilities,$85.20";
      resolve(csvContent);
    }, 1000);
  });
};

// Mock function to generate PDF
const generatePDF = (data: any, options: any): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real app, this would generate actual PDF data
      const pdfContent = "data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PCAvVH...";
      resolve(pdfContent);
    }, 1500);
  });
};

interface ReportExporterProps {
  data?: any;
}

const ReportExporter = ({ data }: ReportExporterProps) => {
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");
  const [dateRange, setDateRange] = useState<"current" | "last" | "custom">("current");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const options = { 
        dateRange, 
        includeCharts, 
        includeDetails 
      };
      
      if (exportFormat === "csv") {
        const csvContent = await generateCSV(data, options);
        // Create a download link and trigger it
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `finsight_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("CSV report exported successfully");
      } else {
        const pdfContent = await generatePDF(data, options);
        // Create a download link and trigger it (for demo purposes)
        const link = document.createElement("a");
        link.setAttribute("href", pdfContent);
        link.setAttribute("download", `finsight_report_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("PDF report exported successfully");
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileDown className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="format" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="format">Format & Date</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="format" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Export Format</h3>
                <RadioGroup value={exportFormat} onValueChange={(value) => setExportFormat(value as "csv" | "pdf")} className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv" className="cursor-pointer">CSV (Spreadsheet)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label htmlFor="pdf" className="cursor-pointer">PDF Document</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">Date Range</h3>
                <RadioGroup value={dateRange} onValueChange={(value) => setDateRange(value as "current" | "last" | "custom")} className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="current" id="current" />
                    <Label htmlFor="current" className="cursor-pointer">Current Month</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="last" id="last" />
                    <Label htmlFor="last" className="cursor-pointer">Last Month</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="cursor-pointer">Custom Range (Last 30 days)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="options" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-charts">Include Charts</Label>
                  <p className="text-sm text-muted-foreground">
                    Export visualizations and graphs
                  </p>
                </div>
                <Switch
                  id="include-charts"
                  checked={includeCharts}
                  onCheckedChange={setIncludeCharts}
                  disabled={exportFormat === "csv"}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-details">Include Transaction Details</Label>
                  <p className="text-sm text-muted-foreground">
                    Export individual transaction records
                  </p>
                </div>
                <Switch
                  id="include-details"
                  checked={includeDetails}
                  onCheckedChange={setIncludeDetails}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportExporter;
