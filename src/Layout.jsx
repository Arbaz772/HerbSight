import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Camera, BookOpen, History, ShieldAlert, Settings, Sparkles } from "lucide-react";

export default function Layout() {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  const navItems = [
    { name: "Scan", path: createPageUrl("Home"), icon: Camera },
    { name: "My Scans", path: createPageUrl("SavedScans"), icon: History },
  ];

  if (user?.role === "admin") {
    navItems.push(
      { name: "Database", path: createPageUrl("PlantDatabase"), icon: BookOpen },
      { name: "Admin", path: createPageUrl("AdminKnowledge"), icon: Settings }
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ... your style tag and animated background omitted for brevity ... */}

      <div className="flex flex-col min-h-screen pb-20 md:pb-0">
        {/* Header */}
        <header className="glass-effect-dark sticky top-0 z-40 border-b border-green-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link to={createPageUrl("Home")} className="flex items-center space-x-3 group">
                {/* Logo and Title here */}
              </Link>

              <div className="hidden md:flex items-center space-x-2">
                {navItems.map(item => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`nav-item flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all font-medium ${
                      location.pathname === item.path
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                        : "text-gray-700 hover:bg-white/60 hover:shadow-md"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              {/* User info view if logged in */}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        {/* ... Your mobile nav here ... */}

        {/* Footer */}
        {/* ... Safety disclaimer footer ... */}
      </div>
    </div>
  );
}
