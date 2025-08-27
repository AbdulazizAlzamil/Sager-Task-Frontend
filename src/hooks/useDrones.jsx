import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";

export function useDrones(url) {
  const [drones, setDrones] = useState({});
  const startTimes = useRef({});
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(url, { transports: ["polling"] });

    socketRef.current.on("message", (geojson) => {
      // Process all drones in the collection
      setDrones((prev) => {
        const newDrones = { ...prev };

        geojson.features.forEach((f) => {
          const id = f.properties.serial;
          const reg = f.properties.registration;
          const [lng, lat] = f.geometry.coordinates;
          const color = reg.split("-")[1]?.startsWith("B") ? "green" : "red";

          const existing = newDrones[id] || { path: [], firstSeen: Date.now() };
          const newPath = [...existing.path, [lng, lat]];

          newDrones[id] = {
            id,
            reg,
            color,
            alt: f.properties.altitude,
            yaw: f.properties.yaw,
            path: newPath.slice(-100),
            lng,
            lat,
            firstSeen: existing.firstSeen,
          };
        });

        return newDrones;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url]);

  return drones;
}
