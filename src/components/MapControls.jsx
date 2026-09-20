const FLOORS = [2, 3];

// 💡 時間バーの範囲(分単位、0:00からの経過分)
// 💡 時間バーの範囲(分単位、0:00からの経過分)
const TIME_MIN = 8 * 60; // 8:00
const TIME_MAX = 18 * 60; // 18:00

const formatMinutes = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
};

export default function MapControls({
  period,
  timeMinutes,
  onTimeChange,
  isLive,
  onResetToNow,
  currentFloor,
  onFloorChange,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        padding: "10px 15px",
        paddingTop: "max(10px, env(safe-area-inset-top))",
        background: "rgba(255, 255, 255, 0.95)",
        zIndex: 100,
        position: "relative",
        borderBottom: "1px solid #ddd",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "14px", fontWeight: "bold", color: "#333", whiteSpace: "nowrap", flexShrink: 0 }}>
          {isLive ? "🔴 現在：" : "🕒 "}
          {period !== null ? `${period + 1}限` : "授業外"}
          <span style={{ fontWeight: "normal", color: "#666", marginLeft: "6px" }}>
            {formatMinutes(timeMinutes)}
          </span>
        </div>

        <div style={{ display: "flex", gap: "5px", background: "#eee", padding: "3px", borderRadius: "8px" }}>
          {FLOORS.map((f) => (
            <button
              key={f}
              onClick={() => onFloorChange(f)}
              style={{
                padding: "6px 12px",
                fontSize: "14px",
                backgroundColor: currentFloor === f ? "#007bff" : "transparent",
                color: currentFloor === f ? "#fff" : "#333",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "0.2s",
              }}
            >
              {f}F
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "12px", color: "#999", flexShrink: 0 }}>{formatMinutes(TIME_MIN)}</span>
        <input
          type="range"
          min={TIME_MIN}
          max={TIME_MAX}
          step={5}
          value={timeMinutes}
          onChange={(e) => onTimeChange(Number(e.target.value))}
          style={{ flexGrow: 1 }}
        />
        <span style={{ fontSize: "12px", color: "#999", flexShrink: 0 }}>{formatMinutes(TIME_MAX)}</span>

        {!isLive && (
          <button
            onClick={onResetToNow}
            style={{
              padding: "4px 10px",
              fontSize: "12px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            現在に戻す
          </button>
        )}
      </div>
    </div>
  );
}