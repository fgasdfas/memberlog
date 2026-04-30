import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import Survey from './Survey.jsx'
import Inbody from './Inbody.jsx'
import SurveyView from './SurveyView.jsx'
import Guide from './Guide.jsx'
import Diet from './Diet.jsx'
import Report from './Report.jsx'
import Tour from './Tour.jsx'

// 저장된 회원 ID로 자동 리다이렉트
function InbodyRedirect() {
  const savedId = localStorage.getItem("inbodyMemberId");
  if (savedId) return <Navigate to={`/inbody/${savedId}`} replace />;
  return (
    <div style={{ minHeight: "100vh", background: "#0F1117", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#4ECDC4", letterSpacing: 4 }}>FORMA</div>
      <p style={{ color: "#888", fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif" }}>트레이너에게 링크를 받아주세요</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/survey/:memberId" element={<Survey />} />
        <Route path="/inbody/:memberId" element={<Inbody />} />
        <Route path="/inbody" element={<InbodyRedirect />} />
        <Route path="/survey-view/:memberId" element={<SurveyView />} />
        <Route path="/guide/:type" element={<Guide />} />
        <Route path="/diet" element={<Diet />} />
        <Route path="/report/:memberId" element={<Report />} />
        <Route path="/tour" element={<Tour />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
