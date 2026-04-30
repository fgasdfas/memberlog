import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const font = "'Noto Sans KR', sans-serif";

export default function Tour() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const totalSteps = 8;

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
      num: "04", title: "A4 보고서 1초 생성",
      desc: "PT 성과를 한 장으로 깔끔하게 정리. PDF·이미지로 출력 가능.",
      content: (
        <div style={{ background: "linear-gradient(135deg, #4ECDC415 0%, #15182100 100%)", border: "1px solid #4ECDC444", borderRadius: 10, padding: "24px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
          <h4 style={{ fontSize: 15, fontWeight: 800, color: "#E8E8E8", marginBottom: 8 }}>이런 보고서가 만들어져요</h4>
          <p style={{ fontSize: 12, color: "#888", lineHeight: 1.7 }}>인바디 변화·세션 기록·PT 성과를<br/>자동으로 정리해 A4 1페이지에 담아드려요</p>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: 16, paddingTop: 16, borderTop: "1px solid #4ECDC433" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: "#4ECDC4" }}>1초</div>
              <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>생성 속도</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: "#4ECDC4" }}>A4</div>
              <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>1페이지</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: "#4ECDC4" }}>PDF</div>
              <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>출력 가능</div>
            </div>
          </div>
        </div>
      )
    },
    {
      num: "05", title: "실제 보고서 예시",
      desc: "아래 보고서가 실제로 1초만에 만들어져요. ↓",
      content: (
        <div style={{ background: "#fafaf7", color: "#1a1a1f", borderRadius: 4, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", overflow: "hidden" }}>
          <div style={{ padding: "20px 18px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, letterSpacing: 2, lineHeight: 1 }}>FORMA</div>
                <div style={{ fontSize: 8, letterSpacing: 1.5, color: "#888", marginTop: 2 }}>PERSONAL TRAINING REPORT</div>
              </div>
              <div style={{ textAlign: "right", fontSize: 9, color: "#444", lineHeight: 1.6 }}>
                발행일 <strong style={{ color: "#1a1a1f", fontWeight: 700 }}>2026.04.30</strong><br/>
                담당 <strong style={{ color: "#1a1a1f", fontWeight: 700 }}>오리코치</strong><br/>
                소속 <strong style={{ color: "#1a1a1f", fontWeight: 700 }}>롯데대연</strong>
              </div>
            </div>
            <hr style={{ border: "none", borderTop: "1px solid #1a1a1f", margin: "8px 0 14px" }} />
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, lineHeight: 1.05, marginBottom: 4 }}>Member Progress Report</div>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 14 }}>회원 성과 분석 보고서</div>

            <div style={{ background: "#0F1117", color: "white", padding: "12px 14px", borderRadius: 4, borderLeft: "3px solid #4ECDC4", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 8, color: "#888", letterSpacing: 1.5, marginBottom: 3 }}>NAME</div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>이지은</div>
              </div>
              <div>
                <div style={{ fontSize: 8, color: "#888", letterSpacing: 1.5, marginBottom: 3 }}>AGE</div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>30대</div>
              </div>
              <div>
                <div style={{ fontSize: 8, color: "#888", letterSpacing: 1.5, marginBottom: 3 }}>GENDER</div>
                <div style={{ fontSize: 13, fontWeight: 800 }}>여성</div>
              </div>
              <div>
                <div style={{ fontSize: 8, color: "#888", letterSpacing: 1.5, marginBottom: 3 }}>PERIOD</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#4ECDC4" }}>8주</div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 900, color: "#4ECDC4" }}>01</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>BODY COMPOSITION CHANGE</span>
              </div>
              <div style={{ paddingLeft: 20 }}>
                <div style={{ background: "white", border: "1px solid #e5e3de", borderRadius: 4, height: 70, padding: 8 }}>
                  <svg width="100%" height="54" viewBox="0 0 380 54">
                    <line x1="0" y1="14" x2="380" y2="14" stroke="#e5e3de" strokeDasharray="2,2"/>
                    <line x1="0" y1="28" x2="380" y2="28" stroke="#e5e3de" strokeDasharray="2,2"/>
                    <line x1="0" y1="42" x2="380" y2="42" stroke="#e5e3de" strokeDasharray="2,2"/>
                    <polyline points="20,18 90,22 160,32 230,38 300,44 360,46" fill="none" stroke="#4ECDC4" strokeWidth="2" />
                    <circle cx="20" cy="18" r="3" fill="#4ECDC4" />
                    <circle cx="90" cy="22" r="3" fill="#4ECDC4" />
                    <circle cx="160" cy="32" r="3" fill="#4ECDC4" />
                    <circle cx="230" cy="38" r="3" fill="#4ECDC4" />
                    <circle cx="300" cy="44" r="3" fill="#4ECDC4" />
                    <circle cx="360" cy="46" r="3" fill="#4ECDC4" />
                  </svg>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 900, color: "#4ECDC4" }}>02</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>KEY METRICS</span>
              </div>
              <div style={{ paddingLeft: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5 }}>
                {[
                  { l: "체중", v: "62.3kg", c: "↓ 2.3kg" },
                  { l: "골격근량", v: "24.5kg", c: "↑ 0.8kg" },
                  { l: "체지방률", v: "26.4%", c: "↓ 3.1%p" },
                  { l: "체지방량", v: "16.4kg", c: "↓ 2.8kg" },
                ].map((m, i) => (
                  <div key={i} style={{ background: "white", border: "1px solid #e5e3de", padding: "6px 8px", borderRadius: 3 }}>
                    <div style={{ fontSize: 7, color: "#888" }}>{m.l}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, marginTop: 2 }}>{m.v}</div>
                    <div style={{ fontSize: 8, color: "#4ECDC4", fontWeight: 700 }}>{m.c}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 900, color: "#4ECDC4" }}>03</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>SESSION HIGHLIGHTS</span>
              </div>
              <div style={{ paddingLeft: 20, fontSize: 10, lineHeight: 1.7, color: "#444" }}>
                <span style={{ display: "inline-block", background: "#4ECDC422", color: "#4ECDC4", padding: "1px 6px", borderRadius: 3, fontSize: 8, fontWeight: 700, marginRight: 6 }}>04.20</span>자세 교정 + 코어 운동 진행, 가동범위 개선<br/>
                <span style={{ display: "inline-block", background: "#4ECDC422", color: "#4ECDC4", padding: "1px 6px", borderRadius: 3, fontSize: 8, fontWeight: 700, marginRight: 6 }}>04.25</span>체중 감량 추세 양호, 식단 조절 유지
              </div>
            </div>

            <div style={{ marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 900, color: "#4ECDC4" }}>04</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>TRAINER'S NOTE</span>
              </div>
              <div style={{ paddingLeft: 20 }}>
                <div style={{ background: "#0F1117", color: "#fafaf7", padding: "10px 12px", borderRadius: 3, fontSize: 10, lineHeight: 1.6 }}>
                  8주간 이지은님과 "다이어트, 근력강화"를 목표로 함께해 왔습니다. 체지방률 3.1%p 감량과 골격근 0.8kg 증가를 이뤄내셨습니다. 그 과정에서 자세 교정, 식단 관리, 코어 강화를 중점적으로 진행했습니다.
                </div>
              </div>
            </div>
          </div>
          <div style={{ background: "#0F1117", color: "white", padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9 }}>
            <span><strong style={{ color: "#4ECDC4", fontFamily: "'Playfair Display', serif", letterSpacing: 1.5 }}>FORMA</strong> · PERSONAL TRAINING</span>
            <span>memberlog.web.app</span>
          </div>
        </div>
      )
    },
    {
      num: "06", title: "새 기록 들어오면 알림",
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
      num: "07", title: "트레이너별 회원 분리",
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
      num: "08", title: "시작해볼까요?",
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
