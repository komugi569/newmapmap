import { useState, useMemo, useCallback } from "react";
import rooms from "../data/rooms";

const STORAGE_KEY = "myClass";

/**
 * 「自分のクラス」選択状態を localStorage と同期させつつ、
 * 選択肢となるクラス一覧を rooms データから生成するフック。
 *
 * 元の実装は `rooms.filter(r => r.type === "classroom")` だったが、
 * rooms.js の各要素には `type` ではなく `role` フィールドしか存在しないため、
 * classList は常に空配列になり、クラス選択プルダウンの選択肢が
 * 一つも表示されないバグがあった。ここで `role` を参照するよう修正している。
 */
export function useMyClass() {
  const [selectedClass, setSelectedClass] = useState(
    () => localStorage.getItem(STORAGE_KEY) || ""
  );

  const classList = useMemo(
    () =>
      [...new Set(rooms.filter((r) => r.role === "classroom").map((r) => r.id))].sort(),
    []
  );

  const selectClass = useCallback((value) => {
    setSelectedClass(value);
    localStorage.setItem(STORAGE_KEY, value);
  }, []);

  return { selectedClass, classList, selectClass };
}
