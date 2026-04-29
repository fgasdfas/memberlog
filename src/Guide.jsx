import { useState } from "react";
import { useParams } from "react-router-dom";

const font = "'Noto Sans KR', sans-serif";

const Section = ({ num, title, children }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #1E2133" }}>
      <span style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 10, letterSpacing: 2, padding: "4px 10px", borderRadius: 6, background: "#ffffff10", color: "#888" }}>{num}</span>
      <span style={{ fontSize: 17, fontWeight: 900 }}>{title}</span>
    </div>
    {children}
  </div>
);

const StepCard = ({ icon, title, desc, tip }) => (
  <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 12, padding: "16px", marginBottom: 10, display: "flex", gap: 14 }}>
    <div style={{ fontSize: 24, width: 44, height: 44, borderRadius: 10, background: "#0F1117", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#E8E8E8", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#888", lineHeight: 1.7 }}>{desc}</div>
      {tip && (
        <div style={{ marginTop: 8, background: "#4ECDC412", borderLeft: "2px solid #4ECDC4", borderRadius: "0 6px 6px 0", padding: "6px 10px", fontSize: 11, color: "#4ECDC4", lineHeight: 1.6 }}>
          💡 {tip}
        </div>
      )}
    </div>
  </div>
);

const PermRow = ({ func, member, trainer, admin }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 56px 72px 60px", padding: "10px 14px", borderBottom: "1px solid #1E2133", fontSize: 12, alignItems: "center" }}>
    <div style={{ color: "#C0C0C0" }}>{func}</div>
    <div style={{ textAlign: "center", fontSize: 13 }}>{member}</div>
    <div style={{ textAlign: "center", fontSize: 13 }}>{trainer}</div>
    <div style={{ textAlign: "center", fontSize: 13 }}>{admin}</div>
  </div>
);

const FaqItem = ({ q, a }) => (
  <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 12, padding: "16px", marginBottom: 8 }}>
    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
      <span style={{ color: "#4ECDC4", fontFamily: "'Josefin Sans', sans-serif", fontSize: 12, minWidth: 16 }}>Q.</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#E8E8E8" }}>{q}</span>
    </div>
    <div style={{ fontSize: 12, color: "#888", lineHeight: 1.7, paddingLeft: 24 }}>{a}</div>
  </div>
);

// ── 트레이너용 가이드 ──
function TrainerGuide() {
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #4ECDC412, #151821)", border: "1px solid #4ECDC422", borderRadius: 16, padding: "24px 20px", marginBottom: 28, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#4ECDC4", letterSpacing: 3, marginBottom: 8 }}>트레이너 가이드</div>
        <div style={{ fontSize: 13, color: "#888", lineHeight: 1.8 }}>FORMA 앱 트레이너 사용법을 안내해드려요.<br />궁금한 점은 카카오톡으로 문의해주세요 😊</div>
      </div>

      {/* 목차 */}
      <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 14, padding: "16px", marginBottom: 28 }}>
        <div style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 10, color: "#555", letterSpacing: 3, marginBottom: 12 }}>CONTENTS</div>
        {[
          ["01", "로그인 & 기본 화면"],
          ["02", "회원 추가 & 관리"],
          ["03", "인바디 기록"],
          ["04", "건강 기록 작성"],
          ["05", "설문지 활용"],
          ["06", "자주 묻는 질문"],
        ].map(([num, label]) => (
          <div key={num} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, marginBottom: 2 }}>
            <span style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 10, color: "#4ECDC4", minWidth: 20, letterSpacing: 1 }}>{num}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#E8E8E8" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* 01 로그인 */}
      <Section num="01" title="로그인 & 기본 화면">
        <StepCard icon="🔐" title="로그인하기" desc="앱 접속 후 본인 계정을 선택하고 비밀번호를 입력하면 로그인돼요." />
        <StepCard icon="📁" title="폴더 선택" desc="상단 폴더 버튼을 눌러 원하는 그룹의 회원 목록을 볼 수 있어요." tip="폴더는 설정에서 추가/수정/삭제 가능해요" />
        <StepCard icon="🔍" title="회원 검색" desc="이름 또는 운동목적으로 회원을 빠르게 찾을 수 있어요." />
        <StepCard icon="🔔" title="변동사항 하이라이트" desc="로그인 이후 새로 등록된 회원이나 인바디를 기록한 회원은 카드에 뱃지가 표시돼요." tip="NEW = 신규 등록, 인바디 = 인바디 기록됨" />
      </Section>

      {/* 02 회원 관리 */}
      <Section num="02" title="회원 추가 & 관리">
        <StepCard icon="➕" title="직접 추가" desc="하단 + 버튼을 눌러 이름, 연령대, 성별, 운동목적을 입력하고 회원을 직접 추가할 수 있어요." />
        <StepCard icon="📝" title="설문지로 추가" desc="상단 설문지 버튼을 눌러 링크를 복사한 뒤 회원에게 공유하면, 회원이 직접 작성 후 자동으로 등록돼요." tip="신규 회원 등록 전 건강 정보를 미리 받을 때 유용해요" />
        <StepCard icon="🗂" title="폴더 이동 & 삭제" desc="회원 상세 화면 하단에서 다른 폴더로 이동하거나 회원을 삭제할 수 있어요." />
      </Section>

      {/* 03 인바디 */}
      <Section num="03" title="인바디 기록">
        <StepCard icon="📊" title="인바디 입력" desc="회원 상세 → 인바디 탭에서 체중(필수), 골격근량, 체지방률, 체지방량을 입력할 수 있어요." tip="측정일 전체를 클릭하면 달력이 열려요." />
        <StepCard icon="📲" title="회원 인바디 링크 공유" desc="인바디 탭 상단 링크 복사 버튼으로 회원에게 링크를 공유하면, 회원이 직접 수치를 입력할 수 있어요." />
        <StepCard icon="📈" title="그래프 확인" desc="2회 이상 기록되면 체중/골격근량/체지방률 변화 그래프가 자동으로 생성돼요." />
        <StepCard icon="✏️" title="기록 수정/삭제" desc="잘못 입력한 인바디 기록은 전체 기록 목록에서 수정하거나 삭제할 수 있어요." />
      </Section>

      {/* 04 건강기록 */}
      <Section num="04" title="건강 기록 작성">
        <StepCard icon="📋" title="기록 추가" desc="회원 상세 → 건강 기록 탭에서 날짜와 내용을 입력해 기록을 추가할 수 있어요." tip="수업 후 특이사항, 통증 변화, 중량 증가 등을 기록해두세요" />
      </Section>

      {/* 05 설문지 */}
      <Section num="05" title="설문지 활용">
        <StepCard icon="📄" title="설문지 원본 보기" desc="회원 상세 → 설문지 탭 → 📄 원본 버튼을 누르면 회원이 작성한 설문지를 새 탭으로 볼 수 있어요." />
        <StepCard icon="✏️" title="설문지 수정" desc="설문지 탭 → ✏️ 수정 버튼으로 기존 설문지를 수정할 수 있어요." />
        <StepCard icon="🔗" title="신규 회원 설문지 링크" desc="헤더의 📝 설문지 버튼을 눌러 신규 회원용 링크를 복사할 수 있어요. 회원이 작성하면 자동으로 등록돼요." />
      </Section>

      {/* 07 FAQ */}
      <Section num="06" title="자주 묻는 질문">
        <FaqItem q="회원이 설문지를 이미 작성했는데 다시 작성하게 할 수 있나요?" a="설문지 탭 → ✏️ 수정 버튼으로 기존 설문지를 수정할 수 있어요." />
        <FaqItem q="인바디 링크를 회원에게 어떻게 보내나요?" a="회원 상세 → 인바디 탭에서 링크 복사 버튼을 눌러 카카오톡 등으로 공유하면 돼요." />
        <FaqItem q="다른 트레이너 폴더가 안 보여요." a="트레이너는 본인 폴더만 접근 가능해요. 전체 폴더는 관리자 계정으로만 확인할 수 있어요." />
        <FaqItem q="앱을 핸드폰 홈 화면에 추가할 수 있나요?" a="크롬에서 접속 후 메뉴(점 세 개) → 홈 화면에 추가를 누르면 앱처럼 사용할 수 있어요." />
        <FaqItem q="인바디 날짜를 잘못 입력했어요." a="인바디 탭 → 전체 기록 → 해당 기록의 수정 버튼으로 수정 가능해요." />
      </Section>

      {/* 문의 버튼 */}
      <button onClick={() => window.open("https://open.kakao.com/o/szxBzqsi", "_blank")}
        style={{ width: "100%", background: "#FEE500", color: "#3C1E1E", border: "none", borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 900, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        💬 카카오톡으로 문의하기
      </button>
    </div>
  );
}

// ── 회원용 가이드 ──
function MemberGuide() {
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, #6BCB7712, #151821)", border: "1px solid #6BCB7722", borderRadius: 16, padding: "24px 20px", marginBottom: 28, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📱</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#6BCB77", letterSpacing: 3, marginBottom: 8 }}>회원 가이드</div>
        <div style={{ fontSize: 13, color: "#888", lineHeight: 1.8 }}>FORMA 앱 회원 사용법을 안내해드려요 😊</div>
      </div>

      {/* 01 인바디 입력 */}
      <Section num="01" title="인바디 기록하기">
        <StepCard icon="🔗" title="링크로 접속" desc="트레이너에게 받은 인바디 링크로 접속하세요. 로그인 없이 사용 가능해요." />
        <StepCard icon="📊" title="수치 입력" desc="체중(필수), 골격근량, 체지방률, 체지방량을 입력해요. 측정일도 확인해주세요." tip="체중만 입력해도 저장 가능해요!" />
        <StepCard icon="📈" title="변화 그래프 보기" desc="기록이 2회 이상이면 📈 변화 그래프 탭에서 내 변화를 확인할 수 있어요." />
        <StepCard icon="✏️" title="기록 수정" desc="잘못 입력한 기록은 변화 그래프 탭 → 전체 기록에서 수정/삭제할 수 있어요." />
      </Section>

      {/* 식단 가이드 배너 */}
      <div onClick={() => window.open(`${window.location.origin}/#/diet`, "_blank")}
        style={{ background: "linear-gradient(135deg, #6BCB7718, #151821)", border: "1px solid #6BCB7733", borderRadius: 14, padding: "16px 18px", marginBottom: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#6BCB77", marginBottom: 4 }}>🥗 식단 가이드</div>
          <div style={{ fontSize: 12, color: "#888" }}>나의 칼로리 계산 + 맞춤 식단 예시</div>
        </div>
        <span style={{ fontSize: 20, color: "#6BCB77" }}>›</span>
      </div>

      {/* 03 홈 화면 추가 */}
      <Section num="02" title="앱처럼 사용하기">
        <StepCard icon="📱" title="홈 화면에 추가하기" desc="크롬 브라우저에서 앱 접속 후 메뉴(점 세 개) → 홈 화면에 추가를 누르면 앱 아이콘처럼 사용할 수 있어요." tip="홈 화면에서 실행하면 앱이랑 똑같이 작동해요!" />
      </Section>

      {/* FAQ */}
      <Section num="03" title="자주 묻는 질문">
        <FaqItem q="인바디 링크는 어디서 받나요?" a="트레이너에게 카카오톡으로 요청하시면 돼요." />
        <FaqItem q="인바디 기록이 안 보여요." a="기록이 1건이면 그래프가 표시되지 않아요. 2회 이상 기록되면 그래프가 나타나요." />
      </Section>

      <button onClick={() => window.open("https://open.kakao.com/o/szxBzqsi", "_blank")}
        style={{ width: "100%", background: "#FEE500", color: "#3C1E1E", border: "none", borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 900, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        💬 트레이너에게 문의하기
      </button>
    </div>
  );
}

export default function Guide() {
  const { type } = useParams(); // "trainer" or "member"
  const isTrainer = type !== "member";
  const [tab, setTab] = useState(isTrainer ? "trainer" : "member");

  return (
    <div style={{ minHeight: "100vh", background: "#0F1117", color: "#E8E8E8", fontFamily: font }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Playfair+Display:wght@700;900&family=Josefin+Sans:wght@300;400;700&display=swap" rel="stylesheet" />

      <header style={{ background: "#0F1117", borderBottom: "1px solid #1E2030", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: "#4ECDC4", letterSpacing: 4 }}>FORMA</span>
        <span style={{ fontSize: 13, color: "#555" }}>사용설명서</span>
      </header>

      {/* 탭 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "16px 16px 0" }}>
        <button onClick={() => setTab("trainer")}
          style={{ padding: "12px", borderRadius: 12, border: "1px solid", fontFamily: font, fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s",
            background: tab === "trainer" ? "#4ECDC4" : "#151821",
            color: tab === "trainer" ? "#0F1117" : "#888",
            borderColor: tab === "trainer" ? "#4ECDC4" : "#2A2D3E",
          }}>
          🏋️ 트레이너용
        </button>
        <button onClick={() => setTab("member")}
          style={{ padding: "12px", borderRadius: 12, border: "1px solid", fontFamily: font, fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s",
            background: tab === "member" ? "#6BCB77" : "#151821",
            color: tab === "member" ? "#0F1117" : "#888",
            borderColor: tab === "member" ? "#6BCB77" : "#2A2D3E",
          }}>
          👤 회원용
        </button>
      </div>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 80px" }}>
        {tab === "trainer" ? <TrainerGuide /> : <MemberGuide />}
      </main>
    </div>
  );
}
