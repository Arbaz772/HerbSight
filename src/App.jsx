import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./Pages/Home";
import SavedScans from "./Pages/SavedScans";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="savedscans" element={<SavedScans />} />
          {/* Add other nested routes here as needed */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
