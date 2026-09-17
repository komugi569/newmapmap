import defaultSchedule from "../data/schedule.json";
import { getToday, getCurrentPeriod } from "./dateUtils";

/**
 * 指定クラス・曜日・時限の科目名を返す（無ければ null）。
 * scheduleSource を差し替え可能にしておくことで、将来「他クラスの時間割を見る」
 * 機能を追加する際にモックデータや別ソースを渡せるようにしている。
 */
export const getSubjectAt = (classId, day, period, scheduleSource = defaultSchedule) => {
  const classSchedule = scheduleSource[classId];
  if (!classSchedule) return null;

  const daySchedule = classSchedule[day];
  if (!daySchedule) return null;

  if (period === null || period >= daySchedule.length) return null;

  return daySchedule[period] || null;
};

/**
 * 部屋オブジェクトから表示用の状態（色分け用ステータスとサブラベル）を計算する。
 *
 * @param {object} room - rooms.js の1要素
 * @param {object} [options]
 * @param {object} [options.scheduleSource] - schedule.json の代わりに使うデータ（省略時は実際の時間割）
 * @param {number|null} [options.period] - 判定に使う時限（省略時は現在時刻から自動判定）
 */
export const getRoomStatus = (room, options = {}) => {
  const { id, role, label } = room;
  const { scheduleSource = defaultSchedule, period: periodOverride } = options;

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
    const today = getToday();
    const period = periodOverride !== undefined ? periodOverride : getCurrentPeriod();

    if (period === null) {
      return { status: "free", label: "" };
    }

    const subject = getSubjectAt(id, today, period, scheduleSource);

    return subject ? { status: "using", label: subject } : { status: "free", label: "" };
  }

  // fallback
  return { status: "free", label };
};
