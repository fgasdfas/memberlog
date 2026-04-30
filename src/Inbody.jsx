import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const firebaseConfig = {
  apiKey: "AIzaSyDCi3r64GAu7su1p51w4gOeuXzjLmxPPGc",
  authDomain: "memberlog.firebaseapp.com",
  projectId: "memberlog",
  storageBucket: "memberlog.firebasestorage.app",
  messagingSenderId: "201042649873",
  appId: "1:201042649873:web:dcfc4652904d1cbf6ae2b0",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const font = "'Noto Sans KR', sans-serif";

const iStyle = {
  width: "100%", background: "#151821", border: "1px solid #2A2D3E",
  borderRadius: 10, padding: "12px 14px", color: "#E8E8E8",
  fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: font,
  WebkitAppearance: "none", textAlign: "center",
};

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
};

const formatDateShort = (date) => {
  const d = new Date(date);
  return `${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "#151821", border: "1px solid #2A2D3E", borderRadius: 10, padding: "10px 14px", fontSize: 12, fontFamily: font }}>
      <p style={{ color: "#888", marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 700, marginBottom: 2 }}>
          {p.name}: {p.value}{p.dataKey === "fat" ? "%" : "kg"}
        </p>
      ))}
    </div>
  );
};

export default function Inbody() {
  const { memberId } = useParams();
  const [member, setMember] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [tab, setTab] = useState("input"); // "input" | "graph" | "survey"
  const [showSurveyDetail, setShowSurveyDetail] = useState(false);

  const [form, setForm] = useState({
    date: today(),
    weight: "", muscle: "", fat: "", fatmass: "",
    condition: "",
  });

  useEffect(() => {
    // 회원 ID를 localStorage에 저장 (위젯용)
    if (memberId && memberId !== "new") {
      localStorage.setItem("inbodyMemberId", memberId);
    }
    getDoc(doc(db, "members", memberId)).then(snap => {
      if (snap.exists()) setMember({ id: snap.id, ...snap.data() });
      setLoading(false);
    }).catch(() => setLoading(false));
    // 설문 데이터 같이 로드
    getDoc(doc(db, "surveys", memberId)).then(snap => {
      if (snap.exists()) setSurvey({ id: snap.id, ...snap.data() });
    }).catch(() => {});
  }, [memberId]);

  const [editingIdx, setEditingIdx] = useState(null);
  const [editForm, setEditForm] = useState({ date: "", weight: "", muscle: "", fat: "", fatmass: "", condition: "" });

  const handleEditStart = (d, idx) => {
    setEditingIdx(idx);
    setEditForm({
      date: d.date,
      weight: d.weight ?? "",
      muscle: d.muscle ?? "",
      fat: d.fat ?? "",
      fatmass: d.fatmass ?? "",
      condition: d.condition ?? "",
    });
  };

  const handleEditSave = async () => {
    const updated = [...inbodyData];
    const realIdx = inbodyData.length - 1 - editingIdx;
    updated[realIdx] = {
      date: editForm.date,
      weight: parseFloat(editForm.weight) || null,
      muscle: parseFloat(editForm.muscle) || null,
      fat: parseFloat(editForm.fat) || null,
      fatmass: parseFloat(editForm.fatmass) || null,
      condition: editForm.condition || null,
    };
    const sorted = updated.sort((a, b) => a.date.localeCompare(b.date));
    await updateDoc(doc(db, "members", memberId), { inbody: sorted });
    setMember(prev => ({ ...prev, inbody: sorted }));
    setEditingIdx(null);
  };

  const handleDelete = async (idx) => {
    if (!window.confirm("이 기록을 삭제할까요?")) return;
    const realIdx = inbodyData.length - 1 - idx;
    const updated = inbodyData.filter((_, i) => i !== realIdx);
    await updateDoc(doc(db, "members", memberId), { inbody: updated });
    setMember(prev => ({ ...prev, inbody: updated }));
  };

  const isValid = form.weight.trim() !== "";

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const newEntry = {
        date: form.date,
        weight: parseFloat(form.weight) || null,
        muscle: parseFloat(form.muscle) || null,
        fat: parseFloat(form.fat) || null,
        fatmass: parseFloat(form.fatmass) || null,
        condition: form.condition || null,
        updatedAt: new Date().toISOString(),
      };
      const updatedInbody = [...(member.inbody || []), newEntry]
        .sort((a, b) => a.date.localeCompare(b.date));
      await updateDoc(doc(db, "members", memberId), { inbody: updatedInbody });
      setMember(prev => ({ ...prev, inbody: updatedInbody }));
      setDone(true);
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0F1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet" />
      <div style={{ width: 32, height: 32, border: "3px solid #2A2D3E", borderTop: "3px solid #4ECDC4", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!member) return (
    <div style={{ minHeight: "100vh", background: "#0F1117", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <p style={{ color: "#888", fontFamily: font }}>유효하지 않은 링크입니다.</p>
    </div>
  );

  const conditionMap = { "😴": 1, "😐": 2, "🙂": 3, "😊": 4, "💪": 5 };
  const conditionLabel = { 1: "😴", 2: "😐", 3: "🙂", 4: "😊", 5: "💪" };

  const inbodyData = [...(member.inbody || [])].sort((a, b) => a.date.localeCompare(b.date));
  const latest = inbodyData.length > 0 ? inbodyData[inbodyData.length - 1] : null;
  const first = inbodyData.length > 1 ? inbodyData[0] : null;
  const chartData = [...inbodyData].sort((a, b) => a.date.localeCompare(b.date)).map(d => ({
    date: formatDateShort(d.date),
    체중: d.weight ? Number(d.weight) : null,
    골격근량: d.muscle ? Number(d.muscle) : null,
    체지방률: d.fat ? Number(d.fat) : null,
    체지방량: d.fatmass ? Number(d.fatmass) : null,
    컨디션: d.condition ? conditionMap[d.condition] : null,
    컨디션이모지: d.condition || null,
  }));

  return (
    <div style={{ minHeight: "100vh", background: "#0F1117", color: "#E8E8E8", fontFamily: font }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none} *{-webkit-tap-highlight-color:transparent}`}</style>

      <header style={{ background: "#0F1117", borderBottom: "1px solid #1E2030", padding: "16px 20px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: "#4ECDC4", letterSpacing: 4 }}>FORMA</span>
        </div>
      </header>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* 회원 정보 카드 */}
        <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: "16px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#4ECDC422", border: "2px solid #4ECDC4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              📊
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: "0 0 2px" }}>{member.name}님</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#888" }}>인바디 관리</p>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display: "grid", gridTemplateColumns: survey ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8, marginBottom: 24 }}>
          {[
            { key: "input", label: "📝 기록 입력" },
            { key: "graph", label: "📈 변화 그래프" },
            ...(survey ? [{ key: "survey", label: "📋 내 설문지" }] : []),
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: "12px", borderRadius: 12, border: "1px solid", fontFamily: font, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                background: tab === t.key ? "#4ECDC4" : "#151821",
                color: tab === t.key ? "#0F1117" : "#888",
                borderColor: tab === t.key ? "#4ECDC4" : "#2A2D3E",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* 기록 입력 탭 */}
        {tab === "input" && (
          done ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>인바디 기록 완료!</h2>
              <p style={{ color: "#888", fontSize: 14, lineHeight: 1.8 }}>
                {member.name}님의 인바디가 기록됐어요.<br />
                트레이너가 확인할 예정이에요 😊
              </p>
              <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: "20px", marginTop: 24, textAlign: "left" }}>
                <p style={{ fontSize: 13, color: "#888", margin: "0 0 14px" }}>📅 {formatDate(form.date)} 기록</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { label: "체중", value: form.weight, unit: "kg", color: "#4ECDC4" },
                    { label: "골격근량", value: form.muscle, unit: "kg", color: "#6BCB77" },
                    { label: "체지방률", value: form.fat, unit: "%", color: "#FF6B6B" },
                    { label: "체지방량", value: form.fatmass, unit: "kg", color: "#FFA500" },
                  ].map(({ label, value, unit, color }) => (
                    <div key={label} style={{ background: "#0F1117", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: value ? color : "#333" }}>
                        {value ? `${value}${unit}` : "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => { setDone(false); setForm({ date: today(), weight: "", muscle: "", fat: "", fatmass: "", condition: "" }); setTab("graph"); }}
                style={{ marginTop: 20, background: "#151821", border: "1px solid #2A2D3E", borderRadius: 12, padding: "12px 24px", color: "#888", fontFamily: font, fontSize: 14, cursor: "pointer" }}>
                📈 그래프 보기
              </button>
            </div>
          ) : (
            <div>
              {/* 측정일 */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 8 }}>측정일</span>
                <input type="date" value={form.date} max={today()} onChange={e => setForm({ ...form, date: e.target.value })}
                  onClick={e => { try { e.currentTarget.showPicker?.(); } catch (err) {} }}
                  style={{ ...iStyle, colorScheme: "dark", textAlign: "left", padding: "18px 14px", fontSize: 16, cursor: "pointer", width: "100%" }} />
              </div>

              {/* 인바디 수치 입력 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
                {[
                  { key: "weight", label: "체중", unit: "kg", color: "#4ECDC4", required: true, placeholder: "00.0" },
                  { key: "muscle", label: "골격근량", unit: "kg", color: "#6BCB77", required: false, placeholder: "00.0" },
                  { key: "fat", label: "체지방률", unit: "%", color: "#FF6B6B", required: false, placeholder: "00.0" },
                  { key: "fatmass", label: "체지방량", unit: "kg", color: "#FFA500", required: false, placeholder: "00.0" },
                ].map(({ key, label, unit, color, required, placeholder }) => (
                  <div key={key} style={{ background: "#151821", border: "1px solid " + (form[key] ? color + "44" : "#2A2D3E"), borderRadius: 14, padding: "16px 14px", transition: "border-color 0.2s" }}>
                    <div style={{ fontSize: 12, color: color, fontWeight: 700, marginBottom: 10 }}>
                      {label} {required && <span style={{ color: "#FF6B6B" }}>*</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <input
                        type="number" step="0.1" inputMode="decimal"
                        value={form[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        placeholder={placeholder}
                        style={{ ...iStyle, background: "transparent", border: "none", padding: "0", fontSize: 28, fontWeight: 700, color: form[key] ? color : "#333", width: "100%", textAlign: "left" }}
                      />
                      <span style={{ fontSize: 14, color: "#555", flexShrink: 0 }}>{unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 컨디션 */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 10 }}>오늘 컨디션</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["😴", "😐", "🙂", "😊", "💪"].map(e => (
                    <button key={e} type="button" onClick={() => setForm({ ...form, condition: form.condition === e ? "" : e })}
                      style={{ flex: 1, padding: "12px 0", fontSize: 24, borderRadius: 12, border: "2px solid " + (form.condition === e ? "#4ECDC4" : "#2A2D3E"), background: form.condition === e ? "#4ECDC422" : "#151821", cursor: "pointer", transition: "all 0.15s" }}>
                      {e}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "#444" }}>
                  <span>최악</span><span>최고</span>
                </div>
              </div>

              {/* 이전 기록 */}
              {latest && (
                <div style={{ background: "#0F1117", border: "1px solid #1E2133", borderRadius: 12, padding: "14px 16px", marginBottom: 24 }}>
                  <p style={{ fontSize: 12, color: "#555", margin: "0 0 10px" }}>📅 이전 기록 ({formatDate(latest.date)})</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                    {[
                      { label: "체중", value: latest.weight, unit: "kg", color: "#4ECDC4" },
                      { label: "골격근량", value: latest.muscle, unit: "kg", color: "#6BCB77" },
                      { label: "체지방률", value: latest.fat, unit: "%", color: "#FF6B6B" },
                      { label: "체지방량", value: latest.fatmass, unit: "kg", color: "#FFA500" },
                    ].map(({ label, value, unit, color }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#555", marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: value ? color : "#333" }}>
                          {value ?? "-"}
                        </div>
                        <div style={{ fontSize: 10, color: "#555" }}>{unit}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={handleSubmit} disabled={!isValid || submitting}
                style={{ width: "100%", background: isValid && !submitting ? "#4ECDC4" : "#2A2D3E", color: isValid && !submitting ? "#0F1117" : "#555", border: "none", borderRadius: 14, padding: "18px", fontWeight: 900, fontSize: 17, cursor: isValid && !submitting ? "pointer" : "not-allowed", fontFamily: font, transition: "all 0.2s" }}>
                {submitting ? "저장 중..." : "📊 인바디 기록 저장"}
              </button>
              {!isValid && <p style={{ textAlign: "center", fontSize: 12, color: "#555", marginTop: 8 }}>체중은 필수 입력이에요</p>}
            </div>
          )
        )}

        {/* 그래프 탭 */}
        {tab === "graph" && (
          <div>
            {inbodyData.length < 2 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                <p style={{ color: "#888", fontSize: 14, lineHeight: 1.8 }}>
                  기록이 2개 이상이어야<br />그래프가 표시돼요 😊
                </p>
              </div>
            ) : (
              <div>
                {/* 최신 수치 */}
                {latest && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                    {[
                      { label: "체중", value: latest.weight, unit: "kg", color: "#4ECDC4", first: first?.weight },
                      { label: "골격근량", value: latest.muscle, unit: "kg", color: "#6BCB77", first: first?.muscle },
                      { label: "체지방률", value: latest.fat, unit: "%", color: "#FF6B6B", first: first?.fat },
                      { label: "체지방량", value: latest.fatmass, unit: "kg", color: "#FFA500", first: first?.fatmass },
                    ].map(({ label, value, unit, color, first: firstVal }) => {
                      const diff = value && firstVal ? (value - firstVal).toFixed(1) : null;
                      const isGood = label === "체중" || label === "체지방률" || label === "체지방량"
                        ? diff < 0 : diff > 0;
                      return (
                        <div key={label} style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 12, padding: "14px" }}>
                          <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>{label}</div>
                          <div style={{ fontSize: 22, fontWeight: 900, color: value ? color : "#333" }}>
                            {value ?? "-"}<span style={{ fontSize: 12, color: "#555", marginLeft: 2 }}>{unit}</span>
                          </div>
                          {diff !== null && (
                            <div style={{ fontSize: 11, marginTop: 4, fontWeight: 700, color: isGood ? "#6BCB77" : "#FF6B6B" }}>
                              {diff > 0 ? "▲" : "▼"} {Math.abs(diff)}{unit}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 체중 그래프 */}
                <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 14, padding: "16px", marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ fontSize: 12, color: "#4ECDC4", fontWeight: 700 }}>⚖️ 체중 변화</p>
                    {inbodyData.length > 0 && inbodyData[inbodyData.length - 1].weight !== null && inbodyData[inbodyData.length - 1].weight !== undefined && (
                      <div style={{ background: "#0F1117", border: "1px solid #4ECDC444", borderRadius: 8, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 10, color: "#888" }}>최신</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#4ECDC4" }}>{inbodyData[inbodyData.length - 1].weight}</span>
                        <span style={{ fontSize: 10, color: "#888" }}>kg</span>
                      </div>
                    )}
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#555" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#555" }} domain={["auto", "auto"]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="체중" stroke="#4ECDC4" strokeWidth={2} dot={{ r: 4, fill: "#4ECDC4" }} name="체중" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* 골격근량 + 체지방률 그래프 */}
                <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 14, padding: "16px", marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 6 }}>
                    <p style={{ fontSize: 12, color: "#6BCB77", fontWeight: 700 }}>💪 골격근량 · 체지방률 변화</p>
                    {inbodyData.length > 0 && (
                      <div style={{ display: "flex", gap: 6 }}>
                        {inbodyData[inbodyData.length - 1].muscle !== null && inbodyData[inbodyData.length - 1].muscle !== undefined && (
                          <div style={{ background: "#0F1117", border: "1px solid #6BCB7744", borderRadius: 8, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: "#6BCB77" }}>{inbodyData[inbodyData.length - 1].muscle}</span>
                            <span style={{ fontSize: 9, color: "#888" }}>kg</span>
                          </div>
                        )}
                        {inbodyData[inbodyData.length - 1].fat !== null && inbodyData[inbodyData.length - 1].fat !== undefined && (
                          <div style={{ background: "#0F1117", border: "1px solid #FF6B6B44", borderRadius: 8, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: "#FF6B6B" }}>{inbodyData[inbodyData.length - 1].fat}</span>
                            <span style={{ fontSize: 9, color: "#888" }}>%</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#555" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#555" }} domain={["auto", "auto"]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "#888" }} />
                      <Line type="monotone" dataKey="골격근량" stroke="#6BCB77" strokeWidth={2} dot={{ r: 4, fill: "#6BCB77" }} name="골격근량" />
                      <Line type="monotone" dataKey="체지방률" stroke="#FF6B6B" strokeWidth={2} dot={{ r: 4, fill: "#FF6B6B" }} strokeDasharray="4 4" name="체지방률" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* 컨디션 그래프 */}
                {chartData.some(d => d.컨디션) && (
                  <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 14, padding: "16px", marginBottom: 14 }}>
                    <p style={{ fontSize: 12, color: "#F9CA24", fontWeight: 700, marginBottom: 14 }}>🌟 컨디션 변화</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#555" }} />
                        <YAxis tick={{ fontSize: 10, fill: "#555" }} domain={[0, 6]} ticks={[1,2,3,4,5]}
                          tickFormatter={v => ["","😴","😐","🙂","😊","💪"][v] || ""} />
                        <Tooltip content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          if (!d.컨디션이모지) return null;
                          return (
                            <div style={{ background: "#1A1D27", border: "1px solid #2A2D3E", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
                              <div style={{ color: "#888", marginBottom: 4 }}>{d.date}</div>
                              <div style={{ fontSize: 22 }}>{d.컨디션이모지}</div>
                            </div>
                          );
                        }} />
                        <Line type="monotone" dataKey="컨디션" stroke="#F9CA24" strokeWidth={2}
                          dot={{ r: 5, fill: "#F9CA24", stroke: "#F9CA24" }}
                          activeDot={{ r: 7 }}
                          connectNulls={false}
                          name="컨디션" />
                      </LineChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0 8px", fontSize: 11, color: "#555" }}>
                      <span>😴</span><span>😐</span><span>🙂</span><span>😊</span><span>💪</span>
                    </div>
                  </div>
                )}

                {/* 기록 히스토리 */}
                <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 14, padding: "16px" }}>
                  <p style={{ fontSize: 12, color: "#888", fontWeight: 700, marginBottom: 12 }}>📅 전체 기록</p>
                  {[...inbodyData].reverse().map((d, i) => (
                    <div key={i} style={{ padding: "12px 0", borderBottom: i < inbodyData.length - 1 ? "1px solid #1E2133" : "none" }}>
                      {editingIdx === i ? (
                        // 수정 모드
                        <div>
                          <div style={{ marginBottom: 10 }}>
                            <input type="date" value={editForm.date} max={today()}
                              onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                              style={{ ...iStyle, fontSize: 13, padding: "8px 12px", colorScheme: "dark", textAlign: "left" }} />
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                            {[
                              { key: "weight", label: "체중", unit: "kg", color: "#4ECDC4" },
                              { key: "muscle", label: "골격근량", unit: "kg", color: "#6BCB77" },
                              { key: "fat", label: "체지방률", unit: "%", color: "#FF6B6B" },
                              { key: "fatmass", label: "체지방량", unit: "kg", color: "#FFA500" },
                            ].map(({ key, label, unit, color }) => (
                              <div key={key} style={{ background: "#0F1117", borderRadius: 10, padding: "10px 12px", border: "1px solid " + color + "33" }}>
                                <div style={{ fontSize: 10, color: color, fontWeight: 700, marginBottom: 4 }}>{label}</div>
                                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                                  <input type="number" step="0.1" inputMode="decimal"
                                    value={editForm[key]}
                                    onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                                    style={{ background: "transparent", border: "none", outline: "none", color: color, fontSize: 18, fontWeight: 700, fontFamily: font, width: "100%" }} />
                                  <span style={{ fontSize: 11, color: "#555" }}>{unit}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>컨디션</div>
                            <div style={{ display: "flex", gap: 6 }}>
                              {["😴", "😐", "🙂", "😊", "💪"].map(e => (
                                <button key={e} type="button" onClick={() => setEditForm({ ...editForm, condition: editForm.condition === e ? "" : e })}
                                  style={{ flex: 1, padding: "8px 0", fontSize: 20, borderRadius: 10, border: "2px solid " + (editForm.condition === e ? "#4ECDC4" : "#2A2D3E"), background: editForm.condition === e ? "#4ECDC422" : "#0F1117", cursor: "pointer" }}>
                                  {e}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <button onClick={() => setEditingIdx(null)}
                              style={{ padding: "10px", background: "#0F1117", border: "1px solid #2A2D3E", borderRadius: 10, color: "#888", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                              취소
                            </button>
                            <button onClick={handleEditSave}
                              style={{ padding: "10px", background: "#4ECDC4", border: "none", borderRadius: 10, color: "#0F1117", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                              저장
                            </button>
                          </div>
                        </div>
                      ) : (
                        // 일반 모드
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                              <div style={{ fontSize: 11, color: "#555" }}>{formatDate(d.date)}</div>
                              {d.condition && <div style={{ fontSize: 18 }}>{d.condition}</div>}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4 }}>
                              {[
                                { value: d.weight, unit: "kg", color: "#4ECDC4" },
                                { value: d.muscle, unit: "kg", color: "#6BCB77" },
                                { value: d.fat, unit: "%", color: "#FF6B6B" },
                                { value: d.fatmass, unit: "kg", color: "#FFA500" },
                              ].map(({ value, unit, color }, j) => (
                                <div key={j} style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: value ? color : "#333" }}>{value ?? "-"}</div>
                                  <div style={{ fontSize: 9, color: "#555" }}>{unit}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <button onClick={() => handleEditStart(d, i)}
                              style={{ padding: "5px 10px", background: "#1E2133", border: "none", borderRadius: 6, color: "#888", fontSize: 11, cursor: "pointer", fontFamily: font }}>
                              수정
                            </button>
                            <button onClick={() => handleDelete(i)}
                              style={{ padding: "5px 10px", background: "#FF6B6B18", border: "none", borderRadius: 6, color: "#FF6B6B", fontSize: 11, cursor: "pointer", fontFamily: font }}>
                              삭제
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 내 설문지 탭 (읽기 전용) */}
        {tab === "survey" && survey && (
          <div>
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 14, padding: 18, marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>제출일</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#4ECDC4" }}>
                {survey.submittedAt?.toDate ? survey.submittedAt.toDate().toLocaleDateString("ko-KR") : "-"}
              </div>
            </div>

            {/* PT 정보 */}
            {survey.pt && (
              <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 14, padding: 18, marginBottom: 14 }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 14, color: "#4ECDC4", fontWeight: 700 }}>📝 기본 정보</h3>
                {[
                  { label: "이름", value: survey.pt.name },
                  { label: "연령대", value: survey.pt.age },
                  { label: "성별", value: survey.pt.gender },
                  { label: "연락처", value: survey.pt.phone },
                  { label: "운동 목적", value: (survey.pt.purpose || []).join(", ") },
                  { label: "선호 시간", value: (survey.pt.timeSlot || []).join(", ") },
                  { label: "건강 상태", value: survey.pt.healthDetail },
                  { label: "복용약", value: survey.pt.medication },
                ].filter(r => r.value).map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133", fontSize: 13 }}>
                    <span style={{ color: "#888" }}>{r.label}</span>
                    <span style={{ color: "#E8E8E8", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{r.value}</span>
                  </div>
                ))}
                {survey.pt.painZones?.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>통증·불편한 부위</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(survey.pt.painZones || []).map((z, i) => {
                        const label = typeof z === "string" ? z : (z?.label || "");
                        if (!label) return null;
                        return <span key={i} style={{ padding: "4px 10px", background: "#FF6B6B22", color: "#FF6B6B", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{label}</span>;
                      })}
                    </div>
                  </div>
                )}
                {survey.noPain && <div style={{ marginTop: 10, fontSize: 13, color: "#4ECDC4" }}>✅ 통증 없음</div>}
              </div>
            )}

            {/* PAR-Q */}
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 14, padding: 18, marginBottom: 14 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 14, color: "#4ECDC4", fontWeight: 700 }}>🩺 PAR-Q 신체활동 사전 설문</h3>
              <div style={{ fontSize: 12, color: survey.parqHasYes ? "#FF6B6B" : "#4ECDC4", marginBottom: 12, fontWeight: 600 }}>
                {survey.parqHasYes ? "⚠️ '예' 응답이 있어 추가 확인 필요" : "✅ 모든 항목 '아니오'"}
              </div>
            </div>

            {/* 동의·서명 */}
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 14, padding: 18, marginBottom: 14 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 14, color: "#4ECDC4", fontWeight: 700 }}>✍️ 동의 및 서명</h3>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13 }}>
                <span style={{ color: "#888" }}>개인정보 수집·이용</span>
                <span style={{ color: survey.privacyAgree1 ? "#4ECDC4" : "#888" }}>{survey.privacyAgree1 ? "✓ 동의" : "미동의"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13 }}>
                <span style={{ color: "#888" }}>민감정보 수집·이용</span>
                <span style={{ color: survey.privacyAgree2 ? "#4ECDC4" : "#888" }}>{survey.privacyAgree2 ? "✓ 동의" : "미동의"}</span>
              </div>
              {survey.signature && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>서명</div>
                  <div style={{ background: "#fff", borderRadius: 8, padding: 10 }}>
                    <img src={survey.signature} alt="서명" style={{ width: "100%", display: "block" }} />
                  </div>
                </div>
              )}
            </div>

            <p style={{ fontSize: 11, color: "#555", textAlign: "center", margin: "14px 0", lineHeight: 1.6 }}>
              제출하신 설문 내용은 읽기 전용입니다.<br/>
              수정이 필요하시면 트레이너에게 요청해주세요.
            </p>

            {/* 상세보기 / 원본 버튼 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
              <button onClick={() => setShowSurveyDetail(!showSurveyDetail)}
                style={{ background: "#151821", border: "1px solid #2A2D3E", borderRadius: 10, padding: "11px", color: "#888", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                {showSurveyDetail ? "접기 ▲" : "상세 내용 보기 ▼"}
              </button>
              <button onClick={() => window.open(`${window.location.origin}/#/survey-view/${memberId}`, "_blank")}
                style={{ background: "#151821", border: "1px solid #4ECDC4", borderRadius: 10, padding: "11px", color: "#4ECDC4", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                📄 원본
              </button>
            </div>

            {/* 상세 내용 (펼치기) */}
            {showSurveyDetail && (
              <div style={{ marginTop: 14, background: "#151821", border: "1px solid #1E2133", borderRadius: 14, padding: 18 }}>
                {survey.pt && (
                  <>
                    <div style={{ fontSize: 12, color: "#4ECDC4", fontWeight: 700, marginBottom: 12, letterSpacing: 0.8 }}>📋 PT 설문 상세</div>
                    {survey.pt.height && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133", fontSize: 13 }}><span style={{ color: "#888" }}>키</span><span style={{ color: "#E8E8E8" }}>{survey.pt.height} cm</span></div>}
                    {survey.pt.weight && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133", fontSize: 13 }}><span style={{ color: "#888" }}>체중</span><span style={{ color: "#E8E8E8" }}>{survey.pt.weight} kg</span></div>}
                    {survey.pt.exerciseExperience && <div style={{ padding: "8px 0", borderBottom: "1px solid #1E2133" }}><div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>운동 경험</div><div style={{ fontSize: 13, color: "#E8E8E8", lineHeight: 1.6 }}>{survey.pt.exerciseExperience}</div></div>}
                    {survey.pt.healthDetail && <div style={{ padding: "8px 0", borderBottom: "1px solid #1E2133" }}><div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>건강 상세</div><div style={{ fontSize: 13, color: "#E8E8E8", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{survey.pt.healthDetail}</div></div>}
                    {survey.pt.injury && <div style={{ padding: "8px 0", borderBottom: "1px solid #1E2133" }}><div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>부상 이력</div><div style={{ fontSize: 13, color: "#E8E8E8", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{survey.pt.injury}</div></div>}
                    {survey.pt.surgery && <div style={{ padding: "8px 0", borderBottom: "1px solid #1E2133" }}><div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>수술 이력</div><div style={{ fontSize: 13, color: "#E8E8E8", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{survey.pt.surgery}</div></div>}
                    {survey.pt.note && <div style={{ padding: "8px 0", borderBottom: "1px solid #1E2133" }}><div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>기타 메모</div><div style={{ fontSize: 13, color: "#E8E8E8", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{survey.pt.note}</div></div>}
                  </>
                )}
                {survey.parqAnswers && (
                  <>
                    <div style={{ fontSize: 12, color: "#4ECDC4", fontWeight: 700, margin: "16px 0 12px", letterSpacing: 0.8 }}>🩺 PAR-Q 응답</div>
                    {survey.parqAnswers.map((a, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133", fontSize: 12 }}>
                        <span style={{ color: "#888", maxWidth: "70%" }}>Q{i + 1}</span>
                        <span style={{ color: a === true ? "#FF6B6B" : "#4ECDC4", fontWeight: 700 }}>{a === true ? "예" : a === false ? "아니오" : "-"}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
