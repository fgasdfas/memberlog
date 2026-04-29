import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

const fmt = (d) => {
  if (!d) return "-";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt)) return "-";
  return `${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
};

const fmtFull = (d) => {
  const dt = d ? new Date(d) : new Date();
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
};

const weeksBetween = (a, b) => {
  if (!a || !b) return null;
  const diff = (new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24 * 7);
  return Math.max(1, Math.round(diff));
};

const num = (v) => (v === null || v === undefined || v === "" ? null : Number(v));

const delta = (first, last) => {
  if (first === null || last === null) return null;
  return Math.round((last - first) * 10) / 10;
};

const generateComment = (member, inbody, period) => {
  if (!inbody || inbody.length < 2) {
    return `${member.name || "회원"}님과 함께한 시간 동안 꾸준히 운동에 임해주셨습니다. 앞으로의 변화도 기대됩니다. 다음 사이클에서는 측정 빈도를 늘려 더 정밀한 변화 추적을 함께 해보시면 좋겠습니다.`;
  }
  const first = inbody[0];
  const last = inbody[inbody.length - 1];
  const dWeight = delta(num(first.weight), num(last.weight));
  const dMuscle = delta(num(first.muscle), num(last.muscle));
  const dFat = delta(num(first.fat), num(last.fat));

  const parts = [];
  if (period) parts.push(`${period}주간`);
  parts.push(`${member.name || "회원"}님과 함께한 변화를 정리해드립니다.`);

  const highlights = [];
  if (dFat !== null && dFat < -2) highlights.push(`체지방률을 ${Math.abs(dFat)}%p 감량`);
  if (dMuscle !== null && dMuscle > 0.5) highlights.push(`골격근량을 ${Math.abs(dMuscle)}kg 증가`);
  if (dWeight !== null && dWeight < -2) highlights.push(`체중 ${Math.abs(dWeight)}kg 감량`);
  if (dWeight !== null && dWeight > 1 && dMuscle !== null && dMuscle > 0.5) highlights.push(`근육 위주의 건강한 증량`);

  if (highlights.length > 0) {
    parts.push(highlights.join("과 ") + "을 이뤄내셨습니다.");
  }

  parts.push("일관된 자기관리와 적극적인 자세가 결과로 이어졌습니다. 다음 사이클에서도 함께 더 나은 변화를 만들어가요.");
  return parts.join(" ");
};

export default function Report() {
  const { memberId } = useParams();
  const [member, setMember] = useState(null);
  const [trainerName, setTrainerName] = useState(() => {
    try {
      const u = JSON.parse(sessionStorage.getItem("mlUser") || "{}");
      return u.name || "박광덕";
    } catch (e) { return "박광덕"; }
  });
  const [folderName, setFolderName] = useState("");
  const [comment, setComment] = useState("");
  const [editingComment, setEditingComment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "members", memberId));
        if (!snap.exists()) { setLoading(false); return; }
        const m = { id: snap.id, ...snap.data() };
        setMember(m);

        // 폴더 라벨
        if (m.owner) {
          try {
            const userSnap = await getDoc(doc(db, "users", m.owner));
            if (userSnap.exists()) {
              const u = userSnap.data();
              const f = (u.folders || []).find(x => x.key === m.folder);
              setFolderName(f?.label || "");
            }
          } catch (e) {}
        }

        // 자동 코멘트
        const sortedInbody = [...(m.inbody || [])].sort((a, b) => a.date.localeCompare(b.date));
        const period = sortedInbody.length >= 2 ? weeksBetween(sortedInbody[0].date, sortedInbody[sortedInbody.length - 1].date) : null;
        setComment(generateComment(m, sortedInbody, period));
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [memberId]);

  if (loading) return <div style={{ minHeight: "100vh", background: "#1a1a1f", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontFamily: "'Noto Sans KR', sans-serif" }}>불러오는 중...</div>;
  if (!member) return <div style={{ minHeight: "100vh", background: "#1a1a1f", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontFamily: "'Noto Sans KR', sans-serif" }}>회원 정보를 찾을 수 없습니다.</div>;

  const sortedInbody = [...(member.inbody || [])].sort((a, b) => a.date.localeCompare(b.date));
  const first = sortedInbody[0] || {};
  const last = sortedInbody[sortedInbody.length - 1] || {};
  const period = sortedInbody.length >= 2 ? weeksBetween(first.date, last.date) : null;

  const chartData = sortedInbody.map(d => ({
    date: fmt(d.date),
    체중: num(d.weight),
    골격근량: num(d.muscle),
    체지방률: num(d.fat),
  }));

  const metrics = [
    { key: "weight", label: "체중", unit: "kg", first: num(first.weight), last: num(last.weight), goodIfDown: true },
    { key: "muscle", label: "골격근량", unit: "kg", first: num(first.muscle), last: num(last.muscle), goodIfDown: false },
    { key: "fat", label: "체지방률", unit: "%", first: num(first.fat), last: num(last.fat), goodIfDown: true },
    { key: "fatmass", label: "체지방량", unit: "kg", first: num(first.fatmass), last: num(last.fatmass), goodIfDown: true },
  ];

  // 건강기록 4개만 (가장 최근)
  const recentNotes = [...(member.notes || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4).reverse();

  const saveAsImage = async () => {
    try {
      // html2canvas CDN 동적 로드
      if (!window.html2canvas) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          s.onload = res; s.onerror = rej;
          document.head.appendChild(s);
        });
      }
      const el = document.getElementById("report-a4");
      const canvas = await window.html2canvas(el, { scale: 2, backgroundColor: "#fafaf7" });
      const link = document.createElement("a");
      link.download = `FORMA_${member.name || "회원"}_보고서.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) { alert("이미지 저장 실패: " + e.message); }
  };

  return (
    <div style={{ background: "#1a1a1f", minHeight: "100vh", padding: "40px 20px", display: "flex", justifyContent: "center", color: "#1a1a1f" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet" />

      {/* 툴바 */}
      <div style={{ position: "fixed", top: 20, right: 20, display: "flex", gap: 8, zIndex: 10 }} className="no-print">
        <button onClick={() => window.print()}
          style={{ background: "#4ECDC4", color: "#0F1117", border: "none", padding: "10px 18px", borderRadius: 8, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif", cursor: "pointer", fontSize: 13 }}>
          PDF로 저장
        </button>
        <button onClick={saveAsImage}
          style={{ background: "#2A2D3E", color: "#E8E8E8", border: "none", padding: "10px 18px", borderRadius: 8, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif", cursor: "pointer", fontSize: 13 }}>
          이미지 저장
        </button>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          #report-a4 { box-shadow: none !important; }
        }
      `}</style>

      {/* A4 보고서 */}
      <div id="report-a4" style={{
        width: 794, minHeight: 1123, background: "#fafaf7", padding: "36px 40px 32px",
        boxShadow: "0 30px 80px rgba(0,0,0,0.5)", position: "relative", overflow: "hidden",
        fontFamily: "'Noto Sans KR', sans-serif"
      }}>
        {/* 배경 데코 */}
        <div style={{ position: "absolute", top: 0, right: 0, width: 280, height: 280, background: "radial-gradient(circle at 70% 30%, rgba(78,205,196,0.12), transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, right: -20, fontFamily: "'Playfair Display', serif", fontSize: 220, fontWeight: 900, color: "rgba(15,17,23,0.025)", letterSpacing: -8, pointerEvents: "none", lineHeight: 1 }}>FORMA</div>

        {/* 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #0F1117", paddingBottom: 18, marginBottom: 24, position: "relative" }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, letterSpacing: 6, color: "#0F1117", lineHeight: 1 }}>FORMA</div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#888", marginTop: 6, fontWeight: 500 }}>PERSONAL TRAINING REPORT</div>
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "#555", lineHeight: 1.7 }}>
            <div><span style={{ color: "#999", marginRight: 6 }}>발행일</span><strong style={{ color: "#0F1117", fontWeight: 700 }}>{fmtFull(new Date())}</strong></div>
            <div><span style={{ color: "#999", marginRight: 6 }}>담당</span><strong style={{ color: "#0F1117", fontWeight: 700 }}>{trainerName} 트레이너</strong></div>
            {folderName && <div><span style={{ color: "#999", marginRight: 6 }}>소속</span><strong style={{ color: "#0F1117", fontWeight: 700 }}>{folderName}</strong></div>}
          </div>
        </div>

        {/* 타이틀 */}
        <div style={{ marginBottom: 22, position: "relative" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#0F1117", letterSpacing: -0.5 }}>Member Progress Report</div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 4, letterSpacing: 1 }}>회원 성과 분석 보고서</div>
        </div>

        {/* 회원 정보 */}
        <div style={{ background: "#0F1117", color: "#fafaf7", padding: "22px 26px", borderRadius: 4, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 24, marginBottom: 24, position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "#4ECDC4" }} />
          <div>
            <div style={{ fontSize: 9, color: "#888", letterSpacing: 2, marginBottom: 6, fontWeight: 500 }}>NAME</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#fafaf7", letterSpacing: -0.5 }}>{member.name || "-"}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: "#888", letterSpacing: 2, marginBottom: 6, fontWeight: 500 }}>AGE</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fafaf7" }}>{member.age || "-"}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: "#888", letterSpacing: 2, marginBottom: 6, fontWeight: 500 }}>GENDER</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fafaf7" }}>{member.gender || "-"}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: "#888", letterSpacing: 2, marginBottom: 6, fontWeight: 500 }}>PERIOD</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fafaf7" }}>{period ? `${period}주차` : "-"}</div>
          </div>
        </div>

        {/* 섹션 1: 차트 */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: "#4ECDC4", lineHeight: 1 }}>01</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0F1117", letterSpacing: 1 }}>BODY COMPOSITION CHANGE</span>
            <span style={{ flex: 1, height: 1, background: "#0F1117", alignSelf: "center", marginBottom: 4 }} />
          </div>
          <div style={{ background: "#fff", border: "1px solid #e5e3dc", borderRadius: 4, padding: "16px 14px 10px", height: 240 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="#eee" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#888" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#888" }} />
                  <Tooltip contentStyle={{ fontSize: 11, fontFamily: "'Noto Sans KR', sans-serif" }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} iconType="line" />
                  <Line type="monotone" dataKey="체중" stroke="#0F1117" strokeWidth={2.5} dot={{ r: 3, fill: "#0F1117" }} />
                  <Line type="monotone" dataKey="골격근량" stroke="#4ECDC4" strokeWidth={2.5} dot={{ r: 3, fill: "#4ECDC4" }} />
                  <Line type="monotone" dataKey="체지방률" stroke="#E76F51" strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 3, fill: "#E76F51" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#bbb", fontSize: 13 }}>인바디 기록이 없습니다</div>
            )}
          </div>
        </div>

        {/* 섹션 2: 수치 비교 */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: "#4ECDC4", lineHeight: 1 }}>02</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0F1117", letterSpacing: 1 }}>KEY METRICS</span>
            <span style={{ flex: 1, height: 1, background: "#0F1117", alignSelf: "center", marginBottom: 4 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {metrics.map(m => {
              const d = delta(m.first, m.last);
              const isGood = d !== null && (m.goodIfDown ? d < 0 : d > 0);
              const sign = d !== null && d > 0 ? "+" : "";
              return (
                <div key={m.key} style={{ background: "#fff", border: "1px solid #e5e3dc", padding: "14px 14px 12px", borderRadius: 4 }}>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1, marginBottom: 8, fontWeight: 500 }}>{m.label}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <span style={{ fontSize: 9, color: "#aaa", letterSpacing: 0.5 }}>FIRST</span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#0F1117", lineHeight: 1 }}>{m.first ?? "-"}<span style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 10, fontWeight: 500, color: "#888", marginLeft: 2 }}>{m.first !== null ? m.unit : ""}</span></span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <span style={{ fontSize: 9, color: "#aaa", letterSpacing: 0.5 }}>LATEST</span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#0F1117", lineHeight: 1 }}>{m.last ?? "-"}<span style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 10, fontWeight: 500, color: "#888", marginLeft: 2 }}>{m.last !== null ? m.unit : ""}</span></span>
                  </div>
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: "#888", letterSpacing: 1 }}>변화</span>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: d === null ? "#aaa" : (isGood ? "#2A9D8F" : "#E76F51") }}>
                      {d === null ? "-" : `${sign}${d}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 섹션 3: 건강기록 히스토리 */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: "#4ECDC4", lineHeight: 1 }}>03</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0F1117", letterSpacing: 1 }}>SESSION HIGHLIGHTS</span>
            <span style={{ flex: 1, height: 1, background: "#0F1117", alignSelf: "center", marginBottom: 4 }} />
          </div>
          <div style={{ background: "#fff", border: "1px solid #e5e3dc", borderRadius: 4, padding: "14px 18px", maxHeight: 180, overflow: "hidden" }}>
            {recentNotes.length === 0 ? (
              <div style={{ color: "#bbb", fontSize: 12, padding: "10px 0" }}>건강 기록이 없습니다</div>
            ) : recentNotes.map((n, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: 14, padding: "8px 0", borderBottom: i < recentNotes.length - 1 ? "1px dashed #ececec" : "none", fontSize: 11.5, lineHeight: 1.55 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#4ECDC4", fontSize: 12 }}>{fmt(n.date)}</div>
                <div style={{ color: "#333" }}>{n.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 섹션 4: 트레이너 코멘트 */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: "#4ECDC4", lineHeight: 1 }}>04</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0F1117", letterSpacing: 1 }}>TRAINER'S NOTE</span>
            <span style={{ flex: 1, height: 1, background: "#0F1117", alignSelf: "center", marginBottom: 4 }} />
          </div>
          <div style={{ background: "#0F1117", color: "#fafaf7", padding: "18px 22px", borderRadius: 4, position: "relative" }}>
            <div style={{ position: "absolute", top: -16, left: 14, fontFamily: "'Playfair Display', serif", fontSize: 90, color: "#4ECDC4", lineHeight: 1, fontWeight: 900 }}>"</div>
            {editingComment ? (
              <textarea value={comment} onChange={e => setComment(e.target.value)} onBlur={() => setEditingComment(false)} autoFocus
                style={{ width: "100%", minHeight: 100, background: "transparent", border: "1px solid #4ECDC4", borderRadius: 4, color: "#fafaf7", fontSize: 12.5, lineHeight: 1.85, padding: "8px 10px 8px 24px", fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 300, resize: "vertical", outline: "none" }} />
            ) : (
              <div onClick={() => setEditingComment(true)} className="no-print-cursor"
                style={{ fontSize: 12.5, lineHeight: 1.85, color: "#fafaf7", paddingLeft: 24, fontWeight: 300, cursor: "text", minHeight: 60 }}
                title="클릭해서 수정">
                {comment}
              </div>
            )}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #2A2D3E", textAlign: "right", paddingLeft: 24 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: "#4ECDC4", letterSpacing: 0.5 }}>{trainerName}</div>
              <div style={{ fontSize: 10, color: "#888", letterSpacing: 1.5, marginTop: 2 }}>CERTIFIED TRAINER · FORMA</div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div style={{ position: "absolute", bottom: 16, left: 40, right: 40, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9, color: "#999", letterSpacing: 1.5, borderTop: "1px solid #e5e3dc", paddingTop: 10 }}>
          <span>FORMA · PERSONAL TRAINING</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 11, color: "#0F1117", fontWeight: 700 }}>— 01 —</span>
          <span>memberlog.web.app</span>
        </div>
      </div>
    </div>
  );
}
