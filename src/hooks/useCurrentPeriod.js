import { useState, useEffect } from "react";
import { getCurrentPeriod } from "../utils/dateUtils";

/**
 * 現在の時限を返し、1分ごとに再計算するフック。
 *
 * 旧実装は setInterval で setTime(Date.now()) しているだけで、
 * period の計算はレンダー時に一度 getCurrentPeriod() を呼ぶだけだったため、
 * 実際には「1分ごとに再レンダーされるが period 自体は更新されない」状態だった。
 * ここでは period を state として持ち、interval 内で明示的に再計算する。
 */
export function useCurrentPeriod() {
  const [period, setPeriod] = useState(() => getCurrentPeriod());

  useEffect(() => {
    const interval = setInterval(() => {
      setPeriod(getCurrentPeriod());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return period;
}
