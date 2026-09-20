import defaultSchedule from "../data/schedule.json";
import { getToday, getCurrentPeriod } from "./dateUtils";

const getCloudSchedule = () => {
  try {
    const data = localStorage.getItem("scheduleKey");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("ローカルストレージの読み込みエラー:", e);
    return null;
  }
};

export const getSubjectAt = (classId, day, period, scheduleSource = defaultSchedule) => {
  const cloudSchedule = getCloudSchedule() || {};
  const classSchedule = cloudSchedule[classId] || scheduleSource[classId];

  if (!classSchedule) return null;

  const daySchedule = classSchedule[day];
  if (!daySchedule) return null;

  if (period === null || period >= daySchedule.length) return null;

  return daySchedule[period] || null;
};

/**
 * 部屋オブジェクトから表示用の状態（色分け用ステータスとサブラベル）を計算する。
 * options.now を渡すと、その日時を基準に判定する（省略時は現在時刻）。
 */
export const getRoomStatus = (room, options = {}) => {
  const { id, role, label } = room;
  const { scheduleSource = defaultSchedule, period: periodOverride, now } = options;

  if (role === "noClick") {
    return { status: "disabled", label: null };
  }

  if (role === "shape") {
    return { status: "shape", label: room.color ? label : label };
  }

  if (role === "fixed") {
    return { status: "fixed", label };
  }

  if (role === "classroom") {
    // 💡 now が渡されればその日時、無ければ現在時刻を基準にする
    const today = getToday(now);
    const period = periodOverride !== undefined ? periodOverride : getCurrentPeriod(now);

    if (period === null) {
      return { status: "free", label: "" };
    }

    const subject = getSubjectAt(id, today, period, scheduleSource);

    return subject ? { status: "using", label: subject.subject || subject } : { status: "free", label: "" };
  }

  return { status: "free", label };
};