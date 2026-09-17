import { useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; // 先ほど作ったfirebase.jsへのパスに合わせてください

const Admin = () => {
  const [className, setClassName] = useState("3-10");
  const [day, setDay] = useState("Mon");
  const [period, setPeriod] = useState(0); // 0 = 1限目
  const [subject, setSubject] = useState("");
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");

  // Firestoreへデータを保存する関数
  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("保存中...");

    try {
      // 1. "schedules" コレクションの中の、選択したクラスのドキュメントを参照
      const docRef = doc(db, "schedules", className);
      const docSnap = await getDoc(docRef);

      // 2. 既存のデータがあれば取得し、なければ空のオブジェクトを用意
      let scheduleData = docSnap.exists() ? docSnap.data() : {};

      // 3. 選択した曜日の配列がなければ作成
      if (!scheduleData[day]) {
        scheduleData[day] = [];
      }

      // 4. 指定した時限（period）のデータを上書き
      scheduleData[day][period] = { subject, roomId };

      // 5. Firestoreに保存
      await setDoc(docRef, scheduleData);
      setMessage(`✅ ${className}の${day} ${period + 1}限目を保存しました！`);
      
      // 入力欄をクリア（連続入力しやすくするため）
      setSubject("");
      setRoomId("");
    } catch (error) {
      console.error("保存エラー:", error);
      setMessage("❌ エラーが発生しました。コンソールを確認してください。");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2>⚙️ 時間割 管理者パネル</h2>
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <div>
          <label>クラス: </label>
          <input value={className} onChange={(e) => setClassName(e.target.value)} required />
        </div>

        <div>
          <label>曜日: </label>
          <select value={day} onChange={(e) => setDay(e.target.value)}>
            <option value="Mon">月曜 (Mon)</option>
            <option value="Tue">火曜 (Tue)</option>
            <option value="Wed">水曜 (Wed)</option>
            <option value="Thu">木曜 (Thu)</option>
            <option value="Fri">金曜 (Fri)</option>
            <option value="Sat">土曜 (Sat)</option>
          </select>
        </div>

        <div>
          <label>時限: </label>
          <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
            {[0, 1, 2, 3, 4, 5].map(p => (
              <option key={p} value={p}>{p + 1}限目</option>
            ))}
          </select>
        </div>

        <div>
          <label>科目名: </label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="例: 体育" required />
        </div>

        <div>
          <label>教室ID: </label>
          <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="例: gym-chugaku" required />
          <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
            ※ rooms.js で定義している id と完全一致させてください
          </div>
        </div>

        <button type="submit" style={{ padding: "10px", background: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          保存する
        </button>
      </form>

      {message && <div style={{ marginTop: "20px", fontWeight: "bold" }}>{message}</div>}
    </div>
  );
};

export default Admin;