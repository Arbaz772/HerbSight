import React from "react";
import { Leaf, Pill } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RemedySuggestions({ uses }) {
  if (!uses) return null;

  const hasEdible = uses.edible && Array.isArray(uses.edible) && uses.edible.length > 0;
  const hasMedicinal = uses.medicinal && Array.isArray(uses.medicinal) && uses.medicinal.length > 0;

  if (!hasEdible && !hasMedicinal) return null;

  return (
    <div className="space-y-6">
      {hasEdible && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Leaf className="w-5 h-5" />
              <span>Edible Uses</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {uses.edible.map((use, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                  <span className="text-green-600 mt-1">•</span>
                  <span className="flex-1">{use}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {hasMedicinal && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Pill className="w-5 h-5" />
              <span>Medicinal Properties</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {uses.medicinal.map((use, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="flex-1">{use}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-blue-700 mt-4 italic">
              Always consult healthcare professionals before medicinal use
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}