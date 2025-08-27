import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView({ drones, selectedId, onSelect }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popup = useRef(null);
  const [hoveredDrone, setHoveredDrone] = useState(null);

  // Track if user has manually moved the map
  const userMovedMap = useRef(false);

  // Create popup instance
  useEffect(() => {
    popup.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      className:
        "!bg-gray-800/90 backdrop-blur !text-white !rounded-lg !shadow-xl !z-[1000]",
      offset: [0, -20],
      anchor: "bottom",
    });

    return () => {
      if (popup.current) {
        popup.current.remove();
        popup.current = null;
      }
    };
  }, []);

  // Update popup position and content when drone moves
  useEffect(() => {
    if (!hoveredDrone || !popup.current || !drones[hoveredDrone]) {
      return;
    }

    const drone = drones[hoveredDrone];
    const duration = ((Date.now() - drone.firstSeen) / 1000).toFixed(0);
    const minutes = Math.floor(duration / 60);
    const seconds = (duration % 60).toString().padStart(2, "0");

    const popupContent = document.createElement("div");
    popupContent.className = "p-2";
    popupContent.innerHTML = `
      <div class="flex items-center gap-2 mb-1">
        <span class="w-2 h-2 rounded-full" style="background-color: ${
          drone.color === "green" ? "#00ff88" : "#ff0044"
        }"></span>
        <span class="font-medium">${drone.reg}</span>
      </div>
      <div class="text-sm text-gray-400">
        <div>Altitude: ${drone.alt}m</div>
        <div>Flight time: ${minutes}:${seconds}</div>
        <div class="mt-1 text-xs opacity-75">
          [${drone.lng.toFixed(6)}, ${drone.lat.toFixed(6)}]
        </div>
      </div>
    `;

    popup.current
      .setLngLat([drone.lng, drone.lat])
      .setDOMContent(popupContent)
      .addTo(map.current);
  }, [drones, hoveredDrone]);

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [35.85, 32.55],
      zoom: 7,
    });

    // Add map controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Track user interaction with the map
    map.current.on("dragstart", () => {
      userMovedMap.current = true;
    });
    map.current.on("zoomstart", () => {
      userMovedMap.current = true;
    });
  }, []);

  // Handle selected drone - using ref to track the last selected id
  const lastSelectedId = useRef(null);
  const followDrone = useRef(false);

  useEffect(() => {
    if (!map.current || !selectedId || !drones[selectedId]) return;

    // If it's a new selection, enable following and fly to the drone
    if (lastSelectedId.current !== selectedId) {
      followDrone.current = true;
      const drone = drones[selectedId];
      map.current.flyTo({
        center: [drone.lng, drone.lat],
        zoom: 15,
        duration: 1000,
      });
      lastSelectedId.current = selectedId;
    }
    // If we're following a drone, update the map center
    else if (followDrone.current) {
      const drone = drones[selectedId];
      map.current.setCenter([drone.lng, drone.lat], { duration: 100 });
    }
  }, [selectedId, drones]);

  // Stop following when user moves the map
  useEffect(() => {
    if (!map.current) return;

    const stopFollowing = () => {
      followDrone.current = false;
    };

    map.current.on("dragstart", stopFollowing);
    map.current.on("zoomstart", stopFollowing);

    return () => {
      if (map.current) {
        map.current.off("dragstart", stopFollowing);
        map.current.off("zoomstart", stopFollowing);
      }
    };
  }, []);

  // Render/update markers & trails
  useEffect(() => {
    if (!map.current) return;

    // Create and add drone icons for each rotation and color
    const createDroneIcon = (yaw, color) => {
      const iconId = `drone-icon-${yaw}-${color.substring(1)}`; // remove # from color for id
      if (map.current.hasImage(iconId)) return iconId;

      const img = new Image();
      img.src =
        "data:image/svg+xml;base64," +
        btoa(`
        <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
          <!-- Fully colored circle background -->
          <circle cx="25" cy="25" r="18" fill="${color}" stroke="white" stroke-width="2"/>
          
          <!-- Drone icon in white for contrast -->
          <g fill="white" transform="translate(25, 25)">
            <!-- Main body -->
            <rect x="-6" y="-2" width="12" height="4" rx="2"/>
            <!-- Propellers -->
            <circle cx="-8" cy="-6" r="3" fill="none" stroke="white" stroke-width="1"/>
            <circle cx="8" cy="-6" r="3" fill="none" stroke="white" stroke-width="1"/>
            <circle cx="-8" cy="6" r="3" fill="none" stroke="white" stroke-width="1"/>
            <circle cx="8" cy="6" r="3" fill="none" stroke="white" stroke-width="1"/>
            <!-- Propeller arms -->
            <line x1="-6" y1="-2" x2="-8" y2="-6" stroke="white" stroke-width="1"/>
            <line x1="6" y1="-2" x2="8" y2="-6" stroke="white" stroke-width="1"/>
            <line x1="-6" y1="2" x2="-8" y2="6" stroke="white" stroke-width="1"/>
            <line x1="6" y1="2" x2="8" y2="6" stroke="white" stroke-width="1"/>
          </g>
          
          <!-- Direction arrow outside the circle -->
          <g transform="rotate(${yaw} 25 25)">
            <path 
              d="M25 3 L28 8 L22 8 Z" 
              fill="${color}"
              stroke="white"
              stroke-width="1"
            />
          </g>
        </svg>
      `);

      img.onload = () => {
        if (!map.current.hasImage(iconId)) {
          map.current.addImage(iconId, img);
        }
      };

      return iconId;
    };

    Object.values(drones).forEach((drone) => {
      const color = drone.color === "green" ? "#00ff88" : "#ff0044";

      // Draw path as line
      const pathId = `path-${drone.id}`;
      if (map.current.getSource(pathId)) {
        map.current.getSource(pathId).setData({
          type: "Feature",
          geometry: { type: "LineString", coordinates: drone.path },
        });
      } else {
        map.current.addSource(pathId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "LineString", coordinates: drone.path },
          },
        });
        map.current.addLayer({
          id: pathId,
          type: "line",
          source: pathId,
          paint: {
            "line-color": color,
            "line-width": 2,
            "line-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              0.4,
              15,
              0.8,
            ],
          },
        });
      }

      // Draw drone as rotated arrow
      const markerId = `marker-${drone.id}`;
      const iconId = createDroneIcon(drone.yaw, color);

      if (!map.current.getSource(markerId)) {
        map.current.addSource(markerId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {
              id: drone.id,
              yaw: drone.yaw,
              altitude: drone.alt,
              registration: drone.reg,
              color: color,
            },
            geometry: { type: "Point", coordinates: [drone.lng, drone.lat] },
          },
        });

        map.current.addLayer({
          id: markerId,
          type: "symbol",
          source: markerId,
          layout: {
            "icon-image": iconId,
            "icon-size": 1,
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "icon-anchor": "center",
          },
          paint: {
            "icon-color": ["get", "color"],
            "icon-opacity": ["case", ["==", ["get", "id"], selectedId], 1, 0.9],
          },
        });

        // Add hover interaction
        map.current.on("mouseenter", markerId, (e) => {
          map.current.getCanvas().style.cursor = "pointer";
          const props = e.features[0].properties;
          setHoveredDrone(props.id);
        });

        map.current.on("mouseleave", markerId, () => {
          map.current.getCanvas().style.cursor = "";
          if (popup.current) {
            popup.current.remove();
          }
          setHoveredDrone(null);
        });

        map.current.on("click", markerId, (e) => {
          const props = e.features[0].properties;
          onSelect(props.id);
        });
      } else {
        // Update marker position and properties
        map.current.getSource(markerId).setData({
          type: "Feature",
          properties: {
            id: drone.id,
            yaw: drone.yaw,
            altitude: drone.alt,
            registration: drone.reg,
            color: color,
          },
          geometry: { type: "Point", coordinates: [drone.lng, drone.lat] },
        });

        // Update icon for new rotation
        const newIconId = createDroneIcon(drone.yaw, color);
        if (map.current.getLayer(markerId)) {
          map.current.setLayoutProperty(markerId, "icon-image", newIconId);
        }
      }
    });
  }, [drones, selectedId, onSelect]);

  // Count red drones
  const redDroneCount = Object.values(drones).filter(
    (d) => d.color === "red"
  ).length;

  return (
    <>
      {/* Map container */}
      <div className="relative w-full h-full">
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      {/* Red drone counter button - positioned outside map container */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center"
        style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.25))" }}
      >
        <button
          className="
            relative
            bg-gray-800/95 hover:bg-gray-700/95
            text-white
            px-5 py-2.5
            rounded-full
            shadow-xl
            border border-gray-600
            backdrop-blur
            transition-all duration-200
            flex items-center gap-2.5
            font-medium
          "
        >
          <span className="text-red-400 font-bold text-lg">
            {redDroneCount}
          </span>
          <span className="text-gray-100">
            red drone{redDroneCount !== 1 ? "s" : ""}
          </span>
        </button>
      </div>
    </>
  );
}
