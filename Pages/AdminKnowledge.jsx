
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Import Alert components
import { ArrowLeft, Save, Upload, Plus, X, AlertCircle } from "lucide-react"; // Import AlertCircle
import { createPageUrl } from "@/utils";

export default function AdminKnowledge() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false); // New state for access control
  const [formData, setFormData] = useState({
    common_name: "",
    scientific_name: "",
    alternative_names: [],
    description: "",
    image_url: "",
    category: "herb",
    edible_uses: [],
    medicinal_properties: [],
    recipes: [],
    safety_warnings: [],
    toxic_lookalikes: [],
    nutritional_info: "",
    growing_info: "",
    is_verified: false,
  });

  useEffect(() => {
    checkAccess(); // Call checkAccess on component mount
  }, []);

  const checkAccess = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me().catch(() => null); // Handle cases where user might not be logged in

      if (!user || user.role !== "admin") {
        setAccessDenied(true);
        setIsLoading(false); // Stop loading if access is denied
        return;
      }

      // If access is granted, proceed with checking for edit ID
      const urlParams = new URLSearchParams(window.location.search);
      const editPlantId = urlParams.get("edit");

      if (editPlantId) {
        setEditId(editPlantId);
        await loadPlant(editPlantId); // Await loadPlant to ensure isLoading is managed correctly
      } else {
        setIsLoading(false); // Stop loading if no editId and access is granted
      }
    } catch (error) {
      console.error("Error checking access:", error);
      setAccessDenied(true);
      setIsLoading(false); // Stop loading on error
    }
  };

  const loadPlant = async (id) => {
    // setIsLoading(true); // Moved to checkAccess
    try {
      const plants = await base44.entities.PlantKnowledge.filter({ id });
      if (plants.length > 0) {
        setFormData(plants[0]);
      }
    } catch (error) {
      console.error("Error loading plant:", error);
      // Optionally handle specific error for loading, but general access denied might cover it
    } finally {
      setIsLoading(false); // Ensure loading is stopped
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editId) {
        await base44.entities.PlantKnowledge.update(editId, formData);
      } else {
        await base44.entities.PlantKnowledge.create(formData);
      }
      navigate(createPageUrl("PlantDatabase"));
    } catch (error) {
      console.error("Error saving plant:", error);
      alert("Failed to save plant");
    }
    setIsSaving(false);
  };

  const addArrayItem = (field, defaultValue) => {
    setFormData({
      ...formData,
      [field]: [...(formData[field] || []), defaultValue],
    });
  };

  const removeArrayItem = (field, index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const updateArrayItem = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access Denied. This page is only available to administrators.
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => navigate(createPageUrl("Home"))}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("PlantDatabase"))}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {editId ? "Edit" : "Add"} Plant Entry
          </h1>
          <div className="w-20" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="leaf-shadow">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="common_name">Common Name *</Label>
                  <Input
                    id="common_name"
                    value={formData.common_name}
                    onChange={(e) =>
                      setFormData({ ...formData, common_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scientific_name">Scientific Name *</Label>
                  <Input
                    id="scientific_name"
                    value={formData.scientific_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scientific_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="herb">Herb</SelectItem>
                    <SelectItem value="spice">Spice</SelectItem>
                    <SelectItem value="vegetable">Vegetable</SelectItem>
                    <SelectItem value="fruit">Fruit</SelectItem>
                    <SelectItem value="medicinal_plant">
                      Medicinal Plant
                    </SelectItem>
                    <SelectItem value="flower">Flower</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1"
                  />
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_verified"
                  checked={formData.is_verified}
                  onChange={(e) =>
                    setFormData({ ...formData, is_verified: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="is_verified">Mark as Verified</Label>
              </div>
            </CardContent>
          </Card>

          {/* Additional Fields */}
          <Card className="leaf-shadow">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nutritional Info</Label>
                <Textarea
                  value={formData.nutritional_info}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nutritional_info: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Growing Information</Label>
                <Textarea
                  value={formData.growing_info}
                  onChange={(e) =>
                    setFormData({ ...formData, growing_info: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("PlantDatabase"))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Plant"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
