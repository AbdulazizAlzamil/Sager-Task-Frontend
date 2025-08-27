import { LayoutDashboard, MapPin } from "lucide-react";

export default function SideNav({ isOpen, activeTab = "map", onTabChange }) {
  const tabs = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "map", icon: MapPin, label: "Map View" },
  ];

  return (
    <aside
      className="
        w-20 h-full bg-gray-800 border-r border-gray-700 
        transform transition-all duration-300 ease-in-out z-20
      "
    >
      <div className="flex flex-col h-full py-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={`
              w-full aspect-square flex flex-col items-center justify-center gap-1
              hover:bg-gray-700/50 transition-colors
              ${
                activeTab === tab.id
                  ? "bg-gray-700/50 border-l-2 border-white"
                  : ""
              }
            `}
          >
            <tab.icon
              className={`w-6 h-6 ${
                activeTab === tab.id ? "text-white" : "text-gray-400"
              }`}
            />
            <span
              className={`text-xs ${
                activeTab === tab.id ? "text-white" : "text-gray-400"
              }`}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
