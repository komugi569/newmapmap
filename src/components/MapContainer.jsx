import { useState, useEffect } from "react";
import Room from "./Room";
import MapControls from "./MapControls";
import CorridorPaths from "./CorridorPaths";
import rooms from "../data/rooms";
import { usePanZoom } from "../hooks/usePanZoom";
import { useCurrentPeriod } from "../hooks/useCurrentPeriod";
import { useMyClass } from "../hooks/useMyClass";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const MAP_WIDTH = 1848;
const MAP_HEIGHT = 1245;

export default function MapContainer() {
  const [currentFloor, setCurrentFloor] = useState(2);
  const period = useCurrentPeriod();
  const { selectedClass, classList, selectClass } = useMyClass();
  const { scale, coords, isDragging, handlers } = usePanZoom(0.7);

  // 💡 Firebaseからデータを取得してlocalStorageに保存（同期）する処理だけ残しています
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!selectedClass) return;
      
      try {
        const docRef = doc(db, "schedules", selectedClass);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const scheduleData = docSnap.data();
          
          // ⚠️ "scheduleKey" の部分は、既存のコードで使っているキー名に変更してください
          localStorage.setItem("scheduleKey", JSON.stringify(scheduleData));
        }
      } catch (error) {
        console.error("データ取得エラー:", error);
      }
    };

    fetchSchedule();
  }, [selectedClass]);

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