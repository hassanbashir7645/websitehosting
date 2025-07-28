import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DemoBanner() {
  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50 text-blue-800">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>Demo Mode:</strong> This is a demonstration of the PsychoTest Pro Psychometric Testing Platform. 
        All data shown is sample data for showcase purposes. 
        Contact support to set up your organization's testing environment.
      </AlertDescription>
    </Alert>
  );
}