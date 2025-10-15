
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Search, Trash2, Camera } from "lucide-react";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function SavedScans() {
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [filteredScans, setFilteredScans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadScans();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [scans, searchQuery, filter]);

  const loadScans = async () => {
    setIsLoading(true);
    
    try {
      // Load from localStorage with error handling
      const localScansStr = localStorage.getItem('herbsight_scans');
      
      if (localScansStr) {
        const localScans = JSON.parse(localScansStr);
        if (Array.isArray(localScans)) {
          // Sort by date, newest first
          const sortedScans = localScans.sort((a, b) => 
            new Date(b.created_date) - new Date(a.created_date)
          );
          setScans(sortedScans);
        } else {
          setScans([]); // If it's not an array, initialize as empty
        }
      } else {
        setScans([]); // If no data in localStorage, initialize as empty
      }
    } catch (error) {
      console.error("Error loading scans:", error);
      setScans([]); // On error, initialize as empty to prevent crashes
    }
    
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...scans];

    if (filter === "favorites") {
      filtered = filtered.filter((scan) => scan.is_favorite);
    }

    if (searchQuery) {
      filtered = filtered.filter((scan) => {
        const commonName = scan.identification?.common_name?.toLowerCase() || "";
        const scientificName = scan.identification?.scientific_name?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return commonName.includes(query) || scientificName.includes(query);
      });
    }

    setFilteredScans(filtered);
  };

  const handleDelete = async (scanId, event) => {
    event.stopPropagation();
    if (!confirm("Delete this scan? This action cannot be undone.")) return;

    try {
      // Delete from state
      const updatedScans = scans.filter((s) => s.id !== scanId);
      setScans(updatedScans);
      
      // Delete from localStorage
      localStorage.setItem('herbsight_scans', JSON.stringify(updatedScans));
    } catch (error) {
      console.error("Error deleting scan:", error);
      alert("Failed to delete scan");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading your plant collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* SEO Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            My Saved Plant Identifications
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your personal collection of identified herbs, spices, and medicinal plants. Browse, search, 
            and manage all your saved plant scans in one place.
          </p>
        </div>

        {/* Stats and New Scan */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="glass-effect rounded-xl p-4">
            <p className="text-sm text-gray-600">Total Plants Identified</p>
            <p className="text-3xl font-bold text-green-600">{scans.length}</p>
          </div>

          <Button
            onClick={() => navigate(createPageUrl("Home"))}
            className="bg-green-600 hover:bg-green-700 h-12"
          >
            <Camera className="w-5 h-5 mr-2" />
            Identify New Plant
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="glass-effect rounded-2xl p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by plant name..."
              className="pl-10 h-12"
            />
          </div>

          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All Scans
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1">
                Favorites
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Scans Grid */}
        {filteredScans.length === 0 ? (
          <div className="text-center py-16 glass-effect rounded-2xl">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery || filter === "favorites"
                ? "No plants found matching your filters"
                : "Start Your Plant Collection"}
            </h2>
            <p className="text-gray-500 mb-6">
              {searchQuery || filter === "favorites"
                ? "Try adjusting your search or filters"
                : "Identify your first herb, spice, or medicinal plant to build your personal plant library"}
            </p>
            {!searchQuery && filter === "all" && (
              <Button
                onClick={() => navigate(createPageUrl("Home"))}
                className="mt-4 bg-green-600 hover:bg-green-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Identify Your First Plant
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredScans.map((scan) => (
              <Card
                key={scan.id}
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-shadow leaf-shadow"
                onClick={() =>
                  navigate(createPageUrl(`ScanResult?id=${scan.id}`))
                }
              >
                <div className="relative h-48 bg-gray-100">
                  {scan.image_url ? (
                    <img
                      src={scan.image_url}
                      alt={scan.identification?.common_name || "Plant"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  {scan.is_favorite && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                      <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
                    </div>
                  )}
                </div>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                      {scan.identification?.common_name || "Unknown Plant"}
                    </h3>
                    <p className="text-sm italic text-gray-600 line-clamp-1">
                      {scan.identification?.scientific_name || "Classification pending"}
                    </p>
                  </div>

                  {scan.identification?.confidence && (
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            scan.identification.confidence >= 0.8
                              ? "bg-green-500"
                              : scan.identification.confidence >= 0.6
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${scan.identification.confidence * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {Math.round(scan.identification.confidence * 100)}%
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-gray-500">
                      {scan.created_date ? format(new Date(scan.created_date), "MMM d, yyyy") : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(scan.id, e)}
                      className="h-8 w-8 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
