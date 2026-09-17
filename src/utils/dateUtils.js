import schedule from "../data/schedule.json";
import { periodTimes } from "../data/periodTimes";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** 今日の曜日キー（"Mon"など）を返す */
export const getToday = (date = new Date()) => DAY_NAMES[date.getDay()];

/** 今日の日課タイプ（"default" | "short" など）を返す */
export const getDayType = (day = getToday()) => schedule.types?.[day] || "default";

/**
 * 現在時刻が何限目かを返す（0始まり）。授業時間外なら null。
 * @param {Date} now - 判定基準の時刻（テスト容易性のため引数化）
 */
export const getCurrentPeriod = (now = new Date()) => {
  const day = getToday(now);
  const type = getDayType(day);
  const times = periodTimes[type] || periodTimes.default;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < times.length; i++) {
    const [startH, startM] = times[i].start.split(":").map(Number);
    const [endH, endM] = times[i].end.split(":").map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;

    if (currentMinutes >= start && currentMinutes <= end) {
      return i;
    }
  }

  return null;
};
