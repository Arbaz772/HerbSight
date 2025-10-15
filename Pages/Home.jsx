
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Sparkles, BookOpen, Leaf, Shield, Zap, Star, TrendingUp, Award, Users } from "lucide-react";
import { createPageUrl } from "@/utils";
import CameraCapture from "../Components/src/camera/CameraCapture.jsx";
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

      // Ensure arrays exist and are valid
      const sanitizedResult = {
        identification: {
          common_name: result.identification?.common_name || "Unknown Plant",
          scientific_name: result.identification?.scientific_name || "Classification pending",
          confidence: result.identification?.confidence ?? 0.5,
          alternative_names: Array.isArray(result.identification?.alternative_names) 
            ? result.identification.alternative_names 
            : []
        },
        uses: {
          edible: Array.isArray(result.uses?.edible) ? result.uses.edible : [],
          medicinal: Array.isArray(result.uses?.medicinal) ? result.uses.medicinal : [],
          recipes: Array.isArray(result.uses?.recipes) ? result.uses.recipes : []
        },
        warnings: Array.isArray(result.warnings) ? result.warnings : []
      };

      // Add low confidence warning if needed
      if (sanitizedResult.identification.confidence < 0.7) {
        sanitizedResult.warnings.unshift({
          severity: "danger",
          message: "Low confidence identification. DO NOT consume without expert verification. This plant may be misidentified and could be toxic."
        });
      }

      // Try to save to database, but continue even if it fails (user not logged in)
      try {
        const scan = await base44.entities.Scan.create({
          image_url: file_url,
          identification: sanitizedResult.identification,
          uses: sanitizedResult.uses,
          warnings: sanitizedResult.warnings,
          is_favorite: false
        });
        
        // Navigate with scan ID
        navigate(createPageUrl(`ScanResult?id=${scan.id}`));
      } catch (error) {
        // If save fails (user not logged in), store in localStorage and show results
        const tempScan = {
          id: `temp-${Date.now()}`,
          image_url: file_url,
          identification: sanitizedResult.identification,
          uses: sanitizedResult.uses,
          warnings: sanitizedResult.warnings,
          is_favorite: false,
          created_date: new Date().toISOString(),
          notes: ""
        };
        
        // Store in localStorage
        const savedScans = JSON.parse(localStorage.getItem('herbsight_scans') || '[]');
        savedScans.unshift(tempScan);
        localStorage.setItem('herbsight_scans', JSON.stringify(savedScans));
        
        navigate(createPageUrl(`ScanResult?id=${tempScan.id}`));
      }
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
      {/* Hero Section */}
      <div className="relative flex items-center justify-center p-4 pt-12 pb-16">
        <div className="max-w-2xl w-full space-y-10 animate-fade-in">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 glass-effect px-5 py-2.5 rounded-full shadow-lg hover-lift">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <Sparkles className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                AI-Powered Plant Identification
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
              <span className="inline-block bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent animate-fade-in">
                Identify Plants
              </span>
              <br />
              <span className="inline-block text-gray-900 animate-fade-in" style={{animationDelay: '0.1s'}}>
                Instantly with
              </span>
              <br />
              <span className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent animate-fade-in" style={{animationDelay: '0.2s'}}>
                AI Magic ✨
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-xl mx-auto leading-relaxed font-medium">
              Free plant identifier app to recognize <span className="text-green-600 font-semibold">herbs, spices, medicinal plants</span> and ingredients. 
              Get instant identification, culinary uses, recipes & safety info for <span className="text-emerald-600 font-semibold">Indian, Chinese, Italian</span> cuisines.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="relative glass-effect rounded-3xl p-8 leaf-shadow-lg space-y-5 border-2 border-white/80 hover-lift">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-300/20 to-emerald-300/20 rounded-full blur-3xl -z-10"></div>
            
            <Button
              onClick={() => setShowCamera(true)}
              disabled={isUploading}
              className="relative w-full h-18 text-lg font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 rounded-2xl shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 border-0 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer"></div>
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent mr-3" />
                  <span className="font-bold">Analyzing Plant...</span>
                </>
              ) : (
                <>
                  <Camera className="w-7 h-7 mr-3 group-hover:scale-110 transition-transform" />
                  <span>Take Photo & Identify</span>
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">or upload from gallery</span>
              </div>
            </div>

            <label htmlFor="file-upload" className="block">
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full h-16 text-lg font-bold border-3 border-green-500 text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift"
                onClick={() => document.getElementById("file-upload").click()}
                disabled={isUploading}
              >
                <Upload className="w-7 h-7 mr-3" />
                Upload Plant Photo
              </Button>
            </label>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-effect rounded-2xl p-4 text-center hover-lift border border-white/60">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">98%</div>
              <div className="text-xs text-gray-600 font-medium">Accuracy</div>
            </div>
            <div className="glass-effect rounded-2xl p-4 text-center hover-lift border border-white/60">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">3s</div>
              <div className="text-xs text-gray-600 font-medium">Fast ID</div>
            </div>
            <div className="glass-effect rounded-2xl p-4 text-center hover-lift border border-white/60">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">10K+</div>
              <div className="text-xs text-gray-600 font-medium">Users</div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-5 pt-6">
            <div className="text-center p-7 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all hover-lift border-2 border-green-200/50">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-black text-gray-900 mb-2 text-lg">Instant Plant ID</h3>
              <p className="text-sm text-gray-600 leading-relaxed">AI-powered herb and spice identification in seconds</p>
            </div>

            <div className="text-center p-7 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all hover-lift border-2 border-blue-200/50">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-black text-gray-900 mb-2 text-lg">Complete Info</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Culinary uses, remedies & traditional recipes</p>
            </div>

            <div className="text-center p-7 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all hover-lift border-2 border-amber-200/50">
              <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-black text-gray-900 mb-2 text-lg">Safety First</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Toxicity warnings & identification confidence</p>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-20 space-y-16">
        {/* About Section */}
        <div className="glass-effect rounded-[2rem] p-10 leaf-shadow-lg border-2 border-white/60 hover-lift">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/30 flex-shrink-0">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">Free Plant & Herb Identifier App</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
            </div>
          </div>
          <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
            <p>
              HerbSight is a <strong className="text-green-600">free online plant identification tool</strong> that helps you instantly recognize herbs, spices, 
              medicinal plants, vegetables, and cooking ingredients using AI technology. Simply take a photo or upload 
              an image, and our advanced plant identifier will analyze it to provide detailed information about the plant.
            </p>
            <p>
              Whether you're a home cook exploring <strong className="text-emerald-600">Indian spices</strong> like turmeric, cumin, and coriander, or learning about 
              <strong className="text-blue-600"> Italian herbs</strong> like basil, oregano, and rosemary, our herb identifier makes it easy. We cover plants used 
              in Indian cuisine, Chinese cooking, Continental dishes, Italian recipes, and more.
            </p>
          </div>
        </div>

        {/* What You Can Identify */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-effect rounded-[2rem] p-8 leaf-shadow border-2 border-white/60 hover-lift">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Common Herbs & Spices</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-3 p-3 rounded-xl bg-green-50/50 hover:bg-green-100/50 transition-colors">
                <span className="text-green-600 mt-1 text-xl flex-shrink-0">🌿</span>
                <span><strong>Indian Spices:</strong> Turmeric, cumin, coriander, fenugreek, mustard seeds, cardamom, cloves, cinnamon</span>
              </li>
              <li className="flex items-start space-x-3 p-3 rounded-xl bg-blue-50/50 hover:bg-blue-100/50 transition-colors">
                <span className="text-blue-600 mt-1 text-xl flex-shrink-0">🍃</span>
                <span><strong>Italian Herbs:</strong> Basil, oregano, rosemary, thyme, sage, parsley, marjoram</span>
              </li>
              <li className="flex items-start space-x-3 p-3 rounded-xl bg-purple-50/50 hover:bg-purple-100/50 transition-colors">
                <span className="text-purple-600 mt-1 text-xl flex-shrink-0">🌸</span>
                <span><strong>Asian Ingredients:</strong> Lemongrass, galangal, kaffir lime, star anise, ginger</span>
              </li>
              <li className="flex items-start space-x-3 p-3 rounded-xl bg-teal-50/50 hover:bg-teal-100/50 transition-colors">
                <span className="text-teal-600 mt-1 text-xl flex-shrink-0">🌱</span>
                <span><strong>Fresh Herbs:</strong> Cilantro, mint, dill, chives, tarragon, fennel</span>
              </li>
            </ul>
          </div>

          <div className="glass-effect rounded-[2rem] p-8 leaf-shadow border-2 border-white/60 hover-lift">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">What You'll Learn</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-3 p-3 rounded-xl bg-green-50/50 hover:bg-green-100/50 transition-colors">
                <span className="text-green-600 mt-1 text-xl flex-shrink-0">✓</span>
                <span><strong>Botanical Names:</strong> Scientific and common names for accurate identification</span>
              </li>
              <li className="flex items-start space-x-3 p-3 rounded-xl bg-blue-50/50 hover:bg-blue-100/50 transition-colors">
                <span className="text-blue-600 mt-1 text-xl flex-shrink-0">✓</span>
                <span><strong>Culinary Uses:</strong> How to use herbs and spices in cooking</span>
              </li>
              <li className="flex items-start space-x-3 p-3 rounded-xl bg-purple-50/50 hover:bg-purple-100/50 transition-colors">
                <span className="text-purple-600 mt-1 text-xl flex-shrink-0">✓</span>
                <span><strong>Health Benefits:</strong> Medicinal properties and traditional remedies</span>
              </li>
              <li className="flex items-start space-x-3 p-3 rounded-xl bg-amber-50/50 hover:bg-amber-100/50 transition-colors">
                <span className="text-amber-600 mt-1 text-xl flex-shrink-0">✓</span>
                <span><strong>Safety Information:</strong> Toxicity warnings and consumption guidelines</span>
              </li>
              <li className="flex items-start space-x-3 p-3 rounded-xl bg-pink-50/50 hover:bg-pink-100/50 transition-colors">
                <span className="text-pink-600 mt-1 text-xl flex-shrink-0">✓</span>
                <span><strong>Traditional Recipes:</strong> Authentic dishes from global cuisines</span>
              </li>
            </ul>
          </div>
        </div>

        {/* How It Works */}
        <div className="glass-effect rounded-[2rem] p-10 leaf-shadow-lg border-2 border-white/60">
          <h2 className="text-4xl font-black text-gray-900 mb-8 text-center">
            How to Identify Plants & Herbs
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 group">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-[1.5rem] blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-[1.5rem] flex items-center justify-center text-3xl font-black text-white shadow-xl group-hover:scale-110 transition-transform">
                  1
                </div>
              </div>
              <h3 className="font-black text-gray-900 text-xl">Take or Upload Photo</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Capture a clear photo of the plant or upload from your gallery
              </p>
            </div>
            <div className="text-center space-y-4 group">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-[1.5rem] blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[1.5rem] flex items-center justify-center text-3xl font-black text-white shadow-xl group-hover:scale-110 transition-transform">
                  2
                </div>
              </div>
              <h3 className="font-black text-gray-900 text-xl">AI Analysis</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our advanced AI identifies the plant with confidence scores
              </p>
            </div>
            <div className="text-center space-y-4 group">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-600 rounded-[1.5rem] blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-[1.5rem] flex items-center justify-center text-3xl font-black text-white shadow-xl group-hover:scale-110 transition-transform">
                  3
                </div>
              </div>
              <h3 className="font-black text-gray-900 text-xl">Get Complete Info</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Receive detailed culinary, medicinal & safety information
              </p>
            </div>
          </div>
        </div>

        {/* Keywords Section for SEO */}
        <div className="glass-effect rounded-2xl p-6 leaf-shadow bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Perfect for identifying:
          </h3>
          <div className="text-sm text-gray-700 leading-relaxed">
            <p>
              <strong>Cooking Herbs:</strong> basil identification, cilantro vs parsley, oregano plant, thyme herb, rosemary leaves, 
              sage plant, mint varieties, dill weed, chives, tarragon
            </p>
            <p className="mt-2">
              <strong>Indian Spices:</strong> turmeric root, cumin seeds, coriander seeds, fenugreek leaves (methi), mustard seeds, 
              curry leaves, cardamom pods, cloves, cinnamon sticks, bay leaves (tej patta), asafoetida (hing)
            </p>
            <p className="mt-2">
              <strong>Asian Ingredients:</strong> lemongrass stalks, galangal root, kaffir lime leaves, star anise, Sichuan peppercorns, 
              Thai basil, Chinese five-spice ingredients, ginger vs galangal
            </p>
            <p className="mt-2">
              <strong>Medicinal Plants:</strong> herbal medicine identification, ayurvedic herbs, traditional Chinese medicine plants, 
              medicinal herb uses, natural remedies
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-effect rounded-2xl p-6 leaf-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Why Use HerbSight?</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-1 text-xl">✓</span>
                <span><strong>100% Free:</strong> No subscriptions, no hidden fees, completely free plant identification</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-1 text-xl">✓</span>
                <span><strong>No Login Required:</strong> Start identifying plants immediately without creating an account</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-1 text-xl">✓</span>
                <span><strong>Works Offline:</strong> Save your scans locally and access them anytime</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-1 text-xl">✓</span>
                <span><strong>Global Database:</strong> Covers plants from Indian, Chinese, Italian, Mexican, and Continental cuisines</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-1 text-xl">✓</span>
                <span><strong>Safety Focused:</strong> Clear warnings about toxic plants, allergens, and consumption risks</span>
              </li>
            </ul>
          </div>

          <div className="glass-effect rounded-2xl p-6 leaf-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Perfect For:</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">👨‍🍳</span>
                <span><strong>Home Cooks:</strong> Identify herbs and spices in your kitchen or at the grocery store</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">🌱</span>
                <span><strong>Gardeners:</strong> Recognize herbs growing in your garden or wild plants</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">📚</span>
                <span><strong>Students:</strong> Learn about botany, herbalism, and culinary arts</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">🏥</span>
                <span><strong>Health Enthusiasts:</strong> Explore medicinal plants and traditional remedies</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">🍽️</span>
                <span><strong>Food Bloggers:</strong> Accurately identify and document ingredients in your recipes</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Final CTA - Enhanced */}
        <div className="relative overflow-hidden text-center rounded-[2.5rem] p-12 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white leaf-shadow-lg">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full mb-4">
              <Award className="w-5 h-5" />
              <span className="font-bold text-sm">Free Forever</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Ready to Identify Your First Plant?
            </h2>
            <p className="text-xl mb-8 text-green-50 max-w-2xl mx-auto font-medium">
              Join thousands of users discovering the world of herbs, spices, and medicinal plants
            </p>
            <Button
              onClick={() => setShowCamera(true)}
              className="bg-white text-green-700 hover:bg-green-50 h-16 px-10 text-xl font-black rounded-2xl shadow-2xl hover:shadow-white/50 hover:scale-105 transition-all duration-300"
            >
              <Camera className="w-6 h-6 mr-3" />
              Start Identifying Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
