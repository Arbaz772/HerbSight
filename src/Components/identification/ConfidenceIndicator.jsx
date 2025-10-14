import React from "react";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

export default function ConfidenceIndicator({ confidence }) {
  const percentage = Math.round(confidence * 100);
  
  let color, icon, label;
  if (confidence >= 0.8) {
    color = "text-green-600";
    icon = <CheckCircle className="w-5 h-5" />;
    label = "High Confidence";
  } else if (confidence >= 0.6) {
    color = "text-amber-600";
    icon = <AlertCircle className="w-5 h-5" />;
    label = "Moderate Confidence";
  } else {
    color = "text-red-600";
    icon = <XCircle className="w-5 h-5" />;
    label = "Low Confidence";
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className={`flex items-center space-x-2 ${color}`}>
          {icon}
          <span className="font-semibold">{label}</span>
        </div>
        <span className={`text-2xl font-bold ${color}`}>{percentage}%</span>
      </div>
      
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${
            confidence >= 0.8 ? "bg-green-500" : confidence >= 0.6 ? "bg-amber-500" : "bg-red-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {confidence < 0.7 && (
        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
          ⚠️ Low confidence - verify identification before use
        </p>
      )}
    </div>
  );
}