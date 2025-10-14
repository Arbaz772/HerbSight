import React from "react";
import { AlertTriangle, ShieldAlert, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SafetyWarnings({ warnings }) {
  if (!warnings || !Array.isArray(warnings) || warnings.length === 0) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "danger":
        return "border-red-500 bg-red-50";
      case "caution":
        return "border-amber-500 bg-amber-50";
      default:
        return "border-blue-500 bg-blue-50";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "danger":
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case "caution":
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
        <ShieldAlert className="w-5 h-5 text-red-500" />
        <span>Safety Information</span>
      </h3>
      
      <div className="space-y-3">
        {warnings.map((warning, index) => (
          <Alert
            key={index}
            className={`border-2 ${getSeverityColor(warning.severity)}`}
          >
            <div className="flex items-start space-x-3">
              {getSeverityIcon(warning.severity)}
              <AlertDescription className="flex-1 text-sm leading-relaxed">
                {warning.message || warning.warning || "Safety information available"}
              </AlertDescription>
            </div>
          </Alert>
        ))}
      </div>
    </div>
  );
}