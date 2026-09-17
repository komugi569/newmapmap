import { useState, useEffect } from "react";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import defaultSchedule from "../data/schedule.json";

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const RESERVED_KEYS = ["types"];

// 💡 これでどうだ？？
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.warn("⚠️ VITE_ADMIN_PASSWORD が設定されていません");
}

const getSubjectText = (entry) => {
  if (entry == null) return "";
  return typeof entry === "string" ? entry : entry.subject || "";
};

const inputStyle = {
  width: "70px",
  padding: "6px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  textAlign: "center",
  backgroundColor: "#fff",
  color: "#222",
};

// 💡 パスワード入力画面
function PasswordGate({ onSuccess }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem("adminAuthed", "true");
      onSuccess();
    } else {
      setError("パスワードが違います");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#fff",
        color: "#222",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form onSubmit={handleSubmit} style={{ textAlign: "center" }}>
        <h3 style={{ marginBottom: "16px" }}>🔒 管理者パスワード</h3>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          style={{
            padding: "10px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            backgroundColor: "#fff",
            color: "#222",
            marginRight: "8px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          入る
        </button>
        {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
      </form>
    </div>
  );
}

const Admin = () => {
  // 💡 このブラウザのタブで既に認証済みかチェック
  const [isAuthed, setIsAuthed] = useState(
    () => sessionStorage.getItem("adminAuthed") === "true"
  );

  const [schedules, setSchedules] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [openClass, setOpenClass] = useState(null);
  const [savingClass, setSavingClass] = useState(null);
  const [message, setMessage] = useState("");
  const [newClassName, setNewClassName] = useState("");

  useEffect(() => {
    if (!isAuthed) return; // 💡 認証前はFirestoreを読みに行かない

    const fetchCurrentSchedule = async () => {
      try {
        const snapshot = await getDocs(collection(db, "schedules"));
        if (snapshot.empty) {
          setSchedules(defaultSchedule);
        } else {
          const data = {};
          snapshot.forEach((docSnap) => {
            data[docSnap.id] = docSnap.data();
          });
          setSchedules(data);
        }
      } catch (error) {
        console.error("読み込みエラー:", error);
        setMessage(`❌ 読み込みエラー: ${error.message}`);
        setSchedules(defaultSchedule);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCurrentSchedule();
  }, [isAuthed]);

  const updatePeriod = (className, day, periodIndex, value) => {
    setSchedules((prev) => {
      const classSchedule = { ...(prev[className] || {}) };
      const dayPeriods = [...(classSchedule[day] || [])];
      dayPeriods[periodIndex] = value;
      classSchedule[day] = dayPeriods;
      return { ...prev, [className]: classSchedule };
    });
  };

  const addPeriod = (className, day) => {
    setSchedules((prev) => {
      const classSchedule = { ...(prev[className] || {}) };
      const dayPeriods = [...(classSchedule[day] || []), ""];
      classSchedule[day] = dayPeriods;
      return { ...prev, [className]: classSchedule };
    });
  };

  const addClass = () => {
    const name = newClassName.trim();
    if (!name || schedules[name]) return;
    setSchedules((prev) => ({
      ...prev,
      [name]: Object.fromEntries(DAY_ORDER.map((d) => [d, []])),
    }));
    setNewClassName("");
    setOpenClass(name);
  };

  const handleSaveClass = async (className) => {
    setSavingClass(className);
    setMessage("");
    try {
      const docRef = doc(db, "schedules", className);
      await setDoc(docRef, schedules[className]);
      setMessage(`✅ ${className} を保存しました！`);
    } catch (error) {
      console.error("保存エラー:", error);
      setMessage(`❌ ${className} の保存エラー: ${error.message}`);
    } finally {
      setSavingClass(null);
    }
  };

  // 💡 未認証ならパスワード画面だけ表示
  if (!isAuthed) {
    return <PasswordGate onSuccess={() => setIsAuthed(true)} />;
  }

  if (isLoading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#666", backgroundColor: "#fff", minHeight: "100vh" }}>
        読み込み中...
      </div>
    );
  }

  const classNames = Object.keys(schedules)
    .filter((key) => !RESERVED_KEYS.includes(key))
    .sort();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        backgroundColor: "#fff",
        color: "#222",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ color: "#222" }}>⚙️ 時間割 管理パネル</h2>
        <p style={{ color: "#666" }}>クラスごとに開いて編集し、「保存」を押すとそのクラスだけFirebaseに反映されます。</p>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <input
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="新しいクラス名（例: 3-10）"
            style={{ flex: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "6px", backgroundColor: "#fff", color: "#222" }}
          />
          <button
            onClick={addClass}
            style={{ padding: "8px 16px", background: "#28a745", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            ＋ クラス追加
          </button>
        </div>

        {classNames.map((className) => {
          const isOpen = openClass === className;
          const classSchedule = schedules[className];

          return (
            <div
              key={className}
              style={{ border: "1px solid #ddd", borderRadius: "8px", marginBottom: "10px", overflow: "hidden", backgroundColor: "#fff" }}
            >
              <button
                onClick={() => setOpenClass(isOpen ? null : className)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "14px 16px",
                  background: "#f5f5f5",
                  color: "#222",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{className}</span>
                <span>{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div style={{ padding: "16px", backgroundColor: "#fff", color: "#222" }}>
                  {DAY_ORDER.map((day) => {
                    const periods = classSchedule[day] || [];
                    return (
                      <div key={day} style={{ marginBottom: "14px" }}>
                        <div style={{ fontWeight: "bold", marginBottom: "6px", color: "#222" }}>{day}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                          {periods.map((entry, periodIndex) => (
                            <div key={periodIndex} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                              <span style={{ fontSize: "12px", color: "#999" }}>{periodIndex + 1}限</span>
                              <input
                                value={getSubjectText(entry)}
                                onChange={(e) => updatePeriod(className, day, periodIndex, e.target.value)}
                                style={inputStyle}
                              />
                            </div>
                          ))}
                          <button
                            onClick={() => addPeriod(className, day)}
                            style={{ padding: "6px 10px", background: "#eee", color: "#222", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer", alignSelf: "flex-end" }}
                          >
                            ＋時限
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={() => handleSaveClass(className)}
                    disabled={savingClass === className}
                    style={{
                      marginTop: "10px",
                      padding: "10px 24px",
                      fontSize: "15px",
                      background: savingClass === className ? "#aaa" : "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: savingClass === className ? "default" : "pointer",
                    }}
                  >
                    {savingClass === className ? "保存中..." : `☁️ ${className} を保存`}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {message && (
          <div style={{ marginTop: "20px", marginBottom: "40px", fontWeight: "bold", color: message.includes("❌") ? "red" : "green" }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;