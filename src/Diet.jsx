import { useState } from "react";

const font = "'Noto Sans KR', sans-serif";

const getMealPlan = (kcal, protein, goal, gender) => {
  const high = kcal >= 2200;
  const fatR = gender === 'male' ? 0.25 : 0.30;
  const macros = {
    carb: Math.round((kcal - protein * 4 - kcal * fatR) / 4),
    protein,
    fat: Math.round(kcal * fatR / 9),
  };

  if (goal === 'diet') return [{
    badge: '다이어트', badgeBg: '#FF6B6B20', badgeColor: '#FF6B6B',
    name: '바쁜 직장인 다이어트', kcal,
    strategy: '단백질 먼저 채우고, 탄수화물은 줄이기',
    times: [
      { label: '아침', food: '삶은 계란 2개(100g) + 바나나 1개(100g)', sub: '준비 5분 이내' },
      { label: '점심', food: '백반 — 밥 반공기(100g) + 단백질 반찬 위주', sub: '국물보다 건더기 위주로' },
      { label: '간식', food: '편의점 그릭요거트(150g) or 단백질바(45g)' },
      { label: '저녁', food: high ? '닭가슴살 1팩(200g) + 고구마 1개(150g) + 샐러드(100g)' : '편의점 닭가슴살 1팩(100g) + 고구마 반개(75g)' },
    ],
    macros,
  }];

  if (goal === 'bulk') return [{
    badge: '근력강화', badgeBg: '#4ECDC420', badgeColor: '#4ECDC4',
    name: '고단백 벌크업 식단', kcal,
    strategy: '매끼 단백질 확보! 양 줄이지 말고 질로',
    times: [
      { label: '아침', food: `계란 ${high ? 3 : 2}개(${high ? 150 : 100}g) 스크램블 + 식빵 ${high ? 2 : 1}장(${high ? 70 : 35}g)` },
      { label: '점심', food: '구내식당 or 외식 — 불고기(200g) / 제육볶음(200g) 등 고기 메뉴' },
      { label: '간식', food: `편의점 삶은계란 2개(100g) + 우유 1팩(200ml)${high ? ' + 단백질바(45g)' : ''}` },
      { label: '저녁', food: high ? '소고기(200g) or 연어(200g) + 밥 1공기(200g) + 나물반찬' : '두부 반모(150g) + 계란 2개(100g) + 밥 반공기(100g)' },
    ],
    macros,
  }];

  return [{
    badge: '건강유지', badgeBg: '#A78BFA20', badgeColor: '#A78BFA',
    name: '무리 없는 유지 식단', kcal,
    strategy: '특별한 식재료 없이, 일반 식사에서 조금만 신경 쓰기',
    times: [
      { label: '아침', food: '계란 2개(100g) + 식빵 1장(35g) or 편의점 샌드위치(150g)' },
      { label: '점심', food: '일반 한식 백반 — 과식만 하지 않으면 OK', sub: '밥은 반공기(100g) 기준으로' },
      { label: '간식', food: '견과류 한 줌(30g) or 과일(150g)' },
      { label: '저녁', food: '집밥 — 단백질 반찬 1가지 이상 포함 / 계란찜(100g) · 생선구이(150g) · 두부조림(150g)' },
    ],
    macros,
  }];
};

const MacroCard = ({ label, color, kcal, children }) => (
  <div style={{ background: color + "08", border: "1px solid " + color + "22", borderRadius: 14, padding: 16, marginBottom: 10 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
      <div style={{ fontSize: 26, width: 44, height: 44, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 900, color }}>{label.name}</div>
        <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{label.en}</div>
      </div>
      <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: color + "18", color }}>{kcal}</span>
    </div>
    <div style={{ fontSize: 12, color: "#A0A0A0", lineHeight: 1.7, marginBottom: 10 }}>{label.desc}</div>
    <div style={{ fontSize: 11, color: "#888", marginBottom: 6, fontWeight: 600 }}>{label.foodLabel}</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {label.foods.map(f => (
        <span key={f} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: color + "12", color, fontWeight: 600 }}>{f}</span>
      ))}
    </div>
  </div>
);

export default function Diet() {
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState(0.3);
  const [goal, setGoal] = useState('maintain');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const w = parseFloat(weight);
    if (!w || w < 30 || w > 200) { alert('체중을 올바르게 입력해주세요 (30~200kg)'); return; }
    const bmr = w * 24;
    const tdee = Math.round(bmr + bmr * activity);
    let targetKcal = goal === 'diet' ? Math.round(tdee * 0.8) : goal === 'bulk' ? Math.round(tdee * 1.1) : tdee;
    const proteinMulti = gender === 'male' ? 2.0 : 1.7;
    const protein = Math.round(w * proteinMulti);
    const fatRatio = gender === 'male' ? 0.25 : 0.30;
    const fat = Math.round((targetKcal * fatRatio) / 9);
    const carb = Math.round((targetKcal - protein * 4 - fat * 9) / 4);
    setResult({
      kcal: targetKcal,
      carb, protein, fat,
      proteinMin: Math.round(w * 1.5),
      proteinMax: Math.round(w * 2.0),
      meals: getMealPlan(targetKcal, protein, goal, gender),
    });
    setTimeout(() => document.getElementById('diet-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const selBtn = (active, color = "#4ECDC4") => ({
    border: "1px solid " + (active ? color : "#2A2D3E"),
    background: active ? color + "18" : "#0F1117",
    color: active ? color : "#666",
    borderRadius: 10, padding: "11px 8px", fontWeight: 700,
    fontSize: 12, cursor: "pointer", fontFamily: font, transition: "all 0.2s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0F1117", color: "#E8E8E8", fontFamily: font }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />

      <header style={{ background: "#0F1117", borderBottom: "1px solid #1E2030", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: "#4ECDC4", letterSpacing: 4 }}>FORMA</span>
        <span style={{ fontSize: 13, color: "#555" }}>식단 가이드</span>
      </header>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* 인트로 */}
        <div style={{ background: "linear-gradient(135deg, #6BCB7712, #151821)", border: "1px solid #6BCB7722", borderRadius: 16, padding: "24px 20px", marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🥗</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: "#6BCB77", letterSpacing: 4, marginBottom: 8 }}>NUTRITION</div>
          <div style={{ fontSize: 13, color: "#888", lineHeight: 1.8 }}>정보를 입력하면 나에게 맞는<br />칼로리와 식단 예시를 알려드려요 😊</div>
        </div>

        {/* 계산기 */}
        <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 16 }}>📊 나의 식단 계산하기</div>

          {/* 성별 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>성별</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button style={selBtn(gender === 'male')} onClick={() => setGender('male')}>👨 남성</button>
              <button style={selBtn(gender === 'female')} onClick={() => setGender('female')}>👩 여성</button>
            </div>
          </div>

          {/* 체중 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>체중</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#0F1117", border: "1px solid #2A2D3E", borderRadius: 10, padding: "12px 16px" }}>
              <input type="number" inputMode="decimal" placeholder="00" value={weight} onChange={e => setWeight(e.target.value)}
                style={{ background: "transparent", border: "none", outline: "none", color: "#E8E8E8", fontSize: 22, fontWeight: 900, fontFamily: font, width: "100%" }} />
              <span style={{ fontSize: 14, color: "#555" }}>kg</span>
            </div>
          </div>

          {/* 활동량 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>활동량</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                { val: 0.2, label: "🪑 거의 없음", sub: "주로 앉아서 생활" },
                { val: 0.3, label: "🚶 보통", sub: "주 1~3회 운동" },
                { val: 0.4, label: "🏃 활발", sub: "주 3~5회 운동" },
                { val: 0.5, label: "💪 매우 활발", sub: "주 6~7회 운동" },
              ].map(({ val, label, sub }) => (
                <button key={val} style={{ ...selBtn(activity === val), textAlign: "center", lineHeight: 1.5 }} onClick={() => setActivity(val)}>
                  {label}<br /><span style={{ fontSize: 10, fontWeight: 400, color: activity === val ? "#4ECDC488" : "#444" }}>{sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 목표 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>목표</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {[
                { val: 'diet', label: '🔥 다이어트', color: '#FF6B6B' },
                { val: 'maintain', label: '⚖️ 유지', color: '#A78BFA' },
                { val: 'bulk', label: '💪 근력강화', color: '#4ECDC4' },
              ].map(({ val, label, color }) => (
                <button key={val} style={selBtn(goal === val, color)} onClick={() => setGoal(val)}>{label}</button>
              ))}
            </div>
          </div>

          <button onClick={calculate}
            style={{ width: "100%", background: "#4ECDC4", color: "#0F1117", border: "none", borderRadius: 12, padding: 16, fontSize: 15, fontWeight: 900, cursor: "pointer", fontFamily: font }}>
            나의 식단 계산하기 →
          </button>
        </div>

        {/* 결과 */}
        {result && (
          <div id="diet-result">
            <div style={{ background: "#151821", border: "1px solid #4ECDC433", borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 11, color: "#4ECDC4", letterSpacing: 2, marginBottom: 14 }}>MY NUTRITION PLAN</div>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: "#4ECDC4", fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{result.kcal.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>하루 권장 칼로리</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
                {[
                  { label: "탄수화물 (g)", val: result.carb, color: "#F9CA24" },
                  { label: "단백질 (g)", val: result.protein, color: "#4ECDC4" },
                  { label: "지방 (g)", val: result.fat, color: "#FF6B6B" },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ background: "#0F1117", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color }}>{val}g</div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#4ECDC412", border: "1px solid #4ECDC433", borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, color: "#888" }}>💪 단백질 목표 (체중 × 1.5~2g)</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#4ECDC4" }}>{result.proteinMin}~{result.proteinMax}g</div>
              </div>
            </div>

            {/* 식단 예시 */}
            {result.meals.map((m, i) => (
              <div key={i} style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #1E2133" }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: m.badgeBg, color: m.badgeColor, marginBottom: 4, display: "inline-block" }}>{m.badge}</div>
                    <div style={{ fontSize: 15, fontWeight: 900 }}>{m.name}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 900 }}>{m.kcal}</div>
                    <div style={{ fontSize: 11, color: "#555" }}>kcal</div>
                  </div>
                </div>
                <div style={{ padding: "14px 18px" }}>
                  <div style={{ fontSize: 11, color: "#888", background: "#0F1117", borderRadius: 8, padding: "8px 12px", marginBottom: 12, lineHeight: 1.6 }}>
                    <span style={{ color: "#4ECDC4", fontWeight: 700 }}>핵심 전략</span> — {m.strategy}
                  </div>
                  {m.times.map((t, j) => (
                    <div key={j} style={{ display: "grid", gridTemplateColumns: "52px 1fr", gap: 10, marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: "#555", paddingTop: 2 }}>{t.label}</div>
                      <div style={{ fontSize: 13, color: "#C0C0C0", lineHeight: 1.7 }}>
                        {t.food}
                        {t.sub && <div style={{ fontSize: 10, color: "#444" }}>{t.sub}</div>}
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 12, paddingTop: 12, borderTop: "1px solid #1E2133" }}>
                    {[
                      { label: "탄수화물", val: m.macros.carb, color: "#F9CA24" },
                      { label: "단백질", val: m.macros.protein, color: "#4ECDC4" },
                      { label: "지방", val: m.macros.fat, color: "#FF6B6B" },
                    ].map(({ label, val, color }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color }}>{val}g</div>
                        <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* 참고 안내 배너 */}
            <div style={{ background: "linear-gradient(135deg, #FFE60018, #FF6B6B12)", border: "2px solid #FFE60066", borderRadius: 14, padding: "16px 18px", marginBottom: 14, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>⚠️</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#FFE600", marginBottom: 6 }}>식단 예시는 참고용입니다</div>
                <div style={{ fontSize: 12, color: "#C0C0C0", lineHeight: 1.8 }}>
                  제시된 식단은 일반적인 기준의 예시로, 개인의 신체 조건·건강 상태·운동 목표에 따라 실제 권장 식단은 달라질 수 있습니다.<br />
                  <span style={{ color: "#FFE600", fontWeight: 700 }}>보다 정확하고 맞춤화된 식단은 담당 코치와 상담해 주시기 바랍니다 🙏</span>
                </div>
              </div>
            </div>

            {/* 팁 */}
            <div style={{ background: "#4ECDC410", border: "1px solid #4ECDC422", borderRadius: 12, padding: "14px 16px", marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "#4ECDC4", fontWeight: 700, marginBottom: 8 }}>💡 실천 팁</div>
              {[
                "쉽고 빠르게 식단을 챙길 수 있어요 — 편의점을 잘 활용하면 좋아요",
                "물은 2L 이상, 5L를 목표로 마시기",
                "단백질 총량을 채우는 게 중요해요 — 하루 두 번 이상 프로틴 음료 마시기",
                "야식은 피하고 자기 2시간 전엔 먹지 않기 — 너무 배고프면 프로틴 마시기",
                "완벽한 식단보다 꾸준한 식단이 훨씬 중요해요 💪",
              ].map((tip, i) => (
                <div key={i} style={{ fontSize: 12, color: "#888", lineHeight: 1.9 }}>• {tip}</div>
              ))}
              <div style={{ fontSize: 10, color: "#333", marginTop: 10, textAlign: "right" }}>※ 식단 정보는 미국 농무부(USDA) 식이지침 참고</div>
            </div>
          </div>
        )}

        {/* 삼대영양소 */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #1E2133" }}>
            <span style={{ fontSize: 17, fontWeight: 900 }}>삼대영양소란?</span>
          </div>

          <MacroCard label={{ name: "탄수화물", en: "Carbohydrate", desc: "우리 몸의 주요 에너지원이에요. 뇌와 근육이 가장 먼저 사용하는 연료로, 운동 전후 적절히 섭취하면 퍼포먼스와 회복에 도움이 돼요.", foodLabel: "좋은 탄수화물", foods: ["🍚 현미밥", "🍠 고구마", "🍞 통밀빵", "🥣 귀리"] }} color="#F9CA24" kcal="1g = 4kcal">🌾</MacroCard>

          <MacroCard label={{ name: "단백질", en: "Protein", desc: "근육을 만들고 유지하는 핵심 영양소예요. 운동 후 근육 회복에 필수적이며 포만감도 오래 유지돼요. 체중 1kg당 1.5~2g 섭취를 목표로 해요.", foodLabel: "단백질 종류", foods: ["🍗 닭가슴살", "🥚 계란", "🐟 생선", "🥩 소고기", "🥓 돼지고기"] }} color="#4ECDC4" kcal="1g = 4kcal">🥩</MacroCard>

          <MacroCard label={{ name: "지방", en: "Fat", desc: "호르몬 생성과 지용성 비타민 흡수에 꼭 필요해요. 무조건 줄이기보다 좋은 지방을 적절히 섭취하는 게 중요해요.", foodLabel: "좋은 지방", foods: ["🥛 유지방·버터·치즈", "🥩 동물성 지방", "🫒 올리브오일", "🥜 견과류"] }} color="#FF6B6B" kcal="1g = 9kcal">🥑</MacroCard>
        </div>

      </main>
    </div>
  );
}
