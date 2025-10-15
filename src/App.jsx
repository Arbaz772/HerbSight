import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";  // create placeholder page components
import SavedScans from "./pages/SavedScans";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="savescans" element={<SavedScans />} />
          {/* Add other routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
