import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Survey from './Survey.jsx'
import Inbody from './Inbody.jsx'
import SurveyView from './SurveyView.jsx'
import Guide from './Guide.jsx'
import Diet from './Diet.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/survey/:memberId" element={<Survey />} />
        <Route path="/inbody/:memberId" element={<Inbody />} />
        <Route path="/survey-view/:memberId" element={<SurveyView />} />
        <Route path="/guide/:type" element={<Guide />} />
        <Route path="/diet" element={<Diet />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
