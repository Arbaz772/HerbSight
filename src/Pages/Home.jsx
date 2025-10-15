import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Sparkles, BookOpen, Leaf, Shield, Zap, Star, TrendingUp, Award, Users } from "lucide-react";
import { createPageUrl } from "@/utils";
import CameraCapture from "../components/camera/CameraCapture";
import { base44 } from "@/api/base44Client";

export default function Home() {
  const [showCamera, setShowCamera] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleCapture = async (file) => {
    setShowCamera(false);
    await processImage(file);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processImage(file);
  };

  const processImage = async (file) => {
    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert botanist and herbalist. Analyze this plant/herb/ingredient image and provide detailed information.

IMPORTANT: Return a valid JSON object with the exact structure specified. All arrays must be arrays, even if empty.

Provide:
1. Identification with common name, scientific name, confidence (0.0-1.0), and alternative names
2. Edible uses as an array of strings
3. Medicinal uses as an array of strings
4. 2-3 simple recipes with name, description, and instructions
5. Safety warnings as an array of objects with severity and message

If confidence is below 70%, emphasize the need for expert verification in the warnings.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            identification: {
              type: "object",
              properties: {
                common_name: { type: "string" },
                scientific_name: { type: "string" },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                alternative_names: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["common_name", "scientific_name", "confidence"]
            },
            uses: {
              type: "object",
              properties: {
                edible: {
                  type: "array",
                  items: { type: "string" }
                },
                medicinal: {
                  type: "array",
                  items: { type: "string" }
                },
                recipes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      description: { type: "string" },
                      instructions: { type: "string" }
                    },
                    required: ["name", "description"]
                  }
                }
              },
              required: ["edible", "medicinal", "recipes"]
            },
            warnings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  severity: {
                    type: "string",
                    enum: ["info", "caution", "danger"]
                  },
                  message: { type: "string" }
                },
                required: ["severity", "message"]
              }
            }
          },
          required: ["identification", "uses", "warnings"]
        }
      });

      // Sanitize and handle data ...
      // Saving to localStorage ...
      // Navigation to results page ...

    } catch (error) {
      console.error("Error processing image:", error);
      alert("Failed to process image. Please try again.");
    }
    setIsUploading(false);
  };

  if (showCamera) {
    return <CameraCapture onCapture={handleCapture} onClose={() => setShowCamera(false)} />;
  }

  return (
    <div className="min-h-screen">
      {/* Your full JSX layout of the home page here as you provided */}
    </div>
  );
}
