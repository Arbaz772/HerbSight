
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Leaf,
  Pill,
  ChefHat,
  AlertTriangle,
  Sprout,
  Edit,
  AlertCircle,
} from "lucide-react";
import { createPageUrl } from "@/utils";

export default function PlantDetail() {
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    setAccessDenied(false); // Reset accessDenied state
    try {
      const userData = await base44.auth.me().catch(() => null);
      setUser(userData);

      // Check if user is admin
      if (!userData || userData.role !== "admin") {
        setAccessDenied(true);
        setIsLoading(false);
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const plantId = urlParams.get("id");

      if (!plantId) {
        setError("No plant ID provided");
        setIsLoading(false);
        return;
      }

      const plants = await base44.entities.PlantKnowledge.filter({ id: plantId });

      if (plants.length > 0) {
        setPlant(plants[0]);
      } else {
        setError("Plant not found");
      }
    } catch (error) {
      console.error("Error loading plant:", error);
      setError("Failed to load plant details");
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading plant details...</p>
        </div>
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

  if (error || !plant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Plant not found"}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate(createPageUrl("PlantDatabase"))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Database
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("PlantDatabase"))}
            className="hover:bg-green-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {user?.role === "admin" && (
            <Button
              onClick={() =>
                navigate(createPageUrl(`AdminKnowledge?edit=${plant.id}`))
              }
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>

        {/* Image */}
        {plant.image_url && (
          <Card className="overflow-hidden leaf-shadow">
            <img
              src={plant.image_url}
              alt={plant.common_name}
              className="w-full h-80 object-cover"
            />
          </Card>
        )}

        {/* Main Info */}
        <Card className="glass-effect leaf-shadow">
          <CardContent className="p-6 space-y-4">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {plant.common_name}
                </h1>
                {plant.is_verified && (
                  <Badge className="bg-green-500">✓ Verified</Badge>
                )}
              </div>
              <p className="text-lg italic text-gray-600">
                {plant.scientific_name}
              </p>
              {plant.alternative_names && Array.isArray(plant.alternative_names) && plant.alternative_names.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Also known as: {plant.alternative_names.join(", ")}
                </p>
              )}
            </div>

            {plant.description && (
              <p className="text-gray-700 leading-relaxed">{plant.description}</p>
            )}

            {plant.category && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-sm">
                  {plant.category.replace(/_/g, " ")}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edible Uses */}
        {plant.edible_uses && Array.isArray(plant.edible_uses) && plant.edible_uses.length > 0 && (
          <Card className="leaf-shadow border-green-200 bg-green-50/30">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold flex items-center space-x-2 text-green-800">
                <Leaf className="w-6 h-6" />
                <span>Edible Uses</span>
              </h2>
              <div className="space-y-3">
                {plant.edible_uses.map((use, index) => (
                  <div
                    key={index}
                    className="bg-white/80 p-4 rounded-lg space-y-2"
                  >
                    <p className="font-semibold text-gray-900">{use.use || use}</p>
                    {use.preparation && (
                      <p className="text-sm text-gray-700">{use.preparation}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medicinal Properties */}
        {plant.medicinal_properties && Array.isArray(plant.medicinal_properties) && plant.medicinal_properties.length > 0 && (
          <Card className="leaf-shadow border-blue-200 bg-blue-50/30">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold flex items-center space-x-2 text-blue-800">
                <Pill className="w-6 h-6" />
                <span>Medicinal Properties</span>
              </h2>
              <div className="space-y-3">
                {plant.medicinal_properties.map((prop, index) => (
                  <div
                    key={index}
                    className="bg-white/80 p-4 rounded-lg space-y-2"
                  >
                    <p className="font-semibold text-gray-900">{prop.condition}</p>
                    <p className="text-sm text-gray-700">{prop.remedy}</p>
                    {prop.dosage && (
                      <p className="text-xs text-blue-700">
                        <strong>Dosage:</strong> {prop.dosage}
                      </p>
                    )}
                    {prop.source && (
                      <p className="text-xs text-gray-500 italic">
                        Source: {prop.source}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-700 italic">
                Always consult healthcare professionals before medicinal use
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recipes */}
        {plant.recipes && Array.isArray(plant.recipes) && plant.recipes.length > 0 && (
          <Card className="leaf-shadow border-purple-200 bg-purple-50/30">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold flex items-center space-x-2 text-purple-800">
                <ChefHat className="w-6 h-6" />
                <span>Recipe Ideas</span>
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {plant.recipes.map((recipe, index) => (
                  <div key={index} className="bg-white/80 p-4 rounded-lg space-y-2">
                    <h3 className="font-bold text-gray-900">{recipe.name}</h3>
                    {recipe.prep_time && (
                      <p className="text-xs text-gray-500">
                        Prep time: {recipe.prep_time}
                      </p>
                    )}
                    {recipe.ingredients && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700">
                          Ingredients:
                        </p>
                        <p className="text-sm text-gray-600">{recipe.ingredients}</p>
                      </div>
                    )}
                    {recipe.instructions && (
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {recipe.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Safety Warnings */}
        {((plant.safety_warnings && Array.isArray(plant.safety_warnings) && plant.safety_warnings.length > 0) ||
          (plant.toxic_lookalikes && Array.isArray(plant.toxic_lookalikes) && plant.toxic_lookalikes.length > 0)) && (
          <Card className="leaf-shadow border-red-200 bg-red-50/30">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-6 h-6" />
                <span>Safety Information</span>
              </h2>

              {plant.safety_warnings && Array.isArray(plant.safety_warnings) && plant.safety_warnings.length > 0 && (
                <div className="space-y-2">
                  {plant.safety_warnings.map((warning, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        warning.severity === "danger"
                          ? "bg-red-100 text-red-900"
                          : warning.severity === "caution"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-blue-100 text-blue-900"
                      }`}
                    >
                      <p className="text-sm font-medium">{warning.warning}</p>
                    </div>
                  ))}
                </div>
              )}

              {plant.toxic_lookalikes && Array.isArray(plant.toxic_lookalikes) && plant.toxic_lookalikes.length > 0 && (
                <div className="bg-white/80 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900 mb-2">
                    Toxic Lookalikes:
                  </p>
                  <ul className="space-y-1">
                    {plant.toxic_lookalikes.map((lookalike, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        • {lookalike}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        {(plant.nutritional_info || plant.growing_info) && (
          <Card className="leaf-shadow glass-effect">
            <CardContent className="p-6 space-y-4">
              {plant.nutritional_info && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center space-x-2">
                    <Sprout className="w-5 h-5 text-green-600" />
                    <span>Nutritional Information</span>
                  </h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {plant.nutritional_info}
                  </p>
                </div>
              )}

              {plant.growing_info && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Growing Tips</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {plant.growing_info}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
