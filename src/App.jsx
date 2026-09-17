import { useState } from "react";
import MapContainer from "./components/MapContainer";
import Admin from "./components/Admin";

// もしCSSファイルがあればインポート
import "./styles.css";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="app" style={{ width: "100vw", height: "100vh" }}>
      {/* 画面切り替え用の隠しボタン（開発用） */}
      <button 
        onClick={() => setIsAdmin(!isAdmin)}
        style={{ 
          position: "absolute", 
          bottom: "80px", 
          right: "20px", 
          zIndex: 1000, 
          padding: "10px", 
          background: "#333", 
          color: "#fff", 
          borderRadius: "8px", 
          border: "none",
          cursor: "pointer"
        }}
      >
        {isAdmin ? "🗺️ マップに戻る" : "⚙️ 管理画面へ"}
      </button>

      {/* isAdminがtrueなら管理者画面、falseならマップ画面を表示 */}
      {isAdmin ? <Admin /> : <MapContainer />}
    </div>
  );
}