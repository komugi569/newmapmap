import { useState, useEffect } from "react";
import Room from "./Room";
import MapControls from "./MapControls";
import CorridorPaths from "./CorridorPaths";
import rooms from "../data/rooms";
import { usePanZoom } from "../hooks/usePanZoom";
import { doc, collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { getCurrentPeriod } from "../utils/dateUtils";

const MAP_WIDTH = 1848;
const MAP_HEIGHT = 1245;

// 💡 現在時刻を「0:00からの経過分」に変換
const nowToMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

export default function MapContainer() {
  const [currentFloor, setCurrentFloor] = useState(2);
  const { scale, coords, isDragging, handlers } = usePanZoom(0.7);

  const [, setRefreshKey] = useState(0);

  // 💡 時間バー用のstate（分単位）。初期値は現在時刻
  const [timeMinutes, setTimeMinutes] = useState(nowToMinutes);
  const [isLive, setIsLive] = useState(true);

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

  // 💡 ライブモードの間は1分ごとに現在時刻へ追従させる
  useEffect(() => {
    if (!isLive) return;
    setTimeMinutes(nowToMinutes());
    const interval = setInterval(() => {
      setTimeMinutes(nowToMinutes());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  // バーを操作したら手動モードに切り替える
  const handleTimeChange = (minutes) => {
    setIsLive(false);
    setTimeMinutes(minutes);
  };

  const handleResetToNow = () => {
    setIsLive(true);
    setTimeMinutes(nowToMinutes());
  };

  // 💡 指定された「今日の分」を、今日の日付のDateオブジェクトに変換
  const referenceDate = (() => {
    const d = new Date();
    d.setHours(Math.floor(timeMinutes / 60), timeMinutes % 60, 0, 0);
    return d;
  })();

 const period = getCurrentPeriod(referenceDate);

  const filteredRooms = rooms.filter((room) => room.floor === currentFloor);

  return (
    <div style={{ position: "fixed", width: "100%", height: "100%", overflow: "hidden" }}>
      <MapControls
        period={period}
        timeMinutes={timeMinutes}
        onTimeChange={handleTimeChange}
        isLive={isLive}
        onResetToNow={handleResetToNow}
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
                  isMyClass={false}
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