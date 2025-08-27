import { useState } from "react";
import { useDrones } from "../hooks/useDrones";
import MapView from "../components/MapView";
import DroneList from "../components/DroneList";
import Header from "../components/layout/Header";
import SideNav from "../components/layout/SideNav";
import DronePanel from "../components/layout/DronePanel";
import { Menu } from "lucide-react";

export default function Home() {
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:9013";
  const drones = useDrones(backendUrl);
  const [selectedId, setSelectedId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("map");
  const [isDronePanelOpen, setIsDronePanelOpen] = useState(true);

  const handleDroneSelect = (droneId) => {
    setSelectedId(droneId);
    if (window.innerWidth < 768) {
      setIsDronePanelOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      <Header
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1 relative">
        <SideNav
          isOpen={isSidebarOpen}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <DronePanel
          isOpen={isDronePanelOpen}
          onClose={() => setIsDronePanelOpen(false)}
        >
          <DroneList
            drones={drones}
            selectedId={selectedId}
            onSelect={handleDroneSelect}
            onClose={() => setIsDronePanelOpen(false)}
          />
        </DronePanel>

        <main className="flex-1 relative h-full overflow-hidden">
          {!isDronePanelOpen && (
            <button
              onClick={() => setIsDronePanelOpen(true)}
              className="
                absolute top-4 left-4 z-50 
                bg-gray-800/95 hover:bg-gray-700 
                text-white p-3 rounded-full 
                shadow-lg border border-gray-700/50
                backdrop-blur transition-all duration-200
                flex items-center gap-2
              "
              aria-label="Show drone list"
            >
              <Menu size={18} />
              <span className="text-sm font-medium hidden sm:inline">
                Drone List
              </span>
            </button>
          )}

          <MapView
            drones={drones}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </main>

        {isDronePanelOpen && (
          <div
            className="fixed md:hidden inset-0 bg-black/50 z-20"
            onClick={() => setIsDronePanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
