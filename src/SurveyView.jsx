import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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
  { id: "q1", main: "관절염, 골다공증, 또는 허리에 문제가 있습니까?" },
  { id: "q2", main: "어떤 종류의 암을 지니고 있습니까?" },
  { id: "q3", main: "심장이나 심혈관질환이 있습니까? (관상동맥질환, 심장마비, 부정맥)" },
  { id: "q4", main: "고혈압이 있습니까?" },
  { id: "q5", main: "대사질환이 있습니까? (1형/2형 당뇨병, 전 당뇨병)" },
  { id: "q6", main: "정신건강 문제나 학습장애가 있습니까? (알츠하이머, 치매, 우울증, 불안장애 등)" },
  { id: "q7", main: "호흡기 질환이 있습니까? (COPD, 천식, 폐고혈압)" },
  { id: "q8", main: "척추 손상이 있습니까? (사지마비, 하반신 마비)" },
  { id: "q9", main: "뇌졸중이 있었습니까? (TIA 또는 뇌혈관사고)" },
  { id: "q10", main: "기타 질환 또는 두 가지 이상의 질병이 있습니까?" },
];

const ReadChip = ({ label, selected, color = "#4ECDC4" }) => (
  <span style={{
    padding: "8px 16px", border: "1px solid " + (selected ? color : "#2A2D3E"),
    borderRadius: 100, background: selected ? color + "22" : "#1A1D27",
    color: selected ? color : "#555", fontWeight: selected ? 700 : 400,
    fontSize: 13, display: "inline-block", margin: "4px",
  }}>
    {selected ? "✓ " : ""}{label}
  </span>
);

const ReadScale = ({ value, lowLabel, highLabel }) => (
  <div>
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <div key={n} style={{
          width: 44, height: 44, border: "1px solid " + (value === String(n) ? "#4ECDC4" : "#2A2D3E"),
          borderRadius: 10, background: value === String(n) ? "#4ECDC422" : "#1A1D27",
          color: value === String(n) ? "#4ECDC4" : "#555",
          fontWeight: value === String(n) ? 700 : 400,
          fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font,
        }}>{n}</div>
      ))}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#555" }}>
      <span>{lowLabel}</span><span>{highLabel}</span>
    </div>
  </div>
);

const ReadYesNo = ({ value, label, index, color = "#4ECDC4" }) => (
  <div style={{ marginBottom: 12, background: "#151821", border: "1px solid #2A2D3E", borderRadius: 12, padding: "14px 16px" }}>
    <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.6, color: "#E8E8E8", fontFamily: font }}>
      {index && <span style={{ color, fontWeight: 700, marginRight: 8 }}>{index}.</span>}{label}
    </p>
    <div style={{ display: "flex", gap: 10 }}>
      {["그렇다", "아니다"].map(opt => {
        const isYes = opt === "그렇다";
        const sel = value === isYes;
        return (
          <div key={opt} style={{
            flex: 1, padding: "10px", textAlign: "center",
            border: "2px solid " + (sel ? (isYes ? "#FF6B6B" : "#4ECDC4") : "#2A2D3E"),
            borderRadius: 10, background: sel ? (isYes ? "#FF6B6B22" : "#4ECDC422") : "#0F1117",
            color: sel ? (isYes ? "#FF6B6B" : "#4ECDC4") : "#555",
            fontWeight: sel ? 700 : 400, fontSize: 15, fontFamily: font,
          }}>{opt}</div>
        );
      })}
    </div>
  </div>
);

const SectionTitle = ({ children, color = "#4ECDC4" }) => (
  <div style={{ fontSize: 14, fontWeight: 900, color, margin: "20px 0 10px", paddingBottom: 8, borderBottom: "1px solid #1E2133" }}>
    {children}
  </div>
);

const Card = ({ children }) => (
  <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: "18px", marginBottom: 16 }}>
    {children}
  </div>
);

const FieldRow = ({ label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 15, color: "#E8E8E8", fontWeight: 500, lineHeight: 1.6 }}>{value}</div>
    </div>
  );
};

export default function SurveyView() {
  const { memberId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, "surveys", memberId)).then(snap => {
      if (snap.exists()) setSurvey({ id: snap.id, ...snap.data() });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [memberId]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0F1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet" />
      <div style={{ width: 32, height: 32, border: "3px solid #2A2D3E", borderTop: "3px solid #4ECDC4", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!survey) return (
    <div style={{ minHeight: "100vh", background: "#0F1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#888", fontFamily: font }}>설문지를 찾을 수 없어요.</p>
    </div>
  );

  const { pt, parqAnswers, parqHasYes, parqPlusGeneral, parqPlusFollowup,
    disease4Note, disease5Note, disease6Note, signature, submittedAt } = survey;

  return (
    <div style={{ minHeight: "100vh", background: "#0F1117", color: "#E8E8E8", fontFamily: font }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{-webkit-tap-highlight-color:transparent}`}</style>

      <header style={{ background: "#0F1117", borderBottom: "1px solid #1E2030", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: "#4ECDC4", letterSpacing: 4 }}>FORMA</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, padding: "3px 8px", background: "#151821", color: "#555", borderRadius: 6 }}>읽기전용</span>
          <span style={{ fontSize: 11, padding: "3px 8px", background: "#4ECDC422", color: "#4ECDC4", borderRadius: 6, fontWeight: 700 }}>
            {submittedAt?.toDate?.()?.toLocaleDateString("ko-KR") || ""}
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* 제출자 정보 */}
        <div style={{ background: "#151821", border: "1px solid #4ECDC433", borderRadius: 16, padding: "16px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{pt?.name ?? survey.memberName}님</div>
              <div style={{ fontSize: 13, color: "#888" }}>설문지 제출 완료</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, background: parqHasYes ? "#FF6B6B22" : "#4ECDC422", color: parqHasYes ? "#FF6B6B" : "#4ECDC4" }}>
                PAR-Q {parqHasYes ? "⚠️ 주의" : "✅ 정상"}
              </span>
              {parqHasYes && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, background: survey.parqPlusHasYes ? "#FF6B6B22" : "#4ECDC422", color: survey.parqPlusHasYes ? "#FF6B6B" : "#4ECDC4" }}>
                  PAR-Q+ {survey.parqPlusHasYes ? "⚠️ 주의" : "✅ 정상"}
                </span>
              )}
            </div>
          </div>
        </div>

        {pt && (
          <>
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: "16px", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: "0 0 4px", color: "#4ECDC4" }}>PT 회원 설문지</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#888" }}>회원이 직접 작성한 내용입니다</p>
            </div>

            <SectionTitle>기본 정보</SectionTitle>
            <Card>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <FieldRow label="이름" value={pt.name} />
                <FieldRow label="연락처" value={pt.phone} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <FieldRow label="생년월일" value={pt.birth} />
                <FieldRow label="성별" value={pt.gender} />
                <FieldRow label="직업" value={pt.job} />
              </div>
            </Card>

            <SectionTitle color="#FFA500">운동 목적</SectionTitle>
            <Card>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>선택 항목</div>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {["체중감량","근육증가","체형교정","건강유지","재활·회복","스트레스해소","체력향상","기타"].map(opt => (
                  <ReadChip key={opt} label={opt} selected={(pt.goal || []).includes(opt)} color="#FFA500" />
                ))}
              </div>
              {pt.goalOther && <div style={{ fontSize: 13, color: "#E8E8E8", marginTop: 8 }}>기타: {pt.goalOther}</div>}
            </Card>

            <SectionTitle color="#6BCB77">운동 경험</SectionTitle>
            <Card>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>운동 경력</div>
              <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 14 }}>
                {["없음","1년미만","1-3년","3년이상"].map(opt => <ReadChip key={opt} label={opt} selected={pt.expYears === opt} color="#6BCB77" />)}
              </div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>주당 운동 빈도</div>
              <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 14 }}>
                {["거의없음","주 1회","주 2-3회","주 4-5회","매일"].map(opt => <ReadChip key={opt} label={opt} selected={pt.freq === opt} color="#6BCB77" />)}
              </div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>운동 경험</div>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {["웨이트","유산소","필라테스","요가","수영","구기종목","크로스핏","무술·격투기","기타"].map(opt => (
                  <ReadChip key={opt} label={opt} selected={(pt.extype || []).includes(opt)} color="#6BCB77" />
                ))}
              </div>
              {pt.extypeOther && <div style={{ fontSize: 13, color: "#E8E8E8", marginTop: 8 }}>기타: {pt.extypeOther}</div>}
            </Card>

            <SectionTitle color="#FF6B6B">건강 상태</SectionTitle>
            <Card>
              {pt.medication && <FieldRow label="복용 중인 약" value={pt.medication} />}
              {(pt.painZones?.length > 0) && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>통증·불편한 부위</div>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {(pt.painZones || []).map(z => (
                      <span key={z} style={{ padding: "6px 12px", background: "#FF6B6B22", color: "#FF6B6B", borderRadius: 20, fontSize: 13, fontWeight: 700, margin: "3px" }}>{z}</span>
                    ))}
                  </div>
                </div>
              )}
              {pt.noPain && <div style={{ fontSize: 13, color: "#4ECDC4", marginBottom: 10 }}>✅ 통증 없음</div>}
              {pt.healthDetail && <FieldRow label="상세 설명" value={pt.healthDetail} />}
            </Card>

            <SectionTitle>생활 습관</SectionTitle>
            <Card>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>수면 시간</div>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {["5h미만","5-6h","7-8h","9h이상"].map(opt => <ReadChip key={opt} label={opt} selected={pt.sleep === opt} />)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>식사 횟수</div>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {["1회","2회","3회","4회+"].map(opt => <ReadChip key={opt} label={opt} selected={pt.meal === opt} />)}
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>흡연 여부</div>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {["비흡연","흡연","금연중"].map(opt => <ReadChip key={opt} label={opt} selected={pt.smoke === opt} />)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>음주 빈도</div>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {["거의없음","월1-2회","주1-2회","주3회+"].map(opt => <ReadChip key={opt} label={opt} selected={pt.drink === opt} />)}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>직업 활동 강도</div>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {["주로 앉아있음","보통 (보행포함)","활동적 (서서일함)","매우 활동적"].map(opt => <ReadChip key={opt} label={opt} selected={pt.activity === opt} />)}
              </div>
            </Card>

            <SectionTitle color="#F9CA24">현재 상태 자가 평가</SectionTitle>
            <Card>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>스트레스 수준</div>
                <ReadScale value={pt.stress} lowLabel="매우 낮음" highLabel="매우 높음" />
              </div>
              <div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>운동 동기 / 의지</div>
                <ReadScale value={pt.motive} lowLabel="의지 없음" highLabel="매우 강함" />
              </div>
            </Card>

            <SectionTitle color="#4D96FF">트레이닝 희망 사항</SectionTitle>
            <Card>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>선호 수업 시간대</div>
              <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 14 }}>
                {["이른아침(06-09시)","오전(09-12시)","오후(12-17시)","저녁(17-21시)","주말"].map(opt => (
                  <ReadChip key={opt} label={opt} selected={(pt.timeSlot || []).includes(opt)} color="#4D96FF" />
                ))}
              </div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>PT 경험</div>
              <div style={{ display: "flex", flexWrap: "wrap", marginBottom: pt.ptExp === "있음" ? 14 : 0 }}>
                {["있음","없음"].map(opt => <ReadChip key={opt} label={opt} selected={pt.ptExp === opt} color="#4D96FF" />)}
              </div>
              {pt.ptExp === "있음" && (
                <div style={{ padding: 16, background: "#0F1117", borderRadius: 12, borderLeft: "3px solid #4ECDC4", marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: "#4ECDC4", fontWeight: 700, marginBottom: 12 }}>이전 PT 경험 상세</div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>그만하게 된 이유</div>
                  <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 10 }}>
                    {["비용부담","목표달성","일정안맞음","트레이너변경","효과부족","부상","기타"].map(opt => (
                      <ReadChip key={opt} label={opt} selected={(pt.ptQuitReason || []).includes(opt)} color="#4ECDC4" />
                    ))}
                  </div>
                  {pt.ptQuitOther && <div style={{ fontSize: 13, color: "#E8E8E8", marginBottom: 10 }}>기타: {pt.ptQuitOther}</div>}
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>만족스럽지 못했던 점</div>
                  <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 10 }}>
                    {["강도부족","강도과함","소통부족","프로그램단조로움","목표미반영","피드백부족","시간지연","기타"].map(opt => (
                      <ReadChip key={opt} label={opt} selected={(pt.ptDissatisfy || []).includes(opt)} color="#A78BFA" />
                    ))}
                  </div>
                  {pt.ptDisOther && <div style={{ fontSize: 13, color: "#E8E8E8", marginBottom: 10 }}>기타: {pt.ptDisOther}</div>}
                  {pt.ptImprove && <FieldRow label="이번에 달랐으면 하는 점" value={pt.ptImprove} />}
                </div>
              )}
              {pt.expectation && <FieldRow label="PT 등록 이유 / 기대하는 점" value={pt.expectation} />}
              {pt.note && <FieldRow label="트레이너에게 전달할 사항" value={pt.note} />}
            </Card>

            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#151821", border: "1px solid #4ECDC4", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, border: "2px solid #4ECDC4", background: "#4ECDC4", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#0F1117", fontWeight: 900, fontSize: 14 }}>✓</span>
              </div>
              <div style={{ fontSize: 13, color: "#888" }}>
                <strong style={{ color: "#E8E8E8" }}>개인정보 수집·이용에 동의했습니다.</strong>
              </div>
            </div>
          </>
        )}

        {parqAnswers && (
          <>
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: "16px", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 900, margin: "0 0 6px", color: "#4ECDC4" }}>신체활동 준비도 설문지 (PAR-Q)</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#888" }}>각 문항에 대한 답변입니다</p>
            </div>
            {PAR_Q_QUESTIONS.map((q, i) => (
              <ReadYesNo key={i} index={i + 1} label={q} value={parqAnswers[i]} />
            ))}
            {disease4Note && <div style={{ background: "#151821", borderRadius: 10, padding: "12px 14px", marginBottom: 8, fontSize: 13, color: "#888" }}>혈압/심장 처방약: <span style={{ color: "#E8E8E8" }}>{disease4Note}</span></div>}
            {disease5Note && <div style={{ background: "#151821", borderRadius: 10, padding: "12px 14px", marginBottom: 8, fontSize: 13, color: "#888" }}>뼈/관절 문제: <span style={{ color: "#E8E8E8" }}>{disease5Note}</span></div>}
            {disease6Note && <div style={{ background: "#151821", borderRadius: 10, padding: "12px 14px", marginBottom: 8, fontSize: 13, color: "#888" }}>기타 사유: <span style={{ color: "#E8E8E8" }}>{disease6Note}</span></div>}
          </>
        )}

        {parqHasYes && parqPlusGeneral && (
          <>
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: "16px", marginTop: 20, marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 900, margin: "0 0 6px", color: "#A78BFA" }}>PAR-Q+ 추가 질문</h2>
            </div>
            <div style={{ background: "#151821", border: "1px solid #2A2D3E", borderRadius: 12, padding: "14px", marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "#A78BFA", fontWeight: 700, margin: "0 0 14px" }}>일반 건강 질문</p>
              {PAR_Q_PLUS_GENERAL.map((q, i) => (
                <ReadYesNo key={i} index={i + 1} label={q} value={parqPlusGeneral[i]} color="#A78BFA" />
              ))}
            </div>
            {parqPlusFollowup && Object.keys(parqPlusFollowup).length > 0 && (
              <div style={{ background: "#151821", border: "1px solid #2A2D3E", borderRadius: 12, padding: "14px", marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: "#FFA500", fontWeight: 700, margin: "0 0 14px" }}>세부 질환 답변</p>
                {PAR_Q_PLUS_FOLLOWUP.map(group => {
                  const mainKey = `${group.id}_main`;
                  const mainVal = parqPlusFollowup[mainKey];
                  if (mainVal === undefined) return null;
                  return (
                    <div key={group.id} style={{ marginBottom: 10, background: "#0F1117", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <span style={{ fontSize: 13, color: "#C0C0C0", flex: 1, lineHeight: 1.5 }}>{group.main}</span>
                        <span style={{ fontWeight: 700, color: mainVal === true ? "#FF6B6B" : "#4ECDC4", whiteSpace: "nowrap", fontSize: 13 }}>
                          {mainVal === true ? "그렇다" : "아니다"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {signature && (
          <>
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: "16px", marginTop: 20, marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 900, margin: 0, color: "#E8E8E8" }}>✍️ 서명</h2>
            </div>
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 14, padding: "14px" }}>
              <img src={signature} alt="서명" style={{ width: "100%", borderRadius: 10, border: "1px solid #2A2D3E" }} />
            </div>
          </>
        )}

      </main>
    </div>
  );
}
