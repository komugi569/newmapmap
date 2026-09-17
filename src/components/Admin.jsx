import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import defaultSchedule from "../data/schedule.json"; // 既存のJSONデータを読み込む

const Admin = () => {
  // テキストエリアの初期値として、既存のJSONを表示しておく
  const [jsonText, setJsonText] = useState(JSON.stringify(defaultSchedule, null, 2));
  const [message, setMessage] = useState("");

  const handleSaveAll = async () => {
    setMessage("保存中...（少し時間がかかります）");
    try {
      const parsedData = JSON.parse(jsonText);

      // クラス名（例: "3-10"）ごとにFirestoreへ一括送信
      for (const className of Object.keys(parsedData)) {
        const docRef = doc(db, "schedules", className);
        await setDoc(docRef, parsedData[className]);
      }

      setMessage("✅ 全クラスのスケジュールを一括保存しました！");
    } catch (error) {
      console.error("保存エラー:", error);
      setMessage(`❌ エラー: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>⚙️ 時間割 一括管理パネル</h2>
      <p>JSONデータを編集して「一括保存」を押すだけで、全クラス分がFirebaseに反映されます。</p>
      
      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        style={{ width: "100%", height: "400px", fontFamily: "monospace", padding: "10px" }}
      />
      
      <button 
        onClick={handleSaveAll} 
        style={{ marginTop: "15px", padding: "15px 30px", fontSize: "16px", background: "#007bff", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
      >
        ☁️ Firebaseへ一括保存する
      </button>

      {message && <div style={{ marginTop: "20px", fontWeight: "bold", color: message.includes("❌") ? "red" : "green" }}>{message}</div>}
    </div>
  );
};

export default Admin;