import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, addDoc, updateDoc, collection, serverTimestamp } from "firebase/firestore";

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

// ─── PAR-Q 문항 ───
const PAR_Q_QUESTIONS = [
  "의사가 당신의 심장에 이상이 있고, 의사권고에 따라 신체활동을 해야 한다는 말을 들었습니까?",
  "신체활동을 할 때 가슴에 통증을 느낀 적이 있습니까?",
  "지난 달에 쉬고 있는 도중에도 가슴에 통증을 느낀 적이 있습니까?",
  "어지럼증 때문에 몸의 균형을 잃거나 의식을 잃은 적이 있습니까?",
  "신체활동의 변화가 생기면 악화될 수 있는 뼈나 관절의 문제(예: 허리, 무릎 등)가 있습니까?",
  "현재 혈압이나 심장질환으로 의사로부터 약(예: 이뇨제) 등을 처방받고 있습니까?",
  "신체활동을 하지 말아야 하는 다른 어떤 이유를 알고 있는 것이 있습니까?",
];

const PAR_Q_PLUS_GENERAL = [
  "의사가 당신의 심장질환 또는 고혈압에 대해 이야기한 적이 있습니까?",
  "안정 시나 일상활동 중 또는 신체활동 할 때 가슴에 통증이 있습니까?",
  "지난 12개월 동안 어지럼증으로 쓰러졌거나 의식을 잃은 적이 있습니까?",
  "심장병이나 고혈압 이외의 다른 만성질환으로 진단받은 적이 있습니까?",
  "현재 만성질환을 치료하기 위해 처방약을 복용하고 있습니까?",
  "신체활동을 통해 더 악화될 수 있는 뼈, 관절 또는 연부조직(근육, 인대 또는 힘줄) 문제가 현재(또는 지난 12개월 이내) 있습니까?",
  "의사가 의학적인 감독하에서만 신체활동을 해야 한다고 말했습니까?",
];

const PAR_Q_PLUS_FOLLOWUP = [
  { id: "q1", main: "관절염, 골다공증, 또는 허리에 문제가 있습니까?", subs: ["약물/치료로 질환 조절이 어렵습니까?","관절 통증, 최근 골절, 척추 문제가 있습니까?","3개월 이상 정기적으로 스테로이드 주사를 맞았습니까?"] },
  { id: "q2", main: "어떤 종류의 암을 지니고 있습니까?", subs: ["폐/기관지, 다발성 골수종, 두경부, 목 유형입니까?","현재 암 치료(화학요법 또는 방사선 치료)를 받고 있습니까?"] },
  { id: "q3", main: "심장이나 심혈관질환이 있습니까? (관상동맥질환, 심장마비, 부정맥)", subs: ["약물/치료로 질환 조절이 어렵습니까?","의료관리가 필요한 불규칙한 심장박동이 있습니까?","만성심부전이 있습니까?","관상동맥질환 진단 + 지난 2개월 미운동입니까?"] },
  { id: "q4", main: "고혈압이 있습니까?", subs: ["약물/치료로 질환 조절이 어렵습니까?","안정 시 혈압이 160/90mmHg 이상입니까?"] },
  { id: "q5", main: "대사질환이 있습니까? (1형/2형 당뇨병, 전 당뇨병)", subs: ["혈당 조절이 어렵습니까?","저혈당 증상이 자주 있습니까?","당뇨 합병증(심혈관, 눈, 신장, 발) 징후가 있습니까?","다른 대사질환(임신성 당뇨, 만성신장질환 등)이 있습니까?","가까운 장래에 고강도 운동을 할 계획입니까?"] },
  { id: "q6", main: "정신건강 문제나 학습장애가 있습니까? (알츠하이머, 치매, 우울증, 불안장애 등)", subs: ["약물/치료로 질환 조절이 어렵습니까?","신경/근육에 영향을 미치는 허리 문제도 있습니까?"] },
  { id: "q7", main: "호흡기 질환이 있습니까? (COPD, 천식, 폐고혈압)", subs: ["약물/치료로 질환 조절이 어렵습니까?","혈중산소수치가 낮고 산소 보충치료가 필요합니까?","현재 천식 증상(흉부 압박, 천명음, 호흡곤란)이 있습니까?","폐혈관에 고혈압이 있다고 의사가 말했습니까?"] },
  { id: "q8", main: "척추 손상이 있습니까? (사지마비, 하반신 마비)", subs: ["약물/치료로 질환 조절이 어렵습니까?","낮은 혈압으로 현기증·실신이 있습니까?","자율신경반사장애가 있다고 의사가 말했습니까?"] },
  { id: "q9", main: "뇌졸중이 있었습니까? (TIA 또는 뇌혈관사고)", subs: ["약물/치료로 질환 조절이 어렵습니까?","걷거나 이동하는 데 장애가 있습니까?","지난 6개월 동안 뇌졸중이 있었습니까?"] },
  { id: "q10", main: "기타 질환 또는 두 가지 이상의 질병이 있습니까?", subs: ["12개월 내 뇌진탕 진단을 받았습니까?","간질, 신경질환, 신장 문제 등 나열되지 않은 질병이 있습니까?","현재 두 가지 이상의 질병을 가지고 있습니까?"] },
];

// ─── 공통 스타일/컴포넌트 ───
const iStyle = {
  width: "100%", background: "#151821", border: "1px solid #2A2D3E",
  borderRadius: 10, padding: "12px 14px", color: "#E8E8E8",
  fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: font,
  WebkitAppearance: "none",
};

const Label = ({ children, required }) => (
  <div style={{ fontSize: 13, color: "#C0C0C0", marginBottom: 8, fontWeight: 500 }}>
    {children}{required && <span style={{ color: "#4ECDC4", marginLeft: 3 }}>*</span>}
  </div>
);

const Field = ({ children, style }) => (
  <div style={{ marginBottom: 16, ...style }}>{children}</div>
);

const ChipGroup = ({ options, value, onChange, multi }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
    {options.map(opt => {
      const v = typeof opt === "string" ? opt : opt.value;
      const label = typeof opt === "string" ? opt : opt.label;
      const selected = multi ? (value || []).includes(v) : value === v;
      return (
        <button key={v} type="button" onClick={() => {
          if (multi) {
            const cur = value || [];
            onChange(selected ? cur.filter(x => x !== v) : [...cur, v]);
          } else onChange(selected ? "" : v);
        }}
          style={{ padding: "10px 18px", border: "1px solid " + (selected ? "#4ECDC4" : "#2A2D3E"), borderRadius: 100, background: selected ? "#4ECDC422" : "#1A1D27", color: selected ? "#4ECDC4" : "#C0C0C0", fontWeight: selected ? 700 : 400, fontSize: 14, cursor: "pointer", fontFamily: font, transition: "all 0.18s" }}>
          {selected && multi ? "✓ " : ""}{label}
        </button>
      );
    })}
  </div>
);

const ScaleGroup = ({ value, onChange, lowLabel, highLabel }) => (
  <div>
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <button key={n} type="button" onClick={() => onChange(String(n))}
          style={{ width: 44, height: 44, border: "1px solid " + (value === String(n) ? "#4ECDC4" : "#2A2D3E"), borderRadius: 10, background: value === String(n) ? "#4ECDC422" : "#1A1D27", color: value === String(n) ? "#4ECDC4" : "#C0C0C0", fontWeight: value === String(n) ? 700 : 400, fontSize: 15, cursor: "pointer", fontFamily: font }}>
          {n}
        </button>
      ))}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#888" }}>
      <span>{lowLabel}</span><span>{highLabel}</span>
    </div>
  </div>
);

const YesNo = ({ value, onChange, label, index, color = "#4ECDC4" }) => (
  <div style={{ marginBottom: 12, background: "#151821", border: "1px solid #2A2D3E", borderRadius: 12, padding: "14px 16px" }}>
    <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.6, color: "#E8E8E8", fontFamily: font, fontWeight: 500 }}>
      {index && <span style={{ color, fontWeight: 700, marginRight: 8 }}>{index}.</span>}{label}
    </p>
    <div style={{ display: "flex", gap: 10 }}>
      {["그렇다", "아니다"].map(opt => {
        const isYes = opt === "그렇다";
        const sel = value === isYes;
        return (
          <button key={opt} type="button" onClick={() => onChange(isYes)}
            style={{ flex: 1, padding: "10px", border: "2px solid " + (sel ? (isYes ? "#FF6B6B" : "#4ECDC4") : "#2A2D3E"), borderRadius: 10, background: sel ? (isYes ? "#FF6B6B22" : "#4ECDC422") : "#0F1117", color: sel ? (isYes ? "#FF6B6B" : "#4ECDC4") : "#C0C0C0", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: font }}>
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

const SectionTitle = ({ children, color = "#4ECDC4" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, marginTop: 8 }}>
    <span style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: 1.5 }}>{children}</span>
    <div style={{ flex: 1, height: 1, background: "#2A2D3E" }} />
  </div>
);

const Card = ({ children }) => (
  <div style={{ background: "#151821", border: "1px solid #2A2D3E", borderRadius: 16, padding: "18px", marginBottom: 16 }}>
    {children}
  </div>
);

// ─── 통증 맵 ───
const FRONT_ZONES = [
  { id: "head",      label: "머리",           sub: null,       style: { top: "0%",   left: "30%",  width: "40%", height: "17%" } },
  { id: "neck",      label: "목",             sub: null,       style: { top: "17%",  left: "38%",  width: "24%", height: "8%"  } },
  { id: "sh-l",      label: "왼쪽 어깨",      sub: "shoulder", style: { top: "18%",  left: "7%",   width: "20%", height: "12%" } },
  { id: "sh-r",      label: "오른쪽 어깨",    sub: "shoulder", style: { top: "18%",  right: "7%",  width: "20%", height: "12%" } },
  { id: "chest",     label: "가슴",           sub: null,       style: { top: "25%",  left: "27%",  width: "46%", height: "13%" } },
  { id: "abd",       label: "복부",           sub: null,       style: { top: "38%",  left: "27%",  width: "46%", height: "12%" } },
  { id: "el-l",      label: "왼쪽 팔꿈치",    sub: "elbow",    style: { top: "37%",  left: "3%",   width: "16%", height: "12%" } },
  { id: "el-r",      label: "오른쪽 팔꿈치",  sub: "elbow",    style: { top: "37%",  right: "3%",  width: "16%", height: "12%" } },
  { id: "wr-l",      label: "왼쪽 손목",      sub: "wrist",    style: { top: "52%",  left: "3%",   width: "14%", height: "9%"  } },
  { id: "wr-r",      label: "오른쪽 손목",    sub: "wrist",    style: { top: "52%",  right: "3%",  width: "14%", height: "9%"  } },
  { id: "th-l",      label: "왼쪽 허벅지",    sub: null,       style: { top: "57%",  left: "22%",  width: "20%", height: "14%" } },
  { id: "th-r",      label: "오른쪽 허벅지",  sub: null,       style: { top: "57%",  right: "22%", width: "20%", height: "14%" } },
  { id: "kn-l",      label: "왼쪽 무릎",      sub: "knee",     style: { top: "68%",  left: "20%",  width: "20%", height: "11%" } },
  { id: "kn-r",      label: "오른쪽 무릎",    sub: "knee",     style: { top: "68%",  right: "20%", width: "20%", height: "11%" } },
  { id: "ank-l",     label: "왼쪽 발목",      sub: "ankle",    style: { top: "87%",  left: "18%",  width: "18%", height: "9%"  } },
  { id: "ank-r",     label: "오른쪽 발목",    sub: "ankle",    style: { top: "87%",  right: "18%", width: "18%", height: "9%"  } },
];

const BACK_ZONES = [
  { id: "trap",      label: "승모근",          sub: null,       style: { top: "18%",  left: "18%",  width: "64%", height: "10%" } },
  { id: "upback",    label: "등 위",           sub: null,       style: { top: "28%",  left: "27%",  width: "46%", height: "12%" } },
  { id: "lowback",   label: "허리",            sub: null,       style: { top: "40%",  left: "27%",  width: "46%", height: "10%" } },
  { id: "el-b",      label: "팔꿈치",          sub: "elbow",    style: { top: "37%",  left: "3%",   width: "16%", height: "12%" } },
  { id: "glute-l",   label: "왼쪽 골반",       sub: null,       style: { top: "51%",  left: "22%",  width: "22%", height: "10%" } },
  { id: "glute-r",   label: "오른쪽 골반",     sub: null,       style: { top: "51%",  right: "22%", width: "22%", height: "10%" } },
  { id: "ham-l",     label: "왼쪽 햄스트링",   sub: null,       style: { top: "61%",  left: "22%",  width: "20%", height: "12%" } },
  { id: "ham-r",     label: "오른쪽 햄스트링", sub: null,       style: { top: "61%",  right: "22%", width: "20%", height: "12%" } },
  { id: "kn-bl",     label: "왼쪽 무릎 뒤",    sub: "knee",     style: { top: "68%",  left: "20%",  width: "20%", height: "11%" } },
  { id: "kn-br",     label: "오른쪽 무릎 뒤",  sub: "knee",     style: { top: "68%",  right: "20%", width: "20%", height: "11%" } },
  { id: "cal-l",     label: "왼쪽 종아리",     sub: null,       style: { top: "82%",  left: "20%",  width: "18%", height: "10%" } },
  { id: "cal-r",     label: "오른쪽 종아리",   sub: null,       style: { top: "82%",  right: "20%", width: "18%", height: "10%" } },
];

const SUB_OPTS = {
  elbow:    ["안쪽", "바깥쪽", "전체"],
  knee:     ["안쪽", "바깥쪽", "앞쪽", "뒤쪽(오금)", "전체"],
  shoulder: ["앞쪽", "뒤쪽", "위쪽", "전체"],
  wrist:    ["안쪽", "바깥쪽", "전체"],
  ankle:    ["안쪽", "바깥쪽", "앞쪽", "전체"],
};

const BodyMap = ({ value = [], onChange, noPain, onNoPain, gender }) => {
  const [bodySide, setBodySide] = useState("front");
  const [subModal, setSubModal] = useState(null); // { id, label, subKey }
  const [subSelected, setSubSelected] = useState([]);

  const zones = bodySide === "front" ? FRONT_ZONES : BACK_ZONES;
  const bodyColor = gender === "남성" ? "#4A90D9" : gender === "여성" ? "#E87490" : "#3a3a50";
  const bodyStroke = gender === "남성" ? "#3472B0" : gender === "여성" ? "#C45A74" : "#4a4a60";

  const handleZoneClick = (z) => {
    onNoPain(false);
    const ids = value.map(v => typeof v === "string" ? v : v.id);
    if (ids.includes(z.id)) {
      onChange(value.filter(v => (typeof v === "string" ? v : v.id) !== z.id));
    } else {
      if (z.sub && SUB_OPTS[z.sub]) {
        setSubModal(z);
        setSubSelected([]);
      } else {
        onChange([...value, { id: z.id, label: z.label, sub: [] }]);
      }
    }
  };

  const confirmSub = () => {
    onChange([...value, { id: subModal.id, label: subModal.label, sub: subSelected }]);
    setSubModal(null);
  };

  const getLabel = (v) => {
    if (typeof v === "string") return v;
    return v.sub && v.sub.length ? `${v.label} (${v.sub.join("/")})` : v.label;
  };

  const getId = (v) => typeof v === "string" ? v : v.id;

  return (
    <div>
      {/* 앞뒤 탭 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        {["front", "back"].map(s => (
          <button key={s} type="button" onClick={() => setBodySide(s)}
            style={{ padding: "8px", borderRadius: 8, border: "1px solid " + (bodySide === s ? "#888" : "#2A2D3E"), background: bodySide === s ? "#ffffff10" : "#0F1117", color: bodySide === s ? "#E8E8E8" : "#555", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            {s === "front" ? "앞면" : "뒷면"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ position: "relative", width: 180, flexShrink: 0 }}>
          <svg viewBox="0 0 200 480" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
            {/* 머리 */}
            <ellipse cx="100" cy="40" rx="28" ry="34" fill={bodyColor} stroke={bodyStroke} strokeWidth="1.5" opacity="0.85"/>
            {/* 목 */}
            <rect x="89" y="72" width="22" height="20" rx="4" fill={bodyColor} stroke={bodyStroke} strokeWidth="1.5" opacity="0.85"/>
            {/* 몸통 */}
            <path d="M68 92 Q55 96 52 120 L48 200 Q47 216 68 220 L132 220 Q153 216 152 200 L148 120 Q145 96 132 92 Z" fill={bodyColor} stroke={bodyStroke} strokeWidth="1.5" opacity="0.85"/>
            {/* 몸통 라인 */}
            <path d="M72 96 Q100 108 128 96" stroke={bodyStroke} strokeWidth="1.2" fill="none" opacity="0.5"/>
            <line x1="100" y1="100" x2="100" y2="195" stroke={bodyStroke} strokeWidth="1" opacity="0.4"/>
            {/* 팔 */}
            <path d="M68 95 Q50 100 44 140 Q40 170 42 200" stroke={bodyColor} strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.9"/>
            <path d="M132 95 Q150 100 156 140 Q160 170 158 200" stroke={bodyColor} strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.9"/>
            {/* 손 */}
            <path d="M42 200 Q38 230 36 265" stroke={bodyColor} strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.85"/>
            <path d="M158 200 Q162 230 164 265" stroke={bodyColor} strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.85"/>
            <ellipse cx="35" cy="275" rx="10" ry="14" fill={bodyColor} stroke={bodyStroke} strokeWidth="1.5" opacity="0.8"/>
            <ellipse cx="165" cy="275" rx="10" ry="14" fill={bodyColor} stroke={bodyStroke} strokeWidth="1.5" opacity="0.8"/>
            {/* 골반 */}
            <path d="M68 220 Q55 230 54 250 Q53 268 68 272 L132 272 Q147 268 146 250 Q145 230 132 220 Z" fill={bodyColor} stroke={bodyStroke} strokeWidth="1.5" opacity="0.75"/>
            {/* 다리 */}
            <path d="M80 272 Q72 310 70 360" stroke={bodyColor} strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.9"/>
            <path d="M120 272 Q128 310 130 360" stroke={bodyColor} strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.9"/>
            <path d="M70 360 Q66 400 65 440" stroke={bodyColor} strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.9"/>
            <path d="M130 360 Q134 400 135 440" stroke={bodyColor} strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.9"/>
            {/* 발 */}
            <ellipse cx="63" cy="453" rx="16" ry="10" fill={bodyColor} stroke={bodyStroke} strokeWidth="1.5" opacity="0.8"/>
            <ellipse cx="137" cy="453" rx="16" ry="10" fill={bodyColor} stroke={bodyStroke} strokeWidth="1.5" opacity="0.8"/>
            {/* 무릎 */}
            <circle cx="70" cy="360" r="6" fill={bodyStroke} opacity="0.5"/>
            <circle cx="130" cy="360" r="6" fill={bodyStroke} opacity="0.5"/>
          </svg>
          {/* 클릭 존 */}
          {zones.map(z => {
            const active = value.some(v => getId(v) === z.id);
            return (
              <div key={z.id} onClick={() => handleZoneClick(z)}
                style={{ position: "absolute", borderRadius: "50%", cursor: "pointer",
                  border: "2px dashed " + (active ? "#FF6B6B" : "#FFE600"),
                  background: active ? "rgba(255,107,107,0.4)" : "transparent",
                  boxShadow: active ? "0 0 12px rgba(255,107,107,0.5)" : "none",
                  transition: "all 0.2s", ...z.style }} />
            );
          })}
        </div>

        <div style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>선택된 부위</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, minHeight: 40 }}>
            {value.length === 0 && !noPain && <span style={{ fontSize: 13, color: "#555", fontStyle: "italic" }}>부위를 터치해주세요</span>}
            {noPain && <span style={{ fontSize: 13, color: "#4ECDC4", fontWeight: 600 }}>✓ 통증 없음</span>}
            {value.map((v, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,107,107,0.15)", border: "1px solid #FF6B6B", borderRadius: 100, padding: "4px 12px", fontSize: 12, color: "#FF6B6B", fontFamily: font }}>
                {getLabel(v)}
                <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#FF6B6B", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
              </span>
            ))}
          </div>
          <button type="button" onClick={() => { onChange([]); onNoPain(!noPain); }}
            style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, background: noPain ? "rgba(80,200,240,0.1)" : "#1A1D27", border: "1px solid " + (noPain ? "#4ECDC4" : "#2A2D3E"), borderRadius: 100, padding: "8px 16px", cursor: "pointer", fontSize: 13, color: noPain ? "#4ECDC4" : "#888", fontFamily: font }}>
            통증 없음
          </button>
        </div>
      </div>

      {/* 세부 선택 모달 */}
      {subModal && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={() => setSubModal(null)}>
          <div style={{ background: "#151821", border: "1px solid #2A2D3E", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 480 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}>📍 {subModal.label}</div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 16 }}>더 자세한 위치를 선택해주세요 (선택 안 해도 됩니다)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {SUB_OPTS[subModal.sub].map(o => (
                <button key={o} type="button" onClick={() => setSubSelected(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o])}
                  style={{ background: subSelected.includes(o) ? "#FF6B6B18" : "#0F1117", border: "1px solid " + (subSelected.includes(o) ? "#FF6B6B" : "#2A2D3E"), borderRadius: 12, padding: "13px 16px", cursor: "pointer", fontSize: 14, color: subSelected.includes(o) ? "#FF6B6B" : "#E8E8E8", fontFamily: font, fontWeight: subSelected.includes(o) ? 700 : 400, textAlign: "left" }}>
                  {o}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button type="button" onClick={() => setSubModal(null)}
                style={{ background: "#2A2D3E", border: "none", borderRadius: 12, padding: 14, color: "#888", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>그냥 저장</button>
              <button type="button" onClick={confirmSub}
                style={{ background: "#FF6B6B", border: "none", borderRadius: 12, padding: 14, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>선택 완료</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── 서명 패드 ───
const SignaturePad = ({ onSave }) => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: (touch.clientX - rect.left) * (canvas.width / rect.width), y: (touch.clientY - rect.top) * (canvas.height / rect.height) };
  };
  const startDraw = (e) => { e.preventDefault(); const canvas = canvasRef.current; const ctx = canvas.getContext("2d"); const pos = getPos(e, canvas); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); setDrawing(true); };
  const draw = (e) => { e.preventDefault(); if (!drawing) return; const canvas = canvasRef.current; const ctx = canvas.getContext("2d"); const pos = getPos(e, canvas); ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.strokeStyle = "#E8E8E8"; ctx.lineTo(pos.x, pos.y); ctx.stroke(); setHasSignature(true); };
  const endDraw = () => setDrawing(false);
  const clear = () => { canvasRef.current.getContext("2d").clearRect(0, 0, 680, 200); setHasSignature(false); };
  const save = () => { if (!hasSignature) return; onSave(canvasRef.current.toDataURL()); };
  return (
    <div>
      <div style={{ position: "relative", border: "1px solid #2A2D3E", borderRadius: 12, overflow: "hidden", background: "#0F1117" }}>
        <canvas ref={canvasRef} width={680} height={200} style={{ display: "block", width: "100%", touchAction: "none" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
        <div style={{ position: "absolute", bottom: 8, left: 12, color: "#333", fontSize: 12, fontFamily: font, pointerEvents: "none" }}>여기에 서명하세요</div>
        {hasSignature && <button onClick={clear} style={{ position: "absolute", top: 8, right: 8, background: "#2A2D3E", border: "none", borderRadius: 6, padding: "4px 10px", color: "#888", fontSize: 12, cursor: "pointer", fontFamily: font }}>지우기</button>}
      </div>
      <button onClick={save} disabled={!hasSignature}
        style={{ marginTop: 12, width: "100%", background: hasSignature ? "#4ECDC4" : "#2A2D3E", color: hasSignature ? "#0F1117" : "#555", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 15, cursor: hasSignature ? "pointer" : "not-allowed", fontFamily: font }}>
        서명 완료
      </button>
    </div>
  );
};

// ─── 생년월일 포맷 ───
function formatBirth(raw) {
  const v = raw.replace(/[^0-9]/g, "");
  if (v.length <= 4) return v;
  if (v.length <= 6) return v.slice(0, 4) + "." + v.slice(4);
  return v.slice(0, 4) + "." + v.slice(4, 6) + "." + v.slice(6, 8);
}

const emptyPt = (name = "") => ({
  name, phone: "", birth: "", gender: "", job: "",
  height: "", weight: "", bodyfat: "", fatmass: "", musclemass: "", bmi: "",
  goalWeight: "", goalFat: "", goalFatmass: "",
  goal: [], goalOther: "",
  expYears: "", freq: "", extype: [], extypeOther: "",
  medication: "", painZones: [], noPain: false, healthDetail: "",
  sleep: "", meal: "", smoke: "", drink: "", activity: "",
  stress: "", motive: "",
  timeSlot: [], ptExp: "",
  ptQuitReason: [], ptQuitOther: "", ptDissatisfy: [], ptDisOther: "", ptImprove: "",
  expectation: "", note: "",
  agree: false,
});

export default function Survey() {
  const { memberId } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "1";
  const isNewMember = memberId === "new";
  const [member, setMember] = useState(null);
  const [trainerName, setTrainerName] = useState("");
  const [loading, setLoading] = useState(true);

  // step: 0=PT설문지, 1=PAR-Q, 2=PAR-Q+(그렇다시), 3=개인정보동의, 4=서명, 5=완료
  const [step, setStep] = useState(0);
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);

  const [pt, setPt] = useState(emptyPt());
  const [parqAnswers, setParqAnswers] = useState(Array(7).fill(null));
  const [parqPlusGeneral, setParqPlusGeneral] = useState(Array(7).fill(null));
  const [parqPlusFollowup, setParqPlusFollowup] = useState({});
  const [disease4Note, setDisease4Note] = useState("");
  const [disease5Note, setDisease5Note] = useState("");
  const [disease6Note, setDisease6Note] = useState("");
  const [signature, setSignature] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isNewMember) { setLoading(false); return; }
    getDoc(doc(db, "members", memberId)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setMember({ id: snap.id, ...data });
        setPt(emptyPt(data.name || ""));
        // 트레이너 이름 가져오기
        if (data.owner) {
          getDoc(doc(db, "users", data.owner)).then(userSnap => {
            if (userSnap.exists()) setTrainerName(userSnap.data().name || "");
          }).catch(() => {});
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    // 수정 모드면 기존 설문지 데이터 불러오기
    if (isEditMode) {
      getDoc(doc(db, "surveys", memberId)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.pt) setPt({ ...emptyPt(), ...data.pt, agree: true });
          if (data.parqAnswers) setParqAnswers(data.parqAnswers);
          if (data.parqPlusGeneral?.length > 0) setParqPlusGeneral(data.parqPlusGeneral);
          if (data.parqPlusFollowup) setParqPlusFollowup(data.parqPlusFollowup);
          if (data.disease4Note) setDisease4Note(data.disease4Note);
          if (data.disease5Note) setDisease5Note(data.disease5Note);
          if (data.disease6Note) setDisease6Note(data.disease6Note);
        }
      }).catch(() => {});
    }
  }, [memberId]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const goNext = (n) => { setStep(n); scrollTop(); };
  const [errors, setErrors] = useState({});

  const scrollToError = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.outline = "2px solid #FF6B6B";
      el.style.borderRadius = "10px";
      setTimeout(() => { el.style.outline = "none"; }, 2000);
    }
  };

  const handlePtNext = () => {
    if (!pt.name.trim()) { scrollToError("field-name"); return; }
    if (!pt.phone.trim()) { scrollToError("field-phone"); return; }
    if (!pt.agree) { scrollToError("field-agree"); return; }
    goNext(1);
  };

  const handleParqNextSafe = () => {
    const idx = parqAnswers.findIndex(a => a === null);
    if (idx !== -1) { scrollToError(`field-parq-${idx}`); return; }
    handleParqNext();
  };

  const handleParqPlusNextSafe = () => {
    const idx = parqPlusGeneral.findIndex(a => a === null);
    if (idx !== -1) { scrollToError(`field-parqplus-${idx}`); return; }
    goNext(3);
  };
  const setPtField = (k, v) => setPt(prev => ({ ...prev, [k]: v }));

  const parqHasYes = parqAnswers.some(a => a === true);
  const isParqComplete = parqAnswers.every(a => a !== null);
  const isParqPlusComplete = parqPlusGeneral.every(a => a !== null);
  const isPtBasicFilled = pt.name.trim() && pt.phone.trim() && pt.agree;

  // PAR-Q 다음 누를 때: 하나라도 그렇다면 PAR-Q+로, 아니면 개인정보 동의로
  const handleParqNext = () => {
    if (parqHasYes) goNext(2);
    else goNext(3);
  };

  const submit = async () => {
    if (!signature) return;
    setSubmitting(true);
    try {
      let targetMemberId = memberId;
      const today = new Date().toISOString().split("T")[0];

      // 생년월일로 연령대 계산
      const calcAge = (birth) => {
        if (!birth) return "";
        const nums = birth.replace(/[^0-9]/g, "");
        if (nums.length < 4) return "";
        const year = parseInt(nums.slice(0, 4));
        const currentYear = new Date().getFullYear();
        const age = currentYear - year;
        if (age < 20) return "10대";
        if (age < 30) return "20대";
        if (age < 40) return "30대";
        if (age < 50) return "40대";
        if (age < 60) return "50대";
        if (age < 70) return "60대";
        return "70대";
      };

      // 건강 특이사항 노트 생성
      const notes = [];
      let noteText = `설문지 작성으로 자동 등록. 연락처: ${pt.phone}`;
      if (pt.healthDetail) noteText += `\n건강상태: ${pt.healthDetail}`;
      if (pt.medication && pt.medication !== "없음") noteText += `\n복용약: ${pt.medication}`;
      if (pt.painZones?.length > 0) noteText += `\n통증부위: ${pt.painZones.map(v => typeof v === "string" ? v : (v.sub?.length ? `${v.label}(${v.sub.join("/")})` : v.label)).join(", ")}`;
      notes.push({ date: today, text: noteText });

      const memberData = {
        name: pt.name.trim(),
        age: calcAge(pt.birth),
        gender: pt.gender || "",
        purpose: pt.goal?.filter(g => g !== "기타") || [],
        timeSlot: pt.timeSlot || [],
        registeredDate: today,
        notes,
        inbody: [],
        createdAt: serverTimestamp(),
      };

      // 신규 회원이면 members 컬렉션에 자동 생성
      if (isNewMember) {
        const newMemberRef = await addDoc(collection(db, "members"), {
          ...memberData,
          folder: "롯데대연",
        });
        targetMemberId = newMemberRef.id;
      } else {
        // 기존 회원이면 빈 필드만 업데이트
        const updates = {};
        if (!member?.age && memberData.age) updates.age = memberData.age;
        if (!member?.gender && memberData.gender) updates.gender = memberData.gender;
        if ((!member?.purpose || member.purpose.length === 0) && memberData.purpose.length > 0) updates.purpose = memberData.purpose;
        if ((!member?.timeSlot || member.timeSlot.length === 0) && memberData.timeSlot.length > 0) updates.timeSlot = memberData.timeSlot;
        if (Object.keys(updates).length > 0) {
          await updateDoc(doc(db, "members", targetMemberId), updates);
        }
      }

      await setDoc(doc(db, "surveys", targetMemberId), {
        memberId: targetMemberId,
        memberName: pt.name,
        isNewMember,
        pt,
        parqAnswers,
        parqHasYes,
        parqPlusGeneral: parqHasYes ? parqPlusGeneral : [],
        parqPlusHasYes: parqHasYes ? parqPlusGeneral.some(a => a === true) : false,
        parqPlusFollowup,
        disease4Note, disease5Note, disease6Note,
        privacyAgree1: agree1,
        privacyAgree2: agree2,
        signature,
        submittedAt: serverTimestamp(),
        status: "completed",
      });
      setStep(5);
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0F1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet" />
      <div style={{ width: 32, height: 32, border: "3px solid #2A2D3E", borderTop: "3px solid #4ECDC4", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!isNewMember && !member) return (
    <div style={{ minHeight: "100vh", background: "#0F1117", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <p style={{ color: "#888", fontFamily: font }}>유효하지 않은 설문지 링크입니다.</p>
    </div>
  );

  const STEP_LABELS = ["PT 설문지", "PAR-Q", parqHasYes ? "PAR-Q+" : "개인정보 동의", "개인정보 동의", "서명"];
  const pct = Math.round((step / 5) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#0F1117", color: "#E8E8E8", fontFamily: font }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none} *{-webkit-tap-highlight-color:transparent}`}</style>

      <header style={{ background: "#0F1117", borderBottom: "1px solid #1E2030", padding: "14px 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: "#4ECDC4", letterSpacing: 4 }}>FORMA</span>
            {step < 5 && <span style={{ fontSize: 12, color: isEditMode ? "#FFA500" : "#555" }}>{isEditMode ? "✏️ 수정 모드" : STEP_LABELS[Math.min(step, 4)]}</span>}
          </div>
          {step < 4 && (
            <div style={{ width: "100%", height: 4, background: "#1E2133", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: pct + "%", background: "linear-gradient(90deg,#4ECDC4,#A78BFA)", borderRadius: 4, transition: "width 0.4s" }} />
            </div>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px 80px" }}>

        {/* ── 완료 ── */}
        {step === 5 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>{isEditMode ? "수정 완료!" : "설문지 제출 완료!"}</h2>
            <p style={{ color: "#888", fontSize: 14, lineHeight: 1.8 }}>
              {isEditMode ? "설문지가 성공적으로 수정됐어요." : `${pt.name}님, 설문지가 성공적으로 제출됐어요.`}<br />
              {!isEditMode && isNewMember && "회원 정보가 자동으로 등록됐어요.\n"}트레이너가 내용을 확인할 예정이에요.
            </p>
          </div>
        )}

        {/* ── STEP 0: PT 회원설문지 ── */}
        {step === 0 && (
          <div>
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: "16px", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: "0 0 4px", color: "#4ECDC4" }}>PT 회원 설문지</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#888" }}>작성하신 내용은 트레이닝 설계에만 활용됩니다</p>
            </div>

            {/* ① 기본정보 */}
            <SectionTitle>기본 정보</SectionTitle>
            <Card>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field>
                  <Label required>이름</Label>
                  <input id="field-name" value={pt.name} onChange={e => setPtField("name", e.target.value)} placeholder="홍길동" style={iStyle} />
                </Field>
                <Field>
                  <Label required>연락처</Label>
                  <input id="field-phone" value={pt.phone} onChange={e => setPtField("phone", e.target.value)} placeholder="010-0000-0000" style={iStyle} inputMode="tel" />
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <Field>
                  <Label>생년월일</Label>
                  <input value={pt.birth} onChange={e => setPtField("birth", formatBirth(e.target.value))}
                    placeholder="1993.12.02" maxLength={10} inputMode="numeric" style={{ ...iStyle, letterSpacing: 1 }} />
                </Field>
                <Field>
                  <Label>성별</Label>
                  <ChipGroup options={["남성","여성"]} value={pt.gender} onChange={v => setPtField("gender", v)} />
                </Field>
                <Field>
                  <Label>직업</Label>
                  <input value={pt.job} onChange={e => setPtField("job", e.target.value)} placeholder="직장인" style={iStyle} />
                </Field>
              </div>
            </Card>

            {/* ② 운동목적 */}
            <SectionTitle color="#FFA500">운동 목적</SectionTitle>
            <Card>
              <Field>
                <Label>해당하는 항목을 모두 선택해주세요</Label>
                <ChipGroup multi options={["체중감량","근육증가","체형교정","건강유지","재활·회복","스트레스해소","체력향상","기타"]} value={pt.goal} onChange={v => setPtField("goal", v)} />
              </Field>
              {pt.goal.includes("기타") && (
                <Field><Label>기타 목적</Label><input value={pt.goalOther} onChange={e => setPtField("goalOther", e.target.value)} placeholder="직접 입력" style={iStyle} /></Field>
              )}
            </Card>

            {/* ③ 운동경험 */}
            <SectionTitle color="#6BCB77">운동 경험</SectionTitle>
            <Card>
              <Field><Label>운동 경력</Label><ChipGroup options={["없음","1년미만","1-3년","3년이상"]} value={pt.expYears} onChange={v => setPtField("expYears", v)} /></Field>
              <Field><Label>주당 운동 빈도</Label><ChipGroup options={["거의없음","주 1회","주 2-3회","주 4-5회","매일"]} value={pt.freq} onChange={v => setPtField("freq", v)} /></Field>
              <Field>
                <Label>운동 경험 (복수 선택)</Label>
                <ChipGroup multi options={["웨이트","유산소","필라테스","요가","수영","구기종목","크로스핏","무술·격투기","기타"]} value={pt.extype} onChange={v => setPtField("extype", v)} />
              </Field>
              {pt.extype.includes("기타") && (
                <Field><Label>기타 운동</Label><input value={pt.extypeOther} onChange={e => setPtField("extypeOther", e.target.value)} placeholder="직접 입력" style={iStyle} /></Field>
              )}
            </Card>

            {/* ④ 건강상태 */}
            <SectionTitle color="#FF6B6B">건강 상태</SectionTitle>
            <Card>
              <Field>
                <Label>복용 중인 약 (해당 시 기재)</Label>
                <input value={pt.medication} onChange={e => setPtField("medication", e.target.value)} placeholder="예) 혈압약, 당뇨약 / 없으면 '없음'" style={iStyle} />
              </Field>
              <Field>
                <Label>통증·불편한 부위 — 해당 부위를 직접 터치해주세요</Label>
                <BodyMap value={pt.painZones} onChange={v => setPtField("painZones", v)} noPain={pt.noPain} onNoPain={v => setPtField("noPain", v)} gender={pt.gender} />
              </Field>
              <Field>
                <Label>상세 설명 (수술 이력, 통증 강도 등)</Label>
                <textarea value={pt.healthDetail} onChange={e => setPtField("healthDetail", e.target.value)}
                  placeholder="예) 2022년 무릎 반월판 수술, 현재 일상생활은 가능하나 쪼그려 앉기 어려움"
                  rows={3} style={{ ...iStyle, resize: "vertical", lineHeight: 1.6 }} />
              </Field>
            </Card>

            {/* ⑥ 생활습관 */}
            <SectionTitle>생활 습관</SectionTitle>
            <Card>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <Field><Label>하루 평균 수면 시간</Label><ChipGroup options={["5h미만","5-6h","7-8h","9h이상"]} value={pt.sleep} onChange={v => setPtField("sleep", v)} /></Field>
                <Field><Label>하루 평균 식사 횟수</Label><ChipGroup options={["1회","2회","3회","4회+"]} value={pt.meal} onChange={v => setPtField("meal", v)} /></Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <Field><Label>흡연 여부</Label><ChipGroup options={["비흡연","흡연","금연중"]} value={pt.smoke} onChange={v => setPtField("smoke", v)} /></Field>
                <Field><Label>음주 빈도</Label><ChipGroup options={["거의없음","월1-2회","주1-2회","주3회+"]} value={pt.drink} onChange={v => setPtField("drink", v)} /></Field>
              </div>
              <Field><Label>직업 활동 강도</Label><ChipGroup options={["주로 앉아있음","보통 (보행포함)","활동적 (서서일함)","매우 활동적"]} value={pt.activity} onChange={v => setPtField("activity", v)} /></Field>
            </Card>

            {/* ⑦ 자가평가 */}
            <SectionTitle color="#F9CA24">현재 상태 자가 평가</SectionTitle>
            <Card>
              <Field><Label>현재 스트레스 수준</Label><ScaleGroup value={pt.stress} onChange={v => setPtField("stress", v)} lowLabel="매우 낮음" highLabel="매우 높음" /></Field>
              <Field><Label>운동 동기 / 의지</Label><ScaleGroup value={pt.motive} onChange={v => setPtField("motive", v)} lowLabel="의지 없음" highLabel="매우 강함" /></Field>
            </Card>

            {/* ⑧ 트레이닝 희망사항 */}
            <SectionTitle color="#4D96FF">트레이닝 희망 사항</SectionTitle>
            <Card>
              <Field><Label>선호하는 수업 시간대</Label><ChipGroup multi options={["이른아침(06-09시)","오전(09-12시)","오후(12-17시)","저녁(17-21시)","주말"]} value={pt.timeSlot} onChange={v => setPtField("timeSlot", v)} /></Field>
              <Field>
                <Label>이전 PT 경험이 있으신가요?</Label>
                <ChipGroup options={["있음","없음"]} value={pt.ptExp} onChange={v => setPtField("ptExp", v)} />
              </Field>
              {pt.ptExp === "있음" && (
                <div style={{ marginTop: 12, padding: 16, background: "#0F1117", borderRadius: 12, borderLeft: "3px solid #4ECDC4" }}>
                  <div style={{ fontSize: 12, color: "#4ECDC4", fontWeight: 700, marginBottom: 14, letterSpacing: 0.8 }}>이전 PT 경험 상세</div>
                  <Field><Label>PT를 그만하게 된 이유</Label><ChipGroup multi options={["비용부담","목표달성","일정안맞음","트레이너변경","효과부족","부상","기타"]} value={pt.ptQuitReason} onChange={v => setPtField("ptQuitReason", v)} /></Field>
                  {pt.ptQuitReason.includes("기타") && <Field><input value={pt.ptQuitOther} onChange={e => setPtField("ptQuitOther", e.target.value)} placeholder="직접 입력" style={iStyle} /></Field>}
                  <Field><Label>만족스럽지 못했던 점</Label><ChipGroup multi options={["강도부족","강도과함","소통부족","프로그램단조로움","목표미반영","피드백부족","시간지연","기타"]} value={pt.ptDissatisfy} onChange={v => setPtField("ptDissatisfy", v)} /></Field>
                  {pt.ptDissatisfy.includes("기타") && <Field><input value={pt.ptDisOther} onChange={e => setPtField("ptDisOther", e.target.value)} placeholder="직접 입력" style={iStyle} /></Field>}
                  <Field><Label>이번 PT에서 이전과 달랐으면 하는 점</Label><textarea value={pt.ptImprove} onChange={e => setPtField("ptImprove", e.target.value)} placeholder="자유롭게 작성해주세요" rows={3} style={{ ...iStyle, resize: "vertical", lineHeight: 1.6 }} /></Field>
                </div>
              )}
              <Field style={{ marginTop: 16 }}><Label>PT 등록 이유 / 기대하는 점</Label><textarea value={pt.expectation} onChange={e => setPtField("expectation", e.target.value)} placeholder="예) 혼자 운동할 때 자세가 불안해서 배우고 싶습니다." rows={3} style={{ ...iStyle, resize: "vertical", lineHeight: 1.6 }} /></Field>
              <Field><Label>트레이너에게 전달할 사항</Label><textarea value={pt.note} onChange={e => setPtField("note", e.target.value)} placeholder="부상 이력, 특이 사항, 기타 요청 사항을 자유롭게 적어주세요." rows={3} style={{ ...iStyle, resize: "vertical", lineHeight: 1.6 }} /></Field>
            </Card>

            {/* ⑨ 개인정보동의 */}
            <SectionTitle>개인정보 동의</SectionTitle>
            <div id="field-agree" onClick={() => setPtField("agree", !pt.agree)}
              style={{ display: "flex", alignItems: "flex-start", gap: 14, background: "#151821", border: "1px solid " + (pt.agree ? "#4ECDC4" : "#2A2D3E"), borderRadius: 12, padding: "16px 18px", cursor: "pointer", marginBottom: 24 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, border: "2px solid " + (pt.agree ? "#4ECDC4" : "#555"), background: pt.agree ? "#4ECDC4" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                {pt.agree && <span style={{ color: "#0F1117", fontWeight: 900, fontSize: 14 }}>✓</span>}
              </div>
              <div style={{ fontSize: 13, color: "#888", lineHeight: 1.7 }}>
                <strong style={{ color: "#E8E8E8" }}>개인정보 수집·이용에 동의합니다.</strong><br />
                수집 항목: 이름, 연락처, 신체 정보, 건강 정보 | 이용 목적: 운동 프로그램 설계 및 회원 관리
              </div>
            </div>

            <button onClick={handlePtNext}
              style={{ width: "100%", background: isPtBasicFilled ? "#4ECDC4" : "#2A2D3E", color: isPtBasicFilled ? "#0F1117" : "#555", border: "none", borderRadius: 12, padding: "16px", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: font }}>
              다음 → PAR-Q 설문지
            </button>
            {!isPtBasicFilled && <p style={{ textAlign: "center", fontSize: 12, color: "#FF6B6B", marginTop: 8 }}>미입력 항목을 눌러 확인해주세요</p>}
          </div>
        )}

        {/* ── STEP 1: PAR-Q ── */}
        {step === 1 && (
          <div>
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: "16px", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 900, margin: "0 0 6px", color: "#4ECDC4" }}>신체활동 준비도 설문지 (PAR-Q)</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#888", lineHeight: 1.6 }}>각 문항에 정직하게 답해주세요. 하나라도 '그렇다'이면 추가 질문이 이어집니다.</p>
            </div>
            {PAR_Q_QUESTIONS.map((q, i) => (
              <div key={i} id={`field-parq-${i}`}>
                <YesNo index={i + 1} label={q} value={parqAnswers[i]}
                  onChange={v => { const a = [...parqAnswers]; a[i] = v; setParqAnswers(a); }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => goNext(0)} style={{ flex: 1, background: "#2A2D3E", border: "none", borderRadius: 12, padding: "14px", color: "#E8E8E8", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: font }}>← 이전</button>
              <button onClick={handleParqNextSafe}
                style={{ flex: 2, background: isParqComplete ? "#4ECDC4" : "#2A2D3E", color: isParqComplete ? "#0F1117" : "#555", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: font }}>
                {isParqComplete ? (parqHasYes ? "다음 → PAR-Q+" : "다음 → 개인정보 동의") : "다음 →"}
              </button>
            </div>
            {!isParqComplete && <p style={{ textAlign: "center", fontSize: 12, color: "#FF6B6B", marginTop: 8 }}>미응답 항목을 눌러 확인해주세요</p>}
          </div>
        )}

        {/* ── STEP 2: PAR-Q+ (그렇다 있을 때만) ── */}
        {step === 2 && (
          <div>
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: "16px", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 900, margin: "0 0 6px", color: "#A78BFA" }}>PAR-Q+ 추가 질문</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#888", lineHeight: 1.6 }}>PAR-Q에서 '그렇다'가 있어 추가 질문이 필요해요. 해당되는 항목에 모두 답해주세요.</p>
            </div>

            {/* PAR-Q+ 일반 7문항 */}
            <div style={{ background: "#151821", border: "1px solid #2A2D3E", borderRadius: 12, padding: "14px", marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#A78BFA", fontWeight: 700, margin: "0 0 14px" }}>일반 건강 질문 (PAR-Q+ 1/4)</p>
              {PAR_Q_PLUS_GENERAL.map((q, i) => (
                <div key={i} id={`field-parqplus-${i}`}>
                  <YesNo index={i + 1} label={q} value={parqPlusGeneral[i]} color="#A78BFA"
                    onChange={v => { const a = [...parqPlusGeneral]; a[i] = v; setParqPlusGeneral(a); }} />
                  {i === 3 && parqPlusGeneral[i] === true && (
                    <div style={{ marginTop: -6, marginBottom: 12 }}>
                      <textarea value={disease4Note} onChange={e => setDisease4Note(e.target.value)} placeholder="질환에 대해 기술하세요" rows={2} style={{ ...iStyle, resize: "none" }} />
                    </div>
                  )}
                  {i === 4 && parqPlusGeneral[i] === true && (
                    <div style={{ marginTop: -6, marginBottom: 12 }}>
                      <textarea value={disease5Note} onChange={e => setDisease5Note(e.target.value)} placeholder="질병과 약에 대해 기술하세요" rows={2} style={{ ...iStyle, resize: "none" }} />
                    </div>
                  )}
                  {i === 5 && parqPlusGeneral[i] === true && (
                    <div style={{ marginTop: -6, marginBottom: 12 }}>
                      <textarea value={disease6Note} onChange={e => setDisease6Note(e.target.value)} placeholder="질환에 대해 기술하세요" rows={2} style={{ ...iStyle, resize: "none" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* PAR-Q+ 추가 질문 */}
            <div style={{ background: "#151821", border: "1px solid #2A2D3E", borderRadius: 12, padding: "14px", marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#FFA500", fontWeight: 700, margin: "0 0 14px" }}>세부 질환 질문 (PAR-Q+ 2~3/4)</p>
              {PAR_Q_PLUS_FOLLOWUP.map(group => {
                const mainKey = `${group.id}_main`;
                const mainVal = parqPlusFollowup[mainKey];
                return (
                  <div key={group.id} style={{ marginBottom: 14 }}>
                    <div style={{ background: "#0F1117", border: "1px solid #2A2D3E", borderRadius: 10, padding: "12px 14px", marginBottom: 6 }}>
                      <p style={{ margin: "0 0 10px", fontSize: 13, lineHeight: 1.6, color: "#E8E8E8" }}>{group.main}</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        {["그렇다","아니다"].map(opt => {
                          const isYes = opt === "그렇다";
                          const sel = mainVal === isYes;
                          return (
                            <button key={opt} type="button" onClick={() => setParqPlusFollowup(prev => ({ ...prev, [mainKey]: isYes }))}
                              style={{ flex: 1, padding: "9px", border: "2px solid " + (sel ? (isYes ? "#FF6B6B" : "#4ECDC4") : "#2A2D3E"), borderRadius: 8, background: sel ? (isYes ? "#FF6B6B22" : "#4ECDC422") : "#151821", color: sel ? (isYes ? "#FF6B6B" : "#4ECDC4") : "#888", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: font }}>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {mainVal === true && (
                      <div style={{ paddingLeft: 10, borderLeft: "2px solid #FFA50044" }}>
                        {group.subs.map((sub, si) => {
                          const subKey = `${group.id}_${si}`;
                          const subVal = parqPlusFollowup[subKey];
                          return (
                            <div key={si} style={{ background: "#0A0A12", border: "1px solid #1E2133", borderRadius: 8, padding: "10px 12px", marginBottom: 6 }}>
                              <p style={{ margin: "0 0 8px", fontSize: 12, lineHeight: 1.6, color: "#A0A0A0" }}>{sub}</p>
                              <div style={{ display: "flex", gap: 8 }}>
                                {["그렇다","아니다"].map(opt => {
                                  const isYes = opt === "그렇다";
                                  const sel = subVal === isYes;
                                  return (
                                    <button key={opt} type="button" onClick={() => setParqPlusFollowup(prev => ({ ...prev, [subKey]: isYes }))}
                                      style={{ flex: 1, padding: "7px", border: "2px solid " + (sel ? (isYes ? "#FF6B6B" : "#4ECDC4") : "#1E2133"), borderRadius: 7, background: sel ? (isYes ? "#FF6B6B22" : "#4ECDC422") : "#0F1117", color: sel ? (isYes ? "#FF6B6B" : "#4ECDC4") : "#888", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: font }}>
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => goNext(1)} style={{ flex: 1, background: "#2A2D3E", border: "none", borderRadius: 12, padding: "14px", color: "#E8E8E8", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: font }}>← 이전</button>
              <button onClick={handleParqPlusNextSafe}
                style={{ flex: 2, background: isParqPlusComplete ? "#A78BFA" : "#2A2D3E", color: isParqPlusComplete ? "#0F1117" : "#555", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: font }}>
                다음 → 개인정보 동의
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: 개인정보 동의 ── */}
        {step === 3 && (
          <div>
            <div style={{ background: "#151821", border: "1px solid #4ECDC433", borderRadius: 16, padding: "20px", marginBottom: 20, textAlign: "center" }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: "0 0 6px", color: "#4ECDC4" }}>개인정보 수집·이용 동의서</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#888", lineHeight: 1.8 }}>PT 서비스 제공을 위해 아래와 같이<br />개인정보를 수집·이용합니다.</p>
            </div>

            {/* 트레이너 정보 */}
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
              {[["트레이너", trainerName || "담당 트레이너"], ["작성일", new Date().toLocaleDateString("ko-KR")]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: k !== "작성일" ? "1px solid #1E2133" : "none", fontSize: 13 }}>
                  <span style={{ color: "#888" }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* 수집 항목 */}
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#4ECDC4", marginBottom: 12 }}>📋 수집하는 개인정보 항목 및 목적</div>
              {[
                ["이름, 연락처, 생년월일, 성별", "회원 식별 및 PT 서비스 제공", "서비스 종료 후 1년"],
                ["건강 상태, 통증 부위, 운동 이력", "맞춤 운동 프로그램 설계", "서비스 종료 후 1년"],
                ["인바디 측정 결과", "체성분 변화 추적 및 분석", "서비스 종료 후 1년"],
                ["직업, 생활습관", "종합적 건강 관리", "서비스 종료 후 1년"],
              ].map(([item, purpose, period], i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: i < 3 ? "1px solid #1E2133" : "none" }}>
                  <div style={{ fontSize: 12, color: "#E8E8E8", marginBottom: 3 }}>{item}</div>
                  <div style={{ fontSize: 11, color: "#555" }}>목적: {purpose} · 보유: {period}</div>
                </div>
              ))}
            </div>

            {/* 권리 안내 */}
            <div style={{ background: "#FF6B6B12", border: "1px solid #FF6B6B33", borderRadius: 12, padding: "12px 14px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "#FF6B6B", fontWeight: 700, marginBottom: 6 }}>⚠️ 민감정보 안내</div>
              <div style={{ fontSize: 12, color: "#C0C0C0", lineHeight: 1.7 }}>건강 상태, 통증 부위 등 민감한 개인정보가 포함되며, PT 서비스 목적 외에는 사용되지 않습니다. 동의를 거부할 권리가 있으나 서비스 이용이 제한될 수 있습니다.</div>
            </div>

            {/* 필수 동의 1 */}
            <div onClick={() => setAgree1(!agree1)} style={{ background: "#151821", border: "1px solid " + (agree1 ? "#4ECDC4" : "#1E2133"), borderRadius: 12, padding: "14px 16px", marginBottom: 10, cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start", transition: "all 0.2s" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: "2px solid " + (agree1 ? "#4ECDC4" : "#2A2D3E"), background: agree1 ? "#4ECDC4" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                {agree1 && <span style={{ color: "#0F1117", fontWeight: 900, fontSize: 13 }}>✓</span>}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, display: "flex", gap: 6, alignItems: "center" }}>
                  개인정보 수집·이용 동의
                  <span style={{ fontSize: 10, padding: "2px 6px", background: "#FF6B6B22", color: "#FF6B6B", borderRadius: 4, fontWeight: 700 }}>필수</span>
                </div>
                <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>이름, 연락처, 생년월일, 성별, 건강정보를 PT 서비스 제공 목적으로 수집·이용하는 것에 동의합니다.</div>
              </div>
            </div>

            {/* 필수 동의 2 */}
            <div onClick={() => setAgree2(!agree2)} style={{ background: "#151821", border: "1px solid " + (agree2 ? "#4ECDC4" : "#1E2133"), borderRadius: 12, padding: "14px 16px", marginBottom: 24, cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start", transition: "all 0.2s" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: "2px solid " + (agree2 ? "#4ECDC4" : "#2A2D3E"), background: agree2 ? "#4ECDC4" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                {agree2 && <span style={{ color: "#0F1117", fontWeight: 900, fontSize: 13 }}>✓</span>}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, display: "flex", gap: 6, alignItems: "center" }}>
                  민감정보 수집·이용 동의
                  <span style={{ fontSize: 10, padding: "2px 6px", background: "#FF6B6B22", color: "#FF6B6B", borderRadius: 4, fontWeight: 700 }}>필수</span>
                </div>
                <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>건강 상태, 통증 부위, 인바디 측정 결과 등 민감정보를 수집·이용하는 것에 동의합니다.</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => goNext(parqHasYes ? 2 : 1)} style={{ flex: 1, background: "#2A2D3E", border: "none", borderRadius: 12, padding: "14px", color: "#E8E8E8", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: font }}>← 이전</button>
              <button onClick={() => goNext(4)} disabled={!agree1 || !agree2}
                style={{ flex: 2, background: agree1 && agree2 ? "#4ECDC4" : "#2A2D3E", color: agree1 && agree2 ? "#0F1117" : "#555", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 16, cursor: agree1 && agree2 ? "pointer" : "not-allowed", fontFamily: font }}>
                다음 → 서명
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: 서명 ── */}
        {step === 4 && (
          <div>
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: "16px", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 900, margin: "0 0 6px", color: "#F9CA24" }}>참여자 선언 및 서명</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#888", lineHeight: 1.8 }}>
                본인은 이 설문지를 충분히 이해하고 정직하게 작성하였으며,
                이 신체활동 허가는 완료일로부터 최대 12개월간 유효하고
                건강상태가 변경되면 무효가 됨을 인정합니다.
              </p>
            </div>
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#888" }}>이름</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{pt.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#888" }}>날짜</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{new Date().toLocaleDateString("ko-KR")}</span>
              </div>
            </div>
            {signature ? (
              <div>
                <div style={{ background: "#151821", border: "1px solid #4ECDC4", borderRadius: 12, padding: 12, marginBottom: 16 }}>
                  <img src={signature} alt="서명" style={{ width: "100%", borderRadius: 8 }} />
                </div>
                <button onClick={() => setSignature(null)} style={{ width: "100%", background: "#2A2D3E", border: "none", borderRadius: 10, padding: "10px", color: "#888", fontSize: 14, cursor: "pointer", fontFamily: font, marginBottom: 12 }}>서명 다시하기</button>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => goNext(3)} style={{ flex: 1, background: "#2A2D3E", border: "none", borderRadius: 12, padding: "14px", color: "#E8E8E8", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: font }}>← 이전</button>
                  <button onClick={submit} disabled={submitting}
                    style={{ flex: 2, background: submitting ? "#2A2D3E" : "#4ECDC4", color: submitting ? "#555" : "#0F1117", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 16, cursor: submitting ? "not-allowed" : "pointer", fontFamily: font }}>
                    {submitting ? "제출 중..." : "제출하기 ✓"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>아래 서명란에 서명해 주세요</p>
                <SignaturePad onSave={setSignature} />
                <button onClick={() => goNext(3)} style={{ width: "100%", background: "#2A2D3E", border: "none", borderRadius: 12, padding: "14px", color: "#E8E8E8", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: font, marginTop: 12 }}>← 이전</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
