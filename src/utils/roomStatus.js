import defaultSchedule from "../data/schedule.json";
import { getToday, getCurrentPeriod } from "./dateUtils";

/**
 * 💡 localStorage から Firebase の最新スケジュールを読み込む関数
 */
const getCloudSchedule = () => {
  try {
    const data = localStorage.getItem("scheduleKey");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("ローカルストレージの読み込みエラー:", e);
    return null;
  }
};

/**
 * 指定クラス・曜日・時限の科目名を返す（無ければ null）。
 */
export const getSubjectAt = (classId, day, period, scheduleSource = defaultSchedule) => {
  // 💡 1. localStorageのクラウドデータと、元のJSONデータを合体（マージ）させる
  const cloudSchedule = getCloudSchedule() || {};
  
  // クラウドデータに該当クラスの情報があればそれを優先、なければローカルJSONを使う
  const classSchedule = cloudSchedule[classId] || scheduleSource[classId];
  
  if (!classSchedule) return null;

  const daySchedule = classSchedule[day];
  if (!daySchedule) return null;

  if (period === null || period >= daySchedule.length) return null;

  return daySchedule[period] || null;
};

/**
 * 部屋オブジェクトから表示用の状態（色分け用ステータスとサブラベル）を計算する。
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

    return subject ? { status: "using", label: subject.subject || subject } : { status: "free", label: "" };
  }

  // fallback
  return { status: "free", label };
};