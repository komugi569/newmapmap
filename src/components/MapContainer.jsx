import { useState, useEffect } from "react";
import Room from "./Room";
import MapControls from "./MapControls";
import CorridorPaths from "./CorridorPaths";
import rooms from "../data/rooms";
import { usePanZoom } from "../hooks/usePanZoom";
import { useCurrentPeriod } from "../hooks/useCurrentPeriod";
import { useMyClass } from "../hooks/useMyClass";
import { doc, collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const MAP_WIDTH = 1848;
const MAP_HEIGHT = 1245;

// 💡 datetime-local input用にDateを "YYYY-MM-DDTHH:mm" 形式に変換
const toDateTimeLocalValue = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function MapContainer() {
  const [currentFloor, setCurrentFloor] = useState(2);
  const period = useCurrentPeriod();
  const { selectedClass, classList, selectClass } = useMyClass();
  const { scale, coords, isDragging, handlers } = usePanZoom(0.7);

  const [, setRefreshKey] = useState(0);

  // 💡 時間指定機能用のstate
  const [isLive, setIsLive] = useState(true);
  const [customDateTime, setCustomDateTime] = useState(() => toDateTimeLocalValue(new Date()));

  // 💡 実際に判定に使う基準日時（リアルタイムなら現在、そうでなければ指定日時）
  const referenceDate = isLive ? new Date() : new Date(customDateTime);

  // 全クラス分をリアルタイム購読する
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "schedules"),
      (snapshot) => {
        const allSchedules = {};
        snapshot.forEach((docSnap) => {
          allSchedules[docSnap.id] = docSnap.data();
        });
        localStorage.setItem("scheduleKey", JSON.stringify(allSchedules));
        setRefreshKey((prev) => prev + 1);
      },
      (error) => {
        console.error("データ監視エラー:", error);
      }
    );

    return () => unsubscribe();
  }, []);

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

      {/* 💡 時間指定パネル */}
      <div
        style={{
          position: "fixed",
          top: "70px",
          right: "10px",
          zIndex: 1000,
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "10px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          fontSize: "13px",
          color: "#222",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: isLive ? 0 : "8px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={isLive}
              onChange={(e) => setIsLive(e.target.checked)}
            />
            リアルタイム
          </label>
        </div>

        {!isLive && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <input
              type="datetime-local"
              value={customDateTime}
              onChange={(e) => setCustomDateTime(e.target.value)}
              style={{ padding: "4px", border: "1px solid #ccc", borderRadius: "4px", color: "#222", backgroundColor: "#fff" }}
            />
            <button
              onClick={() => {
                setCustomDateTime(toDateTimeLocalValue(new Date()));
                setIsLive(true);
              }}
              style={{ padding: "4px 8px", background: "#eee", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", color: "#222" }}
            >
              現在に戻す
            </button>
          </div>
        )}
      </div>

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
                  referenceDate={referenceDate}
                />
              ))}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}