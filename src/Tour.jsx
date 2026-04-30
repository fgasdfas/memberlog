import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const font = "'Noto Sans KR', sans-serif";

export default function Tour() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const totalSteps = 7;

  const steps = [
    {
      num: "01", title: "한눈에 보이는 회원 카드",
      desc: "이름·나이·성별·운동목적 한눈에. 인바디 변화도 카드에서 바로 확인.",
      content: (
        <div style={{ background: "#0F1117", borderRadius: 10, border: "1px solid #2A2D3E", padding: "14px 12px" }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>이지은 <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>30<span style={{ display: "inline-block", width: 1, height: 9, background: "#444", verticalAlign: "middle", margin: "0 6px" }}></span>여</span></div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>🕐 오후 · 저녁</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
            <span style={{ background: "#FF6B6B22", color: "#FF6B6B", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600 }}>다이어트</span>
            <span style={{ background: "#4ECDC422", color: "#4ECDC4", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600 }}>근력강화</span>
          </div>
          <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #1E2133", fontSize: 10, color: "#888" }}>
            기록 4 · 인바디 3회 · <span style={{ color: "#4ECDC4", fontWeight: 700 }}>체중 ↓2.3kg</span>
          </div>
        </div>
      )
    },
    {
      num: "02", title: "PAR-Q 설문 링크 한 번에",
      desc: "회원에게 링크 보내면 직접 작성. 종이 출력 없이 바로 디지털화.",
      content: (
        <div style={{ background: "linear-gradient(135deg, #FF6B6B15 0%, #15182100 100%)", border: "1px solid #FF6B6B55", borderRadius: 10, padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 24 }}>📋</div>
          <div style={{ fontSize: 13, color: "#FF6B6B", fontWeight: 800, margin: "6px 0 8px" }}>아직 설문이 제출되지 않았어요</div>
          <div style={{ background: "#0F1117", padding: 7, borderRadius: 6, fontSize: 10, color: "#4ECDC4", marginBottom: 8 }}>memberlog.web.app/#/survey/...</div>
          <div style={{ background: "#4ECDC4", color: "#0F1117", padding: 8, borderRadius: 6, fontSize: 11, fontWeight: 800 }}>🔗 링크 복사</div>
        </div>
      )
    },
    {
      num: "03", title: "회원이 직접 입력 → 그래프 자동",
      desc: "측정값을 회원이 직접 입력하면 자동으로 변화 추이 그래프 생성.",
      content: (
        <div style={{ background: "#0F1117", borderRadius: 10, border: "1px solid #2A2D3E", padding: "14px 12px", height: 140 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#888" }}>체중 변화</span>
            <span style={{ fontSize: 13, color: "#4ECDC4", fontWeight: 800 }}>↓ 2.3kg</span>
          </div>
          <svg width="100%" height="80" viewBox="0 0 280 80">
            <polyline points="20,30 80,40 140,55 200,60 260,68" fill="none" stroke="#4ECDC4" strokeWidth="2" />
            <circle cx="20" cy="30" r="3" fill="#4ECDC4" />
            <circle cx="80" cy="40" r="3" fill="#4ECDC4" />
            <circle cx="140" cy="55" r="3" fill="#4ECDC4" />
            <circle cx="200" cy="60" r="3" fill="#4ECDC4" />
            <circle cx="260" cy="68" r="3" fill="#4ECDC4" />
          </svg>
        </div>
      )
    },
    {
      num: "04", title: "이런 보고서를 1초에 생성",
      desc: "실제로 만들어지는 A4 보고서 예시예요. PDF·이미지로 출력 가능.",
      content: (
        <div style={{ background: "#fafaf7", color: "#1a1a1f", borderRadius: 6, padding: "16px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 900, letterSpacing: 1 }}>FORMA</div>
              <div style={{ fontSize: 7, letterSpacing: 1, color: "#888" }}>PERSONAL TRAINING REPORT</div>
            </div>
            <div style={{ textAlign: "right", fontSize: 8, color: "#444", lineHeight: 1.5 }}>
              발행일 <strong style={{ color: "#1a1a1f", fontWeight: 700 }}>2026.04.30</strong><br/>
              담당 <strong style={{ color: "#1a1a1f", fontWeight: 700 }}>오리코치</strong>
            </div>
          </div>
          <hr style={{ border: "none", borderTop: "1px solid #1a1a1f", margin: "4px 0 10px" }} />
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 900, lineHeight: 1.1, marginBottom: 2 }}>Member Progress Report</div>
          <div style={{ fontSize: 9, color: "#888", marginBottom: 10 }}>회원 성과 분석 보고서</div>
          <div style={{ background: "#0F1117", color: "white", padding: "8px 10px", borderRadius: 4, borderLeft: "3px solid #4ECDC4", marginBottom: 12, display: "flex", gap: 18 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 7, color: "#888", letterSpacing: 1 }}>NAME</div>
              <div style={{ fontSize: 11, fontWeight: 800 }}>이지은</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 7, color: "#888", letterSpacing: 1 }}>AGE</div>
              <div style={{ fontSize: 11, fontWeight: 800 }}>30대</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 7, color: "#888", letterSpacing: 1 }}>PERIOD</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#4ECDC4" }}>8주</div>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 11, fontWeight: 900, color: "#4ECDC4", marginRight: 6 }}>02</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>KEY METRICS</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, paddingLeft: 16, marginTop: 4 }}>
              <div style={{ background: "white", border: "1px solid #e5e3de", padding: "4px 6px", borderRadius: 3 }}>
                <div style={{ fontSize: 6, color: "#888" }}>체중</div>
                <div style={{ fontSize: 8, fontWeight: 700 }}>62.3</div>
                <div style={{ fontSize: 8, color: "#4ECDC4", fontWeight: 700 }}>↓ 2.3</div>
              </div>
              <div style={{ background: "white", border: "1px solid #e5e3de", padding: "4px 6px", borderRadius: 3 }}>
                <div style={{ fontSize: 6, color: "#888" }}>골격근</div>
                <div style={{ fontSize: 8, fontWeight: 700 }}>24.5</div>
                <div style={{ fontSize: 8, color: "#4ECDC4", fontWeight: 700 }}>↑ 0.8</div>
              </div>
              <div style={{ background: "white", border: "1px solid #e5e3de", padding: "4px 6px", borderRadius: 3 }}>
                <div style={{ fontSize: 6, color: "#888" }}>체지방</div>
                <div style={{ fontSize: 8, fontWeight: 700 }}>26.4%</div>
                <div style={{ fontSize: 8, color: "#4ECDC4", fontWeight: 700 }}>↓ 3.1</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #1a1a1f", marginTop: 10, paddingTop: 6, display: "flex", justifyContent: "space-between", fontSize: 7, color: "#888" }}>
            <span><strong style={{ color: "#4ECDC4", fontFamily: "'Playfair Display', serif" }}>FORMA</strong> · PERSONAL TRAINING</span>
            <span>memberlog.web.app</span>
          </div>
        </div>
      )
    },
    {
      num: "05", title: "새 기록 들어오면 알림",
      desc: "회원이 인바디·설문을 입력하면 회원 카드에 NEW 표시.",
      content: (
        <div style={{ background: "#0F1117", borderRadius: 10, border: "1px solid #2A2D3E", padding: "14px 12px" }}>
          <div style={{ border: "2px solid #FFE600", background: "#FFE60015", borderRadius: 8, padding: 10, position: "relative" }}>
            <div style={{ position: "absolute", top: -8, left: 10, background: "#FFE600", color: "#0F1117", fontSize: 9, fontWeight: 900, padding: "2px 6px", borderRadius: 4 }}>NEW</div>
            <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>박지훈 <span style={{ fontSize: 11, color: "#888", fontWeight: 500 }}>25 | 남</span></div>
            <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>인바디 새로 입력됨 · 5분 전</div>
          </div>
        </div>
      )
    },
    {
      num: "06", title: "트레이너별 회원 분리",
      desc: "여러 트레이너가 함께 써도 본인 회원만 보여요. 폴더로도 정리 가능.",
      content: (
        <div style={{ background: "#0F1117", borderRadius: 10, border: "1px solid #2A2D3E", padding: "14px 12px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <div style={{ background: "#4ECDC4", color: "#0F1117", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>📁 회원님들 (12)</div>
            <div style={{ background: "#151821", color: "#888", padding: "6px 12px", borderRadius: 6, fontSize: 11, border: "1px solid #2A2D3E" }}>⭐ VIP (3)</div>
          </div>
          <div style={{ fontSize: 11, color: "#555" }}>트레이너마다 본인 폴더만 표시됩니다</div>
        </div>
      )
    },
    {
      num: "07", title: "시작해볼까요?",
      desc: "베타 기간 동안 무료. 카카오톡으로 문의주시면 계정 만들어드립니다.",
      content: (
        <div style={{ padding: 18, textAlign: "center", background: "linear-gradient(135deg, #4ECDC4 0%, #44A39C 100%)", borderRadius: 10, color: "#0F1117" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, letterSpacing: 2 }}>FORMA</div>
          <div style={{ fontSize: 10, letterSpacing: 2, marginTop: 4 }}>memberlog.web.app</div>
        </div>
      )
    },
  ];

  const cur = steps[step];
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "#0F1117", fontFamily: font, color: "#E8E8E8", padding: "30px 16px 50px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, letterSpacing: 4, color: "#4ECDC4" }}>FORMA</div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#555", marginTop: 4 }}>FEATURE TOUR</div>
        </div>

        {/* 카드 */}
        <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ height: 3, background: "#1E2133" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "#4ECDC4", transition: "width 0.3s" }}></div>
          </div>
          <div style={{ padding: "16px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#4ECDC4" }}>{cur.num}</span>
            <span style={{ fontSize: 11, color: "#555", letterSpacing: 1 }}>/ 0{totalSteps}</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, margin: "6px 20px 4px" }}>{cur.title}</div>
          <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6, margin: "0 20px 14px" }}>{cur.desc}</div>
          <div style={{ margin: "0 14px 14px" }}>{cur.content}</div>

          <div style={{ display: "flex", gap: 8, padding: "0 20px 16px" }}>
            <button onClick={() => navigate("/")}
              style={{ background: "transparent", border: "none", color: "#555", padding: "10px 14px", fontSize: 12, cursor: "pointer", fontFamily: font }}>
              {step === totalSteps - 1 ? "처음으로" : "건너뛰기"}
            </button>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)}
                style={{ flex: 1, background: "#2A2D3E", border: "none", color: "#888", padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                이전
              </button>
            )}
            {step < totalSteps - 1 ? (
              <button onClick={() => setStep(step + 1)}
                style={{ flex: 1, background: "#4ECDC4", border: "none", color: "#0F1117", padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                다음 →
              </button>
            ) : (
              <button onClick={() => navigate("/")}
                style={{ flex: 1, background: "#4ECDC4", border: "none", color: "#0F1117", padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                로그인 →
              </button>
            )}
          </div>
        </div>

        {/* 하단 카카오톡 */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={() => window.open("https://open.kakao.com/o/szxBzqsi", "_blank")}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FEE500", border: "none", borderRadius: 12, padding: "12px 24px", cursor: "pointer", fontFamily: font }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#3C1E1E">
              <path d="M12 2C6.477 2 2 5.8 2 10.5c0 3.016 1.86 5.662 4.67 7.19L5.5 22l4.73-2.52C10.78 19.65 11.38 19.7 12 19.7c5.523 0 10-3.8 10-8.5S17.523 2 12 2z"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#3C1E1E" }}>문의하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
