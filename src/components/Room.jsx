import { getRoomStatus } from "../utils/roomStatus";

const STATUS_COLORS = {
  using: "#F44336",
  free: "#62fc0a",
  fixed: "#999",
  disabled: "#ddd",
};

function splitLabel(text, breakMode) {
  if (breakMode === "auto") return text.match(/.{1,4}/g) || [text];
  if (breakMode === "space") return text.split(" ");
  return [text];
}

function resolveFillColor(role, color, status) {
  if (role === "shape" && color) return color;
  return STATUS_COLORS[status] || color || "#eee";
}

export default function Room(room) {
  const { x, y, width, height, fontSize, vertical, breakMode, id, label, role, color, isMyClass } = room;

  const text = label ?? id;
  const lines = splitLabel(text, breakMode);

  const { status, label: subLabel } = getRoomStatus(room);
  const fillColor = resolveFillColor(role, color, status);

  const isClickable = role !== "noClick" && role !== "shape";
  const finalFontSize = fontSize || 14;
  const lineHeight = finalFontSize + 2;

  const hasSubLabel = role === "classroom" && subLabel;
  const verticalShift = hasSubLabel ? -(finalFontSize * 0.8) : 0;

  const handleClick = () => {
    if (!isClickable) return;
    alert(`${label || id}\n${subLabel || "空き教室"}`);
  };

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fillColor}
        stroke={isMyClass ? "#007bff" : "black"}
        strokeWidth={isMyClass ? 4 : 1}
        style={{ pointerEvents: isClickable ? "auto" : "none", cursor: isClickable ? "pointer" : "default" }}
        onClick={handleClick}
      />

      {role !== "noClick" && (
        <g style={{ pointerEvents: "none" }}>
          <text
            x={x + width / 2}
            y={y + height / 2 + verticalShift}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={finalFontSize}
            fontWeight="bold"
            style={vertical ? { writingMode: "vertical-rl" } : undefined}
          >
            {lines.map((line, index) => (
              <tspan key={index} x={x + width / 2} dy={index === 0 ? 0 : lineHeight}>
                {line}
              </tspan>
            ))}
          </text>

          {hasSubLabel && (
            <text
              x={x + width / 2}
              y={y + height / 2 + finalFontSize + 4}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={finalFontSize - 2}
              fill="#000"
            >
              {subLabel}
            </text>
          )}
        </g>
      )}
    </g>
  );
}
