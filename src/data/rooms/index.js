import floor2Rooms from "./floor2";
import floor3Rooms from "./floor3";

const rooms = [...floor2Rooms, ...floor3Rooms];

// 開発時にid重複を検知する（本番ビルドでは影響なし）
if (import.meta.env?.DEV) {
  const seen = new Map();
  rooms.forEach((room) => {
    if (seen.has(room.id)) {
      console.warn(
        `[rooms] id "${room.id}" が重複しています（${seen.get(room.id)}階と${room.floor}階）。schedule.jsonとの対応がずれる可能性があります。`
      );
    } else {
      seen.set(room.id, room.floor);
    }
  });
}

export default rooms;
