import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Leaf, Plus, ShieldAlert } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PlantDatabase() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [user, setUser] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [plants, searchQuery, categoryFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const userData = await base44.auth.me().catch(() => null);
      setUser(userData);
      
      // Check if user is admin
      if (!userData || userData.role !== "admin") {
        setAccessDenied(true);
        setIsLoading(false);
        return;
      }

      const plantsData = await base44.entities.PlantKnowledge.list("-created_date");
      setPlants(plantsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...plants];

    if (categoryFilter !== "all") {
      filtered = filtered.filter((plant) => plant.category === categoryFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (plant) =>
          plant.common_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plant.scientific_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPlants(filtered);
  };

  const getCategoryColor = (category) => {
    const colors = {
      herb: "bg-green-100 text-green-800",
      spice: "bg-orange-100 text-orange-800",
      vegetable: "bg-emerald-100 text-emerald-800",
      fruit: "bg-red-100 text-red-800",
      medicinal_plant: "bg-blue-100 text-blue-800",
      flower: "bg-pink-100 text-pink-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.other;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading plant database...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Plant Database</h1>
            <p className="text-gray-600 mt-1">
              Explore {plants.length} curated plant entries
            </p>
          </div>

          <Button
            onClick={() => navigate(createPageUrl("AdminKnowledge"))}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Plant
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="glass-effect rounded-2xl p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plants..."
              className="pl-10 h-12"
            />
          </div>

          <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
            <TabsList className="w-full grid grid-cols-4 lg:grid-cols-7">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="herb">Herbs</TabsTrigger>
              <TabsTrigger value="spice">Spices</TabsTrigger>
              <TabsTrigger value="vegetable">Vegetables</TabsTrigger>
              <TabsTrigger value="fruit">Fruits</TabsTrigger>
              <TabsTrigger value="medicinal_plant">Medicinal</TabsTrigger>
              <TabsTrigger value="flower">Flowers</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Plants Grid */}
        {filteredPlants.length === 0 ? (
          <div className="text-center py-16">
            <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery || categoryFilter !== "all"
                ? "No plants found"
                : "Database is empty. Add your first plant entry!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlants.map((plant) => (
              <Card
                key={plant.id}
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-shadow leaf-shadow"
                onClick={() =>
                  navigate(createPageUrl(`PlantDetail?id=${plant.id}`))
                }
              >
                {plant.image_url && (
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={plant.image_url}
                      alt={plant.common_name}
                      className="w-full h-full object-cover"
                    />
                    {plant.is_verified && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        ✓ Verified
                      </div>
                    )}
                  </div>
                )}

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                      {plant.common_name}
                    </h3>
                    <p className="text-sm italic text-gray-600 line-clamp-1">
                      {plant.scientific_name}
                    </p>
                  </div>

                  {plant.description && (
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {plant.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {plant.category && (
                      <Badge className={getCategoryColor(plant.category)}>
                        {plant.category.replace(/_/g, " ")}
                      </Badge>
                    )}
                    {plant.edible_uses && plant.edible_uses.length > 0 && (
                      <Badge variant="outline">Edible</Badge>
                    )}
                    {plant.medicinal_properties &&
                      plant.medicinal_properties.length > 0 && (
                        <Badge variant="outline">Medicinal</Badge>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}