import * as ScrollArea from "@radix-ui/react-scroll-area";
import { X } from "lucide-react";

export default function DroneList({ drones, selectedId, onSelect, onClose }) {
  const list = Object.values(drones);

  return (
    <div className="flex flex-col w-full h-full bg-gray-800/95 backdrop-blur">
      <header className="flex items-center justify-between px-6 h-16 border-b border-gray-700">
        <h1 className="font-bold">DRONE FLYING</h1>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
          aria-label="Close drone list"
        >
          <X size={16} className="text-gray-300" />
        </button>
      </header>

      <div className="flex gap-2 px-6 py-4 border-b border-gray-700">
        <div className="flex-1">
          <div className="text-sm text-gray-400">Drones</div>
          <div className="font-medium">{list.length} Active</div>
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-400">Flights History</div>
          <div className="font-medium">View All</div>
        </div>
      </div>

      <ScrollArea.Root className="flex-1 overflow-hidden">
        <ScrollArea.Viewport
          className="h-full w-full"
          style={{ maxHeight: "calc(100vh - 280px)" }}
        >
          <div className="flex flex-col gap-4 p-6 pb-20 min-h-full">
            {list.map((drone) => {
              const duration = ((Date.now() - drone.firstSeen) / 1000).toFixed(
                0
              );
              const isSelected = drone.id === selectedId;

              return (
                <div
                  key={drone.id}
                  className={`
                    w-full p-4 cursor-pointer transition-colors
                    border-2 rounded-lg hover:bg-gray-700/50
                    ${
                      isSelected
                        ? "bg-gray-700/50 border-white"
                        : "border-gray-600 hover:border-gray-500"
                    }
                  `}
                  onClick={() => onSelect(drone.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            drone.color === "green" ? "#00ff88" : "#ff0044",
                        }}
                      />
                      <span className="font-medium text-lg">{drone.reg}</span>
                    </div>
                    <span className="text-sm text-gray-400 font-mono">
                      {Math.floor(duration / 60)}:
                      {(duration % 60).toString().padStart(2, "0")}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Serial #</span>
                      <span className="text-gray-200 font-mono">
                        {drone.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Organization</span>
                      <span className="text-gray-200">Sager Drone</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Altitude</span>
                      <span className="text-gray-200 font-mono">
                        {drone.alt} m
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex touch-none select-none transition-colors w-3 bg-transparent hover:bg-gray-700/30"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="flex-1 bg-gray-500/80 rounded-full relative hover:bg-gray-400/90 min-h-[20px]" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner className="bg-transparent" />
      </ScrollArea.Root>
    </div>
  );
}
