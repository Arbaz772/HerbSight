import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";  // Import Outlet here
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
      {/* All your existing style and layout code here */}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet /> {/* THIS RENDERS THE ROUTE'S PAGE COMPONENT */}
      </main>

  
      
    </div>
  );
}
import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";  // Add Outlet import
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
      <style>{`
        :root {
          --primary: 34 197 94;
          --primary-dark: 22 163 74;
          --accent: 134 239 172;
          --earth: 120 113 108;
          --sage: 163 177 138;
          --forest: 34 139 34;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }
        
        .glass-effect-dark {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.9);
        }
        
        .leaf-shadow {
          box-shadow: 0 10px 40px rgba(34, 197, 94, 0.15), 0 4px 12px rgba(34, 197, 94, 0.1);
        }
        
        .leaf-shadow-lg {
          box-shadow: 0 20px 60px rgba(34, 197, 94, 0.25), 0 8px 20px rgba(34, 197, 94, 0.15);
        }
        
        .gradient-mesh {
          background: 
            radial-gradient(at 0% 0%, rgba(134, 239, 172, 0.3) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(74, 222, 128, 0.2) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(34, 197, 94, 0.3) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.2) 0px, transparent 50%);
        }
        
        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(34, 197, 94, 0.2);
        }
        
        .nav-item {
          position: relative;
          overflow: hidden;
        }
        
        .nav-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        
        .nav-item:hover::before {
          left: 100%;
        }
      `}</style>

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50"></div>
        <div className="gradient-mesh absolute inset-0"></div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-emerald-200/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-48 h-48 bg-teal-200/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="flex flex-col min-h-screen pb-20 md:pb-0">
        {/* Header */}
        <header className="glass-effect-dark sticky top-0 z-40 border-b border-green-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link to={createPageUrl("Home")} className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl blur-md group-hover:blur-lg transition-all"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-all duration-300 shadow-lg">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 bg-clip-text text-transparent">
                      HerbSight
                    </h1>
                    <Sparkles className="w-4 h-4 text-green-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-gray-500 -mt-1 font-medium">AI Plant Intelligence</p>
                </div>
              </Link>

              <div className="hidden md:flex items-center space-x-2">
                {navItems.map((item) => (
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

              {user && (
                <div className="hidden md:flex items-center space-x-3 glass-effect px-4 py-2 rounded-xl">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
                    <p className="text-xs text-green-600 capitalize font-medium">{user.role}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-sm"></div>
                    <div className="relative w-11 h-11 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">
                        {user.full_name?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet /> {/* Render nested routes here */}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-effect-dark border-t border-green-100/50 z-50">
          <div className="flex items-center justify-around py-3 px-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-all ${
                  location.pathname === item.path
                    ? "text-green-600 scale-110"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <div className={`${location.pathname === item.path ? 'bg-green-100 p-2 rounded-xl' : ''}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Safety Disclaimer Footer */}
        <footer className="glass-effect border-t border-green-100/50 mt-8 py-6 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start space-x-3 text-amber-900 bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200/50 shadow-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold mb-1">Important Safety Notice</p>
                <p className="text-xs leading-relaxed text-amber-800">
                  HerbSight provides informational content only and is not a substitute for professional medical advice, 
                  diagnosis, or treatment. Always consult qualified healthcare providers before using any plant for medicinal 
                  purposes. Never consume wild plants without expert verification. We are not responsible for misidentification 
                  or adverse effects.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
