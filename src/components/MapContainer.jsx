import { useState, useEffect } from "react";
import Room from "./Room";
import MapControls from "./MapControls";
import CorridorPaths from "./CorridorPaths";
import rooms from "../data/rooms";
import { usePanZoom } from "../hooks/usePanZoom";
import { useCurrentPeriod } from "../hooks/useCurrentPeriod";
import { useMyClass } from "../hooks/useMyClass";
import { doc, collection, onSnapshot } from "firebase/firestore"; // 💡 getDoc から onSnapshot に変更
import { db } from "../firebase";

const MAP_WIDTH = 1848;
const MAP_HEIGHT = 1245;

export default function MapContainer() {
  const [currentFloor, setCurrentFloor] = useState(2);
  const period = useCurrentPeriod();
  const { selectedClass, classList, selectClass } = useMyClass();
  const { scale, coords, isDragging, handlers } = usePanZoom(0.7);

  const [, setRefreshKey] = useState(0);


useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "schedules"), (snapshot) => {
    const allSchedules = {};
    snapshot.forEach((docSnap) => {
      allSchedules[docSnap.id] = docSnap.data();
    });
    localStorage.setItem("scheduleKey", JSON.stringify(allSchedules));
    setRefreshKey((prev) => prev + 1);
  }, (error) => {
    console.error("データ監視エラー:", error);
  });

  return () => unsubscribe();
}, []); // selectedClass依存も不要になる

  const filteredRooms = rooms.filter((room) => room.floor === currentFloor);

  return (
    <div style={{ position: "fixed", width: "100%", height: "100%", overflow: "hidden" }}>
      <MapControls
        period={period}
        selectedClass={selectedClass}
        classList={classList}
        onClassChange={selectClass}
        currentFloor={currentFloor}
        onFloorChange={setCurrentFloor}
      />

      <div
        style={{
          width: "100vw",
          height: "calc(100vh - 60px)",
          backgroundColor: "#f9f9f9",
          touchAction: "none",
          cursor: isDragging ? "grabbing" : "grab",
          overflow: "hidden",
        }}
        {...handlers}
      >
        <div
          style={{
            transform: `translate(${coords.x}px, ${coords.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            width: `${MAP_WIDTH}px`,
            height: `${MAP_HEIGHT}px`,
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} width="100%" height="100%">
            <g id="background">
              <rect width="100%" height="100%" fill="white" />
            </g>

            <CorridorPaths floor={currentFloor} />

            <g id="rooms">
              {filteredRooms.map((room) => (
                <Room 
                  key={room.id} 
                  {...room} 
                  isMyClass={room.id === selectedClass} 
                />
              ))}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}