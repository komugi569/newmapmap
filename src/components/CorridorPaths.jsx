// 廊下の形状は現状フロアごとに手描きの座標なので、当面はここに集約するだけに留めている。
// フロアが増える場合は floor をキーにしたパス定義オブジェクトへ拡張する。
export default function CorridorPaths({ floor }) {
  if (floor !== 2 && floor !== 3) return null;

  return (
    <g id="corridors">
      {floor === 2 && (
        <path
          d="M 370 700 H 450 V 220 H 370 Z"
          fill="rgba(232,211,181,0.7)"
          stroke="#c5b08e"
          strokeWidth="2"
        />
      )}
      <path
        d="M 450 300 H 1780 V 370 H 1610 V 700 H 1570 V 615 H 1030 V 700 H 990 V 615 H 450 V 580 H 490 V 335 H 450 Z M 525 335 H 990 V 580 H 525 Z M 1030 335 H 1570 V 580 H 1030 Z"
        fill="rgba(232,211,181,0.7)"
        fillRule="evenodd"
        stroke="#c5b08e"
        strokeWidth="2"
      />
    </g>
  );
}
