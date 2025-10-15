import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Heart,
  Share2,
  Save,
  Edit3,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { createPageUrl } from "@/utils";
import ConfidenceIndicator from "../Components/src/camera/identification/ConfidenceIndicator.jsx";
import SafetyWarnings from "../Components/src/camera/identification/SafetyWarnings.jsx";
import RemedySuggestions from "../Components/src/camera/identification/RemedySuggestions.jsx";
import RecipeCards from "../Components/src/camera/identification/RecipeCards.jsx";

export default function ScanResult() {
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScan();
  }, []);

  const loadScan = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const scanId = urlParams.get("id");

    if (!scanId) {
      setError("No scan ID provided");
      setIsLoading(false);
      return;
    }

    try {
      // Load from localStorage
      const localScans = JSON.parse(localStorage.getItem('herbsight_scans') || '[]');
      const localScan = localScans.find(s => s.id === scanId);
      
      if (localScan) {
        setScan(localScan);
        setNotes(localScan.notes || "");
      } else {
        setError("Scan not found");
      }
    } catch (err) {
      console.error("Error loading scan:", err);
      setError("Failed to load scan");
    }
    setIsLoading(false);
  };

  const handleToggleFavorite = async () => {
    if (!scan) return;
    
    const updatedScan = { ...scan, is_favorite: !scan.is_favorite };
    setScan(updatedScan);

    // Update in localStorage
    const localScans = JSON.parse(localStorage.getItem('herbsight_scans') || '[]');
    const updatedScans = localScans.map(s => s.id === scan.id ? updatedScan : s);
    localStorage.setItem('herbsight_scans', JSON.stringify(updatedScans));
  };

  const handleSaveNotes = async () => {
    if (!scan) return;
    setIsSaving(true);

    const updatedScan = { ...scan, notes };
    setScan(updatedScan);
    setIsEditingNotes(false);

    // Update in localStorage
    const localScans = JSON.parse(localStorage.getItem('herbsight_scans') || '[]');
    const updatedScans = localScans.map(s => s.id === scan.id ? updatedScan : s);
    localStorage.setItem('herbsight_scans', JSON.stringify(updatedScans));

    setIsSaving(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: `HerbSight: ${scan?.identification?.common_name || "Plant"}`,
      text: `Check out this plant I identified: ${scan?.identification?.common_name || "Unknown"} (${scan?.identification?.scientific_name || "Unknown"})`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Scan not found"}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate(createPageUrl("Home"))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-8">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("SavedScans"))}
            className="hover:bg-green-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              disabled={isSaving}
              className={scan.is_favorite ? "text-red-500" : ""}
            >
              <Heart
                className="w-5 h-5"
                fill={scan.is_favorite ? "currentColor" : "none"}
              />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Image */}
        {scan.image_url && (
          <Card className="overflow-hidden leaf-shadow">
            <img
              src={scan.image_url}
              alt="Plant scan"
              className="w-full h-80 object-cover"
            />
          </Card>
        )}

        {/* Identification */}
        <Card className="glass-effect leaf-shadow">
          <CardContent className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {scan.identification?.common_name || "Unknown Plant"}
              </h1>
              <p className="text-lg italic text-gray-600">
                {scan.identification?.scientific_name || "Classification pending"}
              </p>
              {scan.identification?.alternative_names &&
                Array.isArray(scan.identification.alternative_names) &&
                scan.identification.alternative_names.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Also known as:{" "}
                    {scan.identification.alternative_names.join(", ")}
                  </p>
                )}
            </div>

            {scan.identification?.confidence && (
              <ConfidenceIndicator confidence={scan.identification.confidence} />
            )}
          </CardContent>
        </Card>

        {/* Safety Warnings */}
        {scan.warnings && Array.isArray(scan.warnings) && scan.warnings.length > 0 && (
          <Card className="leaf-shadow">
            <CardContent className="p-6">
              <SafetyWarnings warnings={scan.warnings} />
            </CardContent>
          </Card>
        )}

        {/* Uses and Remedies */}
        {scan.uses && (
          <Card className="leaf-shadow">
            <CardContent className="p-6">
              <RemedySuggestions uses={scan.uses} />
            </CardContent>
          </Card>
        )}

        {/* Recipes */}
        {scan.uses?.recipes && Array.isArray(scan.uses.recipes) && scan.uses.recipes.length > 0 && (
          <Card className="leaf-shadow">
            <CardContent className="p-6">
              <RecipeCards recipes={scan.uses.recipes} />
            </CardContent>
          </Card>
        )}

        {/* Personal Notes */}
        <Card className="leaf-shadow">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-gray-500" />
                <span>Personal Notes</span>
              </h3>
              {!isEditingNotes && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingNotes(true)}
                >
                  Edit
                </Button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-3">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your observations, experiences, or reminders..."
                  rows={4}
                  className="resize-none"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingNotes(false);
                      setNotes(scan.notes || "");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Notes"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {notes || "No notes yet. Click Edit to add your observations."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Learn More Link */}
        {scan.identification?.scientific_name && (
          <Card className="glass-effect leaf-shadow">
            <CardContent className="p-4">
              <a
                href={`https://en.wikipedia.org/wiki/${encodeURIComponent(
                  scan.identification.scientific_name
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-green-600 hover:text-green-700 transition-colors"
              >
                <span className="font-medium">Learn more on Wikipedia</span>
                <ExternalLink className="w-5 h-5" />
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}