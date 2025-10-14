import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(createPageUrl("Home"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent" />
    </div>
  );
}