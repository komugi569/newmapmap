import { useState, useEffect } from "react";
import Room from "./Room";
import MapControls from "./MapControls";
import CorridorPaths from "./CorridorPaths";
import rooms from "../data/rooms";
import { usePanZoom } from "../hooks/usePanZoom";
import { getCurrentPeriod } from "../utils/dateUtils";
import { doc, collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const MAP_WIDTH = 1848;
const MAP_HEIGHT = 1245;

const nowToMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

// 💡 時刻だけの日付(今日)を返す
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function MapContainer() {
  const [currentFloor, setCurrentFloor] = useState(2);
  const { scale, coords, isDragging, handlers } = usePanZoom(0.7);

  const [, setRefreshKey] = useState(0);

  const [timeMinutes, setTimeMinutes] = useState(nowToMinutes);
  const [targetDate, setTargetDate] = useState(startOfToday); // 💡 日付のstate
  const [isLive, setIsLive] = useState(true);

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

  // ライブモードの間は1分ごとに現在時刻・今日の日付へ追従させる
  useEffect(() => {
    if (!isLive) return;
    setTimeMinutes(nowToMinutes());
    setTargetDate(startOfToday());
    const interval = setInterval(() => {
      setTimeMinutes(nowToMinutes());
      setTargetDate(startOfToday());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const handleTimeChange = (minutes) => {
    setIsLive(false);
    setTimeMinutes(minutes);
  };

  // 💡 日付操作は手動モードに切り替える
  const handleDateChange = (newDate) => {
    setIsLive(false);
    setTargetDate(newDate);
  };

  const handleResetToNow = () => {
    setIsLive(true);
    setTimeMinutes(nowToMinutes());
    setTargetDate(startOfToday());
  };

  // 💡 指定された日付 + 時刻を組み合わせて基準日時を作る
  const referenceDate = (() => {
    const d = new Date(targetDate);
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
        targetDate={targetDate}
        onDateChange={handleDateChange}
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