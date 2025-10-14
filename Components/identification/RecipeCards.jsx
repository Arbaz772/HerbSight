import React from "react";
import { ChefHat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecipeCards({ recipes }) {
  if (!recipes || !Array.isArray(recipes) || recipes.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
        <ChefHat className="w-5 h-5 text-purple-500" />
        <span>Recipe Ideas</span>
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        {recipes.map((recipe, index) => (
          <Card key={index} className="border-purple-200 bg-purple-50/30 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-purple-900">{recipe.name || "Recipe"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recipe.description && (
                <p className="text-sm text-gray-700 leading-relaxed">{recipe.description}</p>
              )}
              
              {recipe.instructions && (
                <div className="bg-white/80 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 mb-1">Instructions:</p>
                  <p className="text-xs text-gray-700 whitespace-pre-line">{recipe.instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}