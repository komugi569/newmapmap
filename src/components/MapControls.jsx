const FLOORS = [2, 3];

export default function MapControls({
  period,
  selectedClass,
  classList,
  onClassChange,
  currentFloor,
  onFloorChange,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 15px",
        paddingTop: "max(10px, env(safe-area-inset-top))",
        background: "rgba(255, 255, 255, 0.95)",
        zIndex: 100,
        position: "relative",
        borderBottom: "1px solid #ddd",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#333", whiteSpace: "nowrap", flexShrink: 0 }}>
        {period !== null ? `現在：${period + 1}限` : "授業外"}
      </div>

      <select
        value={selectedClass}
        onChange={(e) => onClassChange(e.target.value)}
        style={{
          margin: "0 10px",
          padding: "5px 8px",
          fontSize: "14px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          background: "#fff",
          color: "#333",
          flexGrow: 1,
          maxWidth: "150px",
        }}
      >
        <option value="">クラスを選択</option>
        {classList.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

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
  );
}
