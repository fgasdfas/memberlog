import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore, collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, query, orderBy, setDoc, getDoc
} from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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

const PAR_Q_QUESTIONS_SHORT = [
  "심장 이상 관련 의사 권고 여부",
  "신체활동 시 가슴 통증",
  "안정 시 가슴 통증 (지난 달)",
  "어지럼증으로 균형 상실 또는 의식 잃음",
  "뼈/관절 문제 (허리, 무릎 등)",
  "혈압/심장질환 처방약 복용 중",
  "신체활동 금지 기타 사유",
];

const PAR_Q_PLUS_SHORT = [
  "심장질환 또는 고혈압 진단",
  "가슴 통증 (안정/일상/운동 시)",
  "어지럼증으로 쓰러짐/의식 잃음 (12개월)",
  "다른 만성질환 진단",
  "만성질환 처방약 복용",
  "뼈/관절/연부조직 문제 (12개월)",
  "의학적 감독하 운동 권고",
];
const FOLDER_COLORS = ["#4ECDC4", "#FF6B6B", "#A78BFA", "#FFA500", "#6BCB77", "#F9CA24", "#FF85A1", "#4D96FF"];
const FOLDER_EMOJIS = ["🏋️", "💪", "💻", "🗂️", "🔥", "⭐", "🌟", "🎯"];
const PURPOSES = ["다이어트", "근력강화", "체형교정", "재활", "건강유지", "스트레스해소", "기타"];
const AGE_GROUPS = ["10대", "20대", "30대", "40대", "50대", "60대", "70대"];
const GENDERS = ["남성", "여성"];
const USER_EMOJIS = ["🦆", "🐯", "🦁", "🐻", "🦊", "🐺", "🦝", "🐸"];

const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
};
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };

const purposeColor = {
  "다이어트": "#FF6B6B", "근력강화": "#4ECDC4", "체형교정": "#A78BFA",
  "재활": "#FFA500", "건강유지": "#6BCB77", "스트레스해소": "#F9CA24", "기타": "#A0A0A0"
};

const inputStyle = {
  width: "100%", background: "#0F1117", border: "1px solid #2A2D3E",
  borderRadius: 8, padding: "11px 14px", color: "#E8E8E8", fontSize: 14,
  outline: "none", boxSizing: "border-box", fontFamily: "'Noto Sans KR', sans-serif",
};

const koreanSort = (a, b) => a.name.localeCompare(b.name, "ko");
const emptyInbody = () => ({ date: today(), weight: "", muscle: "", fat: "", fatmass: "", bmi: "" });

// 초기 관리자 계정 설정
const ADMIN_ID = "오리코치";
const ADMIN_PASSWORD = "12142659";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem("mlUser");
    if (saved) {
      // 이전 loginTime을 prevLoginTime에 저장해두고
      const prev = sessionStorage.getItem("mlLoginTime");
      if (prev) sessionStorage.setItem("mlPrevLoginTime", prev);
      // loginTime을 현재 시간으로 갱신
      sessionStorage.setItem("mlLoginTime", new Date().toISOString());
    }
    return saved ? JSON.parse(saved) : null;
  });
  const [users, setUsers] = useState([]);
  const [loginStep, setLoginStep] = useState("select");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("list");
  const [folder, setFolder] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [seenMembers, setSeenMembers] = useState(new Set());
  const [newNote, setNewNote] = useState("");
  const [noteDate, setNoteDate] = useState(today());
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [showMoveConfirm, setShowMoveConfirm] = useState(false);
  const [moveTarget, setMoveTarget] = useState("");
  const [inbodyForm, setInbodyForm] = useState(emptyInbody());
  const [showInbodyAdd, setShowInbodyAdd] = useState(false);
  const [editingInbodyIdx, setEditingInbodyIdx] = useState(null);
  const [editingInbodyForm, setEditingInbodyForm] = useState(null);
  const [activeTab, setActiveTab] = useState("record");
  const [chartMetric, setChartMetric] = useState("weight"); // kept for compatibility

  const [survey, setSurvey] = useState(null);
  const [showSurveyDetail, setShowSurveyDetail] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0]);
  const [newFolderEmoji, setNewFolderEmoji] = useState(FOLDER_EMOJIS[0]);
  const [editingFolder, setEditingFolder] = useState(null);

  // 트레이너 추가
  const [newTrainerName, setNewTrainerName] = useState("");
  const [newTrainerPassword, setNewTrainerPassword] = useState("");
  const [newTrainerEmoji, setNewTrainerEmoji] = useState(USER_EMOJIS[1]);

  // Firebase에서 사용자 목록 불러오기
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        isAdmin: d.data().role === "admin" || d.data().isAdmin === true,
      }));
      setUsers(data);
    });
    return () => unsub();
  }, []);

  // 초기 관리자 계정 생성
  useEffect(() => {
    const initAdmin = async () => {
      const adminRef = doc(db, "users", ADMIN_ID);
      const adminDoc = await getDoc(adminRef);
      if (!adminDoc.exists()) {
        await setDoc(adminRef, {
          name: ADMIN_ID,
          password: ADMIN_PASSWORD,
          emoji: "🦆",
          isAdmin: true,
          folders: [
            { key: "롯데대연", label: "롯데대연", emoji: "🏋️", color: "#4ECDC4" },
            { key: "피트니스코리아", label: "피트니스코리아", emoji: "💪", color: "#FF6B6B" },
            { key: "온라인코칭", label: "온라인코칭", emoji: "💻", color: "#A78BFA" },
            { key: "만료회원", label: "만료회원", emoji: "🗂️", color: "#888" },
          ],
          createdAt: serverTimestamp(),
        });
      }
    };
    initAdmin();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, "members"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMembers(data);
      setLoading(false);
      // selected 최신 데이터로 동기화
      setSelected(prev => {
        if (!prev) return prev;
        const updated = data.find(m => m.id === prev.id);
        return updated || prev;
      });
    });
    return () => unsub();
  }, [currentUser]);

  // currentUser 정보 실시간 업데이트
  useEffect(() => {
    if (!currentUser) return;
    const updated = users.find(u => u.id === currentUser.id);
    if (updated) {
      const newUser = { ...updated };
      setCurrentUser(newUser);
      sessionStorage.setItem("mlUser", JSON.stringify(newUser));
      if (!folder && updated.folders?.length > 0) {
        setFolder(updated.folders[0].key);
        setAddForm({ name: "", age: "", gender: "남성", purpose: [], registeredDate: today(), firstNote: "", folder: updated.folders[0].key });
      }
    }
  }, [users]);

  const handleSelectUser = (user) => {
    setSelectedUserId(user.id);
    setLoginStep("password");
    setPwInput(""); setPwError(false);
  };

  const handleLogin = () => {
    const user = users.find(u => u.id === selectedUserId);
    if (user && pwInput === user.password) {
      sessionStorage.setItem("mlUser", JSON.stringify(user));
      // 로그인 시 인바디 리다이렉트 ID 삭제 (트레이너 폰에서 회원 페이지로 가는 문제 방지)
      localStorage.removeItem("inbodyMemberId");
      // 로그인 시 이전 loginTime 저장 후 갱신
      const prev = sessionStorage.getItem("mlLoginTime");
      if (prev) sessionStorage.setItem("mlPrevLoginTime", prev);
      sessionStorage.setItem("mlLoginTime", new Date().toISOString());
      setCurrentUser(user);
      if (user.folders?.length > 0) {
        setFolder(user.folders[0].key);
        setAddForm({ name: "", age: "", gender: "남성", purpose: [], registeredDate: today(), firstNote: "", folder: user.folders[0].key });
      }
      setPwError(false);
    } else {
      setPwError(true); setPwInput("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("mlUser");
    setCurrentUser(null); setLoginStep("select");
    setSelectedUserId(null); setFolder(null);
    setMembers([]); setLoading(true); setView("list");
  };

  const isAdmin = currentUser?.isAdmin || false;

  // 관리자는 모든 폴더, 트레이너는 본인 폴더만
  const currentFolders = isAdmin
    ? users.flatMap(u => u.folders || []).filter((f, i, arr) => arr.findIndex(x => x.key === f.key) === i)
    : (currentUser?.folders || []);

  const folderCount = (key) => members.filter(m => m.folder === key && (isAdmin || !m.owner || m.owner === currentUser?.id)).length;

  // 변동사항 감지 — 이전 접속 시간 기준
  const loginTime = sessionStorage.getItem("mlPrevLoginTime") || sessionStorage.getItem("mlLoginTime");
  const getChangeBadge = (m) => {
    if (!loginTime) return null;
    if (seenMembers.has(m.id)) return null; // 이미 확인한 회원
    const lt = new Date(loginTime);

    // 신규 회원 — createdAt이 이전 접속 이후면 NEW
    if (m.createdAt?.toDate && m.createdAt.toDate() > lt) {
      return { label: "NEW", color: "#FFE600", textColor: "#0F1117" };
    }

    // 인바디 — updatedAt이 이전 접속 이후면 표시
    const latestInbody = [...(m.inbody || [])].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (latestInbody?.updatedAt) {
      const inbodyUpdated = new Date(latestInbody.updatedAt);
      if (!isNaN(inbodyUpdated) && inbodyUpdated > lt) {
        return { label: "인바디", color: "#00FFC8", textColor: "#0F1117" };
      }
    }
    return null;
  };

  const filtered = members
    .filter(m => m.folder === folder && (isAdmin || !m.owner || m.owner === currentUser?.id) &&
      (m.name.includes(search) || (m.purpose || []).some(p => p.includes(search))))
    .sort(koreanSort);

  const openDetail = (m) => {
    setSelected(m); setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setNewNote(""); setNoteDate(today());
    setShowMoveConfirm(false); setMoveTarget("");
    setShowInbodyAdd(false); setInbodyForm(emptyInbody());
    setActiveTab("record"); setSurvey(null); setShowSurveyDetail(false);
    // 뱃지 확인 처리
    setSeenMembers(prev => new Set([...prev, m.id]));
    // 설문지 불러오기
    getDoc(doc(db, "surveys", m.id)).then(snap => {
      if (snap.exists()) setSurvey(snap.data());
    });
  };
  const goList = () => { setView("list"); setSelected(null); setShowMoveConfirm(false); };

  const openEdit = () => {
    setEditForm({
      name: selected.name, age: selected.age || "",
      gender: selected.gender || "남성", purpose: selected.purpose || [],
      registeredDate: selected.registeredDate, folder: selected.folder,
      timeSlot: selected.timeSlot || [],
    });
    setView("edit");
  };

  const submitEdit = async () => {
    if (!editForm.name.trim() || !editForm.age || editForm.purpose.length === 0) return;
    setSaving(true);
    await updateDoc(doc(db, "members", selected.id), {
      name: editForm.name.trim(), age: editForm.age,
      gender: editForm.gender, purpose: editForm.purpose,
      registeredDate: editForm.registeredDate, folder: editForm.folder,
      timeSlot: editForm.timeSlot || [],
    });
    setSaving(false); setView("detail");
  };

  const addNoteToMember = async () => {
    if (!newNote.trim() || !selected) return;
    setSaving(true);
    const updatedNotes = [...(selected.notes || []), { date: noteDate, text: newNote.trim() }];
    await updateDoc(doc(db, "members", selected.id), { notes: updatedNotes });
    setNewNote(""); setNoteDate(today()); setSaving(false);
  };

  const addInbody = async () => {
    if (!inbodyForm.date || !inbodyForm.weight) return;
    setSaving(true);
    const newEntry = {
      date: inbodyForm.date,
      weight: parseFloat(inbodyForm.weight) || null,
      muscle: parseFloat(inbodyForm.muscle) || null,
      fat: parseFloat(inbodyForm.fat) || null,
      fatmass: parseFloat(inbodyForm.fatmass) || null,
      bmi: parseFloat(inbodyForm.bmi) || null,
    };
    const updatedInbody = [...(selected.inbody || []), newEntry].sort((a, b) => a.date.localeCompare(b.date));
    await updateDoc(doc(db, "members", selected.id), { inbody: updatedInbody });
    setInbodyForm(emptyInbody()); setShowInbodyAdd(false); setSaving(false);
  };

  const saveEditInbody = async () => {
    if (!editingInbodyForm.weight) return;
    setSaving(true);
    const sorted = [...(selected.inbody || [])].sort((a, b) => b.date.localeCompare(a.date));
    sorted[editingInbodyIdx] = {
      date: editingInbodyForm.date,
      weight: parseFloat(editingInbodyForm.weight) || null,
      muscle: parseFloat(editingInbodyForm.muscle) || null,
      fat: parseFloat(editingInbodyForm.fat) || null,
      fatmass: parseFloat(editingInbodyForm.fatmass) || null,
    };
    const updated = sorted.sort((a, b) => a.date.localeCompare(b.date));
    await updateDoc(doc(db, "members", selected.id), { inbody: updated });
    setEditingInbodyIdx(null); setEditingInbodyForm(null); setSaving(false);
  };

  const deleteInbody = async (idx) => {
    if (!window.confirm("이 인바디 기록을 삭제할까요?")) return;
    setSaving(true);
    const sorted = [...(selected.inbody || [])].sort((a, b) => b.date.localeCompare(a.date));
    const updated = sorted.filter((_, i) => i !== idx).sort((a, b) => a.date.localeCompare(b.date));
    await updateDoc(doc(db, "members", selected.id), { inbody: updated });
    setSaving(false);
  };

  const deleteMember = async () => {
    if (!selected) return;
    if (!window.confirm(`${selected.name} 회원을 삭제할까요?\n삭제된 데이터는 복구할 수 없어요.`)) return;
    setSaving(true);
    await deleteDoc(doc(db, "members", selected.id));
    // 설문지도 함께 삭제
    try { await deleteDoc(doc(db, "surveys", selected.id)); } catch (e) {}
    setSaving(false);
    goList();
  };

  const moveMember = async () => {
    if (!selected || !moveTarget) return;
    setSaving(true);
    await updateDoc(doc(db, "members", selected.id), { folder: moveTarget });
    setSaving(false); goList();
  };

  const submitAdd = async () => {
    if (!addForm.name.trim() || !addForm.age || addForm.purpose.length === 0) return;
    setSaving(true);
    await addDoc(collection(db, "members"), {
      name: addForm.name.trim(), age: addForm.age,
      gender: addForm.gender, purpose: addForm.purpose,
      registeredDate: addForm.registeredDate, folder: addForm.folder,
      owner: currentUser.id,
      notes: addForm.firstNote.trim()
        ? [{ date: addForm.registeredDate, text: addForm.firstNote.trim() }]
        : [{ date: addForm.registeredDate, text: "등록일." }],
      inbody: [], createdAt: serverTimestamp(),
    });
    setAddForm({ name: "", age: "", gender: "남성", purpose: [], registeredDate: today(), firstNote: "", folder: folder });
    setSaving(false); setView("list");
  };

  // 폴더 추가
  const addFolder = async () => {
    if (!newFolderName.trim()) return;
    setSaving(true);
    const newFolder = {
      key: newFolderName.trim() + "_" + Date.now(),
      label: newFolderName.trim(),
      emoji: newFolderEmoji,
      color: newFolderColor,
    };
    const updatedFolders = [...currentFolders, newFolder];
    await updateDoc(doc(db, "users", currentUser.id), { folders: updatedFolders });
    setNewFolderName(""); setNewFolderColor(FOLDER_COLORS[0]); setNewFolderEmoji(FOLDER_EMOJIS[0]);
    setSaving(false); setView("settings");
  };

  // 폴더 수정
  const saveEditFolder = async () => {
    if (!editingFolder) return;
    setSaving(true);
    const updatedFolders = currentFolders.map(f =>
      f.key === editingFolder.key ? { ...f, label: editingFolder.label, emoji: editingFolder.emoji, color: editingFolder.color } : f
    );
    await updateDoc(doc(db, "users", currentUser.id), { folders: updatedFolders });
    setEditingFolder(null); setSaving(false); setView("settings");
  };

  // 폴더 삭제
  const deleteFolder = async (folderKey) => {
    if (!window.confirm("정말 삭제할까요? 해당 폴더의 회원은 사라지지 않아요.")) return;
    const updatedFolders = currentFolders.filter(f => f.key !== folderKey);
    await updateDoc(doc(db, "users", currentUser.id), { folders: updatedFolders });
    if (folder === folderKey && updatedFolders.length > 0) setFolder(updatedFolders[0].key);
  };

  // 트레이너 수정
  const saveEditTrainer = async () => {
    if (!editingTrainer || !editingTrainer.password.trim()) return;
    setSaving(true);
    await updateDoc(doc(db, "users", editingTrainer.id), {
      password: editingTrainer.password.trim(),
      emoji: editingTrainer.emoji,
    });
    setEditingTrainer(null);
    setSaving(false);
    setView("settings");
  };

  // 트레이너 삭제
  const deleteTrainer = async (trainerId) => {
    if (!window.confirm(`${trainerId} 트레이너를 삭제할까요?\n해당 트레이너의 회원 데이터는 유지됩니다.`)) return;
    await deleteDoc(doc(db, "users", trainerId));
  };

  // 트레이너 추가
  const addTrainer = async () => {
    if (!newTrainerName.trim() || !newTrainerPassword.trim()) return;
    setSaving(true);
    await setDoc(doc(db, "users", newTrainerName.trim()), {
      name: newTrainerName.trim(),
      password: newTrainerPassword.trim(),
      emoji: newTrainerEmoji,
      isAdmin: false,
      folders: [],
      createdAt: serverTimestamp(),
    });
    setNewTrainerName(""); setNewTrainerPassword(""); setNewTrainerEmoji(USER_EMOJIS[1]);
    setSaving(false); setView("settings");
  };

  if (!currentUser) {
    // 저장된 인바디 회원 ID가 있으면 인바디 페이지로 리다이렉트
    const savedInbodyId = localStorage.getItem("inbodyMemberId");
    if (savedInbodyId) {
      window.location.href = `/#/inbody/${savedInbodyId}`;
      return null;
    }
    return (
    <div style={{ minHeight: "100vh", background: "#0F1117", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: 24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center" }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, color: "#4ECDC4", letterSpacing: 8 }}>FORMA</span>
        <p style={{ color: "#555", fontSize: 14, marginTop: 8, fontFamily: "'Noto Sans KR', sans-serif" }}>PT 회원 관리 플랫폼</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 }}>
          <span style={{ color: "#444", fontSize: 12, fontFamily: "'Noto Sans KR', sans-serif" }}>made by 오리코치</span>
          <span style={{ color: "#444", fontSize: 12 }}>·</span>
          <a href="https://instagram.com/kwang.duk" target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none", color: "#888", fontSize: 12, fontFamily: "'Noto Sans KR', sans-serif" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#888" stroke="none"/>
            </svg>
            @kwang.duk
          </a>
        </div>
      </div>
      <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 20, padding: "32px", maxWidth: 320, width: "100%" }}>
        {loginStep === "select" ? (
          <>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 20, fontFamily: "'Noto Sans KR', sans-serif", textAlign: "center" }}>계정을 선택해주세요</p>
            {users.map(user => (
              <button key={user.id} onClick={() => handleSelectUser(user)}
                style={{ width: "100%", background: "#0F1117", border: "1px solid #2A2D3E", borderRadius: 12, padding: "16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", marginBottom: 10, fontFamily: "'Noto Sans KR', sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#4ECDC4"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#2A2D3E"}>
                <span style={{ fontSize: 28 }}>{user.emoji}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: "#E8E8E8", fontWeight: 700, fontSize: 15 }}>{user.name}</div>
                  <div style={{ color: "#555", fontSize: 12, marginTop: 2 }}>폴더 {(user.folders || []).length}개</div>
                </div>
                <span style={{ marginLeft: "auto", color: "#444", fontSize: 18 }}>›</span>
              </button>
            ))}
          </>
        ) : (
          <>
            <button onClick={() => setLoginStep("select")} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 14, marginBottom: 16, fontFamily: "'Noto Sans KR', sans-serif", padding: 0 }}>← 돌아가기</button>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>{users.find(u => u.id === selectedUserId)?.emoji}</div>
              <div style={{ color: "#E8E8E8", fontWeight: 700, fontSize: 18, fontFamily: "'Noto Sans KR', sans-serif" }}>{selectedUserId}</div>
              <div style={{ color: "#555", fontSize: 13, marginTop: 4, fontFamily: "'Noto Sans KR', sans-serif" }}>비밀번호를 입력해주세요</div>
            </div>
            <input type="password" value={pwInput}
              onChange={e => { setPwInput(e.target.value); setPwError(false); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="비밀번호 입력"
              style={{ ...inputStyle, marginBottom: 12, textAlign: "center", fontSize: 16 }} />
            {pwError && <p style={{ color: "#FF6B6B", fontSize: 13, marginBottom: 12, fontFamily: "'Noto Sans KR', sans-serif", textAlign: "center" }}>비밀번호가 틀렸어요</p>}
            <button onClick={handleLogin}
              style={{ width: "100%", background: "#4ECDC4", border: "none", borderRadius: 12, padding: "14px", fontWeight: 700, fontSize: 15, color: "#0F1117", cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
              입장하기
            </button>
          </>
        )}
      </div>
      {/* 카카오톡 문의 버튼 */}
      <button onClick={() => window.open("https://open.kakao.com/o/szxBzqsi", "_blank")}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "#FEE500", border: "none", borderRadius: 12, padding: "12px 24px", cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#3C1E1E">
          <path d="M12 2C6.477 2 2 5.8 2 10.5c0 3.016 1.86 5.662 4.67 7.19L5.5 22l4.73-2.52C10.78 19.65 11.38 19.7 12 19.7c5.523 0 10-3.8 10-8.5S17.523 2 12 2z"/>
        </svg>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#3C1E1E" }}>문의하기</span>
      </button>
    </div>
  );
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0F1117", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, color: "#4ECDC4", letterSpacing: 6 }}>FORMA</span>
      <div style={{ width: 32, height: 32, border: "3px solid #2A2D3E", borderTop: "3px solid #4ECDC4", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const renderForm = (form, setForm, onSubmit, title) => (
    <div style={{ padding: "16px 20px" }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: "8px 0 24px" }}>{title}</h2>
      {[
        { label: "이름 *", child: <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="회원 이름" style={inputStyle} /> },
        { label: "연령대 *", child: (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {AGE_GROUPS.map(a => (
              <button key={a} onClick={() => setForm({...form, age: a})}
                style={{ padding: "9px 16px", border: "1px solid " + (form.age === a ? "#4ECDC4" : "#2A2D3E"), borderRadius: 20, background: form.age === a ? "#4ECDC422" : "#0F1117", color: form.age === a ? "#4ECDC4" : "#888", cursor: "pointer", fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: form.age === a ? 700 : 400 }}>
                {form.age === a ? "✓ " : ""}{a}
              </button>
            ))}
          </div>
        )},
        { label: "성별", child: (
          <div style={{ display: "flex", gap: 10 }}>
            {GENDERS.map(g => (
              <button key={g} onClick={() => setForm({...form, gender: g})}
                style={{ flex: 1, padding: "10px", border: "1px solid " + (form.gender === g ? "#4ECDC4" : "#2A2D3E"), borderRadius: 8, background: form.gender === g ? "#4ECDC422" : "#0F1117", color: form.gender === g ? "#4ECDC4" : "#888", cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600 }}>
                {g}
              </button>
            ))}
          </div>
        )},
        { label: "소속 폴더", child: (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {currentFolders.map(f => (
              <button key={f.key} onClick={() => setForm({...form, folder: f.key})}
                style={{ padding: "10px", border: "1px solid " + (form.folder === f.key ? f.color : "#2A2D3E"), borderRadius: 8, background: form.folder === f.key ? f.color + "22" : "#0F1117", color: form.folder === f.key ? f.color : "#888", cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600, fontSize: 13 }}>
                {f.emoji} {f.label}
              </button>
            ))}
          </div>
        )},
        { label: "운동목적 (복수 선택)", child: (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PURPOSES.map(p => {
              const isSel = form.purpose.includes(p);
              return (
                <button key={p} onClick={() => setForm({...form, purpose: isSel ? form.purpose.filter(x => x !== p) : [...form.purpose, p]})}
                  style={{ padding: "8px 14px", border: "1px solid " + (isSel ? purposeColor[p] : "#2A2D3E"), borderRadius: 20, background: isSel ? purposeColor[p] + "22" : "#0F1117", color: isSel ? purposeColor[p] : "#888", cursor: "pointer", fontSize: 13, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: isSel ? 700 : 400 }}>
                  {isSel ? "✓ " : ""}{p}
                </button>
              );
            })}
          </div>
        )},
        { label: "등록 날짜", child: <input type="date" value={form.registeredDate} onChange={e => setForm({...form, registeredDate: e.target.value})} style={{...inputStyle, colorScheme: "dark"}} /> },
        { label: "선호 수업 시간대", child: (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["이른아침(06-09시)", "오전(09-12시)", "오후(12-17시)", "저녁(17-21시)", "주말"].map(t => {
              const isSel = (form.timeSlot || []).includes(t);
              return (
                <button key={t} onClick={() => setForm({...form, timeSlot: isSel ? (form.timeSlot || []).filter(x => x !== t) : [...(form.timeSlot || []), t]})}
                  style={{ padding: "8px 14px", border: "1px solid " + (isSel ? "#4D96FF" : "#2A2D3E"), borderRadius: 20, background: isSel ? "#4D96FF22" : "#0F1117", color: isSel ? "#4D96FF" : "#888", cursor: "pointer", fontSize: 13, fontFamily: "'Noto Sans KR', sans-serif", fontWeight: isSel ? 700 : 400 }}>
                  {isSel ? "✓ " : ""}{t}
                </button>
              );
            })}
          </div>
        )},
        ...(title === "신규 회원 등록" ? [{ label: "초기 건강 특이사항", child: (
          <textarea value={form.firstNote} onChange={e => setForm({...form, firstNote: e.target.value})}
            placeholder={"예) 허리디스크 병력, 무릎 통증 등\n없으면 비워두세요."}
            rows={3} style={{...inputStyle, resize: "vertical", lineHeight: 1.6}} />
        )}] : []),
      ].map(({ label, child }) => (
        <div key={label} style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: "#999", display: "block", marginBottom: 8 }}>{label}</label>
          {child}
        </div>
      ))}
      <button onClick={onSubmit} disabled={saving}
        style={{ width: "100%", background: form.name && form.age && form.purpose.length > 0 && !saving ? "#4ECDC4" : "#2A2D3E", color: form.name && form.age && form.purpose.length > 0 ? "#0F1117" : "#555", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", marginTop: 8 }}>
        {saving ? "저장 중..." : title === "신규 회원 등록" ? "회원 등록 완료" : "수정 완료"}
      </button>
    </div>
  );

  const conditionMap = { "😴": 1, "😐": 2, "🙂": 3, "😊": 4, "💪": 5 };
  const inbodyData = [...(selected?.inbody || [])].sort((a, b) => a.date.localeCompare(b.date)).map(e => ({
    date: formatDate(e.date).slice(5),
    체중: e.weight, 골격근량: e.muscle, 체지방률: e.fat, 체지방량: e.fatmass,
    컨디션: e.condition ? conditionMap[e.condition] : null,
    컨디션이모지: e.condition || null,
  }));

  const currentFolder = currentFolders.find(f => f.key === folder);

  return (
    <div style={{ minHeight: "100vh", background: "#0F1117", fontFamily: "'Noto Sans KR', sans-serif", color: "#E8E8E8" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />

      {/* 사이드 메뉴 오버레이 */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, background: "#00000088", zIndex: 200 }} />
      )}

      {/* 사이드 메뉴 */}
      <div style={{
        position: "fixed", top: 0, right: 0, width: 240, height: "100%",
        background: "#151821", borderLeft: "1px solid #2A2D3E",
        zIndex: 201, display: "flex", flexDirection: "column",
        transform: menuOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {/* 사이드 헤더 */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #1E2133", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: "#4ECDC4", letterSpacing: 4 }}>FORMA</span>
          <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        {/* 유저 정보 */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #1E2133", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, background: "#4ECDC422", border: "1px solid #4ECDC444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            {currentUser?.emoji || "👤"}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{currentUser?.name}</div>
            {isAdmin && <div style={{ fontSize: 11, color: "#F9CA24", marginTop: 2 }}>관리자</div>}
          </div>
        </div>
        {/* 메뉴 항목 */}
        <div style={{ flex: 1, padding: "8px 0" }}>
          {[
            { icon: "📝", label: "신규 회원 설문지", color: "#A78BFA", bg: "#A78BFA22", action: () => { navigator.clipboard.writeText(`${window.location.origin}/#/survey/new`); alert("설문지 링크가 복사됐어요! 😊"); setMenuOpen(false); } },
            { icon: "💬", label: "카카오톡 문의", color: "#FEE500", bg: "#FEE50018", action: () => { window.open("https://open.kakao.com/o/szxBzqsi", "_blank"); setMenuOpen(false); } },
            { icon: "📖", label: "사용설명서", color: "#4ECDC4", bg: "#4ECDC418", action: () => { window.open(`${window.location.origin}/#/guide/trainer`, "_blank"); setMenuOpen(false); } },
            { icon: "⚙️", label: "설정", color: "#888", bg: "#88888818", action: () => { setView("settings"); setMenuOpen(false); } },
          ].map(({ icon, label, color, bg, action }) => (
            <button key={label} onClick={action}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", width: "100%", background: "none", border: "none", cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{icon}</div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#E8E8E8", textAlign: "left" }}>{label}</span>
              <span style={{ color: "#444", fontSize: 16 }}>›</span>
            </button>
          ))}
        </div>
        {/* 로그아웃 */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #1E2133" }}>
          <button onClick={() => { handleLogout(); setMenuOpen(false); }}
            style={{ width: "100%", padding: "12px", background: "#0F1117", border: "1px solid #2A2D3E", borderRadius: 12, color: "#888", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            👋 로그아웃
          </button>
        </div>
      </div>

      <header style={{ borderBottom: "1px solid #1E2030", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0F1117", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {view !== "list" && (
            <button onClick={() => {
              if (view === "edit") setView("detail");
              else if (["addFolder", "editFolder", "addTrainer", "editTrainer"].includes(view)) setView("settings");
              else goList();
            }} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 20, padding: "0 6px 0 0" }}>←</button>
          )}
          <span onClick={() => view !== "list" && goList()} style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: "#4ECDC4", letterSpacing: 5, cursor: view !== "list" ? "pointer" : "default" }}>
            FORMA
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {view === "detail" && selected && (
            <button onClick={openEdit} style={{ background: "#2A2D3E", border: "none", borderRadius: 8, padding: "8px 16px", color: "#E8E8E8", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
              ✏️ 정보 수정
            </button>
          )}
          {view === "settings" && <span style={{ fontSize: 14, color: "#888", fontWeight: 600 }}>설정</span>}
          {view === "edit" && <span style={{ fontSize: 13, color: "#A78BFA", fontWeight: 600 }}>정보 수정 중</span>}
          {/* 햄버거 버튼 */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "#151821", border: "1px solid #2A2D3E", borderRadius: 10, width: 42, height: 42, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer" }}>
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: "block", width: 18, height: 2, background: "#E8E8E8", borderRadius: 2,
                transition: "all 0.3s",
                transform: menuOpen ? (i === 0 ? "translateY(7px) rotate(45deg)" : i === 2 ? "translateY(-7px) rotate(-45deg)" : "scaleX(0)") : "none",
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </header>

      {/* 플로팅 + 버튼 (list 화면에서만) */}
      {view === "list" && (
        <button onClick={() => { setAddForm({ name: "", age: "", gender: "남성", purpose: [], registeredDate: today(), firstNote: "", folder: folder, timeSlot: [] }); setView("add"); }}
          style={{ position: "fixed", bottom: 28, right: 24, width: 56, height: 56, background: "#4ECDC4", border: "none", borderRadius: "50%", color: "#0F1117", fontSize: 28, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px #4ECDC455", zIndex: 50, transition: "transform 0.15s" }}>
          ＋
        </button>
      )}

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "0 0 80px 0" }}>

        {/* 설정 화면 */}
        {view === "settings" && (
          <div style={{ padding: "16px 20px" }}>
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: "16px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 24 }}>{currentUser.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{currentUser.name}</div>
                  {isAdmin && <span style={{ fontSize: 11, color: "#F9CA24", background: "#F9CA2422", padding: "2px 8px", borderRadius: 10 }}>관리자</span>}
                </div>
              </div>
            </div>

            {/* 신규 회원 설문지 링크 */}
            <h3 style={{ fontSize: 14, color: "#888", fontWeight: 500, margin: "0 0 12px" }}>📝 신규 회원 설문지</h3>
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: "#888", margin: "0 0 12px", lineHeight: 1.6 }}>
                회원 등록 전에 설문지를 먼저 받고 싶을 때 사용하세요.<br/>
                회원이 제출하면 자동으로 회원 등록이 돼요.
              </p>
              <div style={{ background: "#0F1117", borderRadius: 8, padding: "8px 12px", marginBottom: 10, wordBreak: "break-all", fontSize: 12, color: "#A78BFA" }}>
                {`${window.location.origin}/#/survey/new`}
              </div>
              <button onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/#/survey/new`);
                alert("신규 회원용 설문지 링크가 복사됐어요!");
              }}
                style={{ width: "100%", background: "#A78BFA", border: "none", borderRadius: 10, padding: "11px", color: "#0F1117", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
                🔗 링크 복사
              </button>
            </div>

            {/* 사용설명서 */}
            <div style={{ marginTop: 24, marginBottom: 8 }}>
              <h3 style={{ fontSize: 14, color: "#888", fontWeight: 500, margin: "0 0 12px" }}>📖 사용설명서</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button onClick={() => window.open(`${window.location.origin}/#/guide/trainer`, "_blank")}
                  style={{ background: "#151821", border: "1px solid #4ECDC444", borderRadius: 12, padding: "14px", color: "#4ECDC4", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
                  🏋️ 트레이너용
                </button>
                <button onClick={() => window.open(`${window.location.origin}/#/guide/member`, "_blank")}
                  style={{ background: "#151821", border: "1px solid #6BCB7744", borderRadius: 12, padding: "14px", color: "#6BCB77", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
                  👤 회원용
                </button>
              </div>
            </div>

            {/* 폴더 관리 */}
            <h3 style={{ fontSize: 14, color: "#888", fontWeight: 500, margin: "0 0 12px" }}>📁 폴더 관리</h3>
            <div style={{ marginBottom: 16 }}>
              {currentFolders.map(f => (
                <div key={f.key} style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 12, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{f.emoji}</span>
                    <span style={{ fontWeight: 600, color: f.color }}>{f.label}</span>
                    <span style={{ fontSize: 12, color: "#555" }}>{folderCount(f.key)}명</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setEditingFolder({...f}); setView("editFolder"); }}
                      style={{ background: "#2A2D3E", border: "none", borderRadius: 6, padding: "6px 10px", color: "#E8E8E8", fontSize: 12, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>수정</button>
                    <button onClick={() => deleteFolder(f.key)}
                      style={{ background: "#1A0F0F", border: "1px solid #FF6B6B44", borderRadius: 6, padding: "6px 10px", color: "#FF6B6B", fontSize: 12, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>삭제</button>
                  </div>
                </div>
              ))}
              <button onClick={() => setView("addFolder")}
                style={{ width: "100%", background: "#151821", border: "1px dashed #4ECDC466", borderRadius: 12, padding: "12px", color: "#4ECDC4", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
                + 폴더 추가
              </button>
            </div>

            {/* 트레이너 추가 (관리자만) */}
            {isAdmin && (
              <>
                <h3 style={{ fontSize: 14, color: "#888", fontWeight: 500, margin: "24px 0 12px" }}>👥 트레이너 관리</h3>
                <div style={{ marginBottom: 16 }}>
                  {users.filter(u => !u.isAdmin).map(u => (
                    <div key={u.id} style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 12, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{u.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: "#555" }}>폴더 {(u.folders || []).length}개</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { setEditingTrainer({...u}); setView("editTrainer"); }}
                          style={{ background: "#2A2D3E", border: "none", borderRadius: 6, padding: "6px 10px", color: "#E8E8E8", fontSize: 12, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>수정</button>
                        <button onClick={() => deleteTrainer(u.id)}
                          style={{ background: "#1A0F0F", border: "1px solid #FF6B6B44", borderRadius: 6, padding: "6px 10px", color: "#FF6B6B", fontSize: 12, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>삭제</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setView("addTrainer")}
                    style={{ width: "100%", background: "#151821", border: "1px dashed #A78BFA66", borderRadius: 12, padding: "12px", color: "#A78BFA", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
                    + 트레이너 추가
                  </button>
                </div>
              </>
            )}

            {/* 문의하기 */}
            <div style={{ marginTop: 32, borderTop: "1px solid #1E2133", paddingTop: 24 }}>
              <h3 style={{ fontSize: 14, color: "#888", fontWeight: 500, margin: "0 0 12px" }}>💬 문의하기</h3>
              <button onClick={() => window.open("https://open.kakao.com/o/szxBzqsi", "_blank")}
                style={{ width: "100%", background: "#FEE500", border: "none", borderRadius: 14, padding: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#3C1E1E">
                  <path d="M12 2C6.477 2 2 5.8 2 10.5c0 3.016 1.86 5.662 4.67 7.19L5.5 22l4.73-2.52C10.78 19.65 11.38 19.7 12 19.7c5.523 0 10-3.8 10-8.5S17.523 2 12 2z"/>
                </svg>
                <span style={{ fontSize: 16, fontWeight: 900, color: "#3C1E1E" }}>카카오톡으로 문의하기</span>
              </button>
              <p style={{ fontSize: 12, color: "#555", textAlign: "center", marginTop: 8 }}>오픈채팅으로 연결돼요</p>
            </div>

          </div>
        )}

        {/* 폴더 추가 */}
        {view === "addFolder" && (
          <div style={{ padding: "16px 20px" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "8px 0 24px" }}>폴더 추가</h2>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: "#999", display: "block", marginBottom: 8 }}>폴더 이름 *</label>
              <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="예) 강남점" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: "#999", display: "block", marginBottom: 8 }}>이모지</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {FOLDER_EMOJIS.map(e => (
                  <button key={e} onClick={() => setNewFolderEmoji(e)}
                    style={{ fontSize: 24, padding: "8px", border: "2px solid " + (newFolderEmoji === e ? "#4ECDC4" : "#2A2D3E"), borderRadius: 8, background: newFolderEmoji === e ? "#4ECDC422" : "#0F1117", cursor: "pointer" }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: "#999", display: "block", marginBottom: 8 }}>색상</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {FOLDER_COLORS.map(c => (
                  <button key={c} onClick={() => setNewFolderColor(c)}
                    style={{ width: 36, height: 36, borderRadius: "50%", background: c, border: newFolderColor === c ? "3px solid #fff" : "3px solid transparent", cursor: "pointer" }} />
                ))}
              </div>
            </div>
            <button onClick={addFolder} disabled={saving || !newFolderName.trim()}
              style={{ width: "100%", background: newFolderName.trim() && !saving ? "#4ECDC4" : "#2A2D3E", color: newFolderName.trim() ? "#0F1117" : "#555", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
              {saving ? "저장 중..." : "폴더 추가"}
            </button>
          </div>
        )}

        {/* 폴더 수정 */}
        {view === "editFolder" && editingFolder && (
          <div style={{ padding: "16px 20px" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "8px 0 24px" }}>폴더 수정</h2>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: "#999", display: "block", marginBottom: 8 }}>폴더 이름</label>
              <input value={editingFolder.label} onChange={e => setEditingFolder({...editingFolder, label: e.target.value})} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: "#999", display: "block", marginBottom: 8 }}>이모지</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {FOLDER_EMOJIS.map(e => (
                  <button key={e} onClick={() => setEditingFolder({...editingFolder, emoji: e})}
                    style={{ fontSize: 24, padding: "8px", border: "2px solid " + (editingFolder.emoji === e ? "#4ECDC4" : "#2A2D3E"), borderRadius: 8, background: editingFolder.emoji === e ? "#4ECDC422" : "#0F1117", cursor: "pointer" }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: "#999", display: "block", marginBottom: 8 }}>색상</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {FOLDER_COLORS.map(c => (
                  <button key={c} onClick={() => setEditingFolder({...editingFolder, color: c})}
                    style={{ width: 36, height: 36, borderRadius: "50%", background: c, border: editingFolder.color === c ? "3px solid #fff" : "3px solid transparent", cursor: "pointer" }} />
                ))}
              </div>
            </div>
            <button onClick={saveEditFolder} disabled={saving}
              style={{ width: "100%", background: !saving ? "#4ECDC4" : "#2A2D3E", color: "#0F1117", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
              {saving ? "저장 중..." : "수정 완료"}
            </button>
          </div>
        )}

        {/* 트레이너 수정 */}
        {view === "editTrainer" && editingTrainer && (
          <div style={{ padding: "16px 20px" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "8px 0 24px" }}>트레이너 수정</h2>
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>{editingTrainer.emoji}</span>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{editingTrainer.name}</span>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: "#999", display: "block", marginBottom: 8 }}>새 비밀번호 *</label>
              <input value={editingTrainer.password} onChange={e => setEditingTrainer({...editingTrainer, password: e.target.value})}
                placeholder="새 비밀번호 입력" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: "#999", display: "block", marginBottom: 8 }}>이모지</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {USER_EMOJIS.map(e => (
                  <button key={e} onClick={() => setEditingTrainer({...editingTrainer, emoji: e})}
                    style={{ fontSize: 28, padding: "8px", border: "2px solid " + (editingTrainer.emoji === e ? "#A78BFA" : "#2A2D3E"), borderRadius: 8, background: editingTrainer.emoji === e ? "#A78BFA22" : "#0F1117", cursor: "pointer" }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={saveEditTrainer} disabled={saving || !editingTrainer.password.trim()}
              style={{ width: "100%", background: editingTrainer.password.trim() && !saving ? "#4ECDC4" : "#2A2D3E", color: editingTrainer.password.trim() ? "#0F1117" : "#555", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
              {saving ? "저장 중..." : "수정 완료"}
            </button>
          </div>
        )}

        {/* 트레이너 추가 */}
        {view === "addTrainer" && (
          <div style={{ padding: "16px 20px" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "8px 0 24px" }}>트레이너 추가</h2>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: "#999", display: "block", marginBottom: 8 }}>이름 *</label>
              <input value={newTrainerName} onChange={e => setNewTrainerName(e.target.value)} placeholder="트레이너 이름" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: "#999", display: "block", marginBottom: 8 }}>비밀번호 *</label>
              <input value={newTrainerPassword} onChange={e => setNewTrainerPassword(e.target.value)} placeholder="비밀번호 설정" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: "#999", display: "block", marginBottom: 8 }}>이모지</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {USER_EMOJIS.map(e => (
                  <button key={e} onClick={() => setNewTrainerEmoji(e)}
                    style={{ fontSize: 28, padding: "8px", border: "2px solid " + (newTrainerEmoji === e ? "#A78BFA" : "#2A2D3E"), borderRadius: 8, background: newTrainerEmoji === e ? "#A78BFA22" : "#0F1117", cursor: "pointer" }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={addTrainer} disabled={saving || !newTrainerName.trim() || !newTrainerPassword.trim()}
              style={{ width: "100%", background: newTrainerName.trim() && newTrainerPassword.trim() && !saving ? "#A78BFA" : "#2A2D3E", color: newTrainerName.trim() && newTrainerPassword.trim() ? "#0F1117" : "#555", border: "none", borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
              {saving ? "추가 중..." : "트레이너 추가"}
            </button>
          </div>
        )}

        {/* 목록 */}
        {view === "list" && (
          <div>
            <div style={{ padding: "12px 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>{currentUser.emoji}</span>
              <span style={{ color: "#4ECDC4", fontWeight: 700, fontSize: 15 }}>{currentUser.name}</span>
              <span style={{ color: "#555", fontSize: 13 }}>의 회원 관리</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "12px 16px 0" }}>
              {currentFolders.map(tab => {
                const isActive = folder === tab.key;
                return (
                  <button key={tab.key} onClick={() => { setFolder(tab.key); setSearch(""); }}
                    style={{ padding: "12px 10px", border: "1px solid " + (isActive ? tab.color : "#1E2133"), borderRadius: 12, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 700, fontSize: 13, background: isActive ? tab.color + "22" : "#151821", color: isActive ? tab.color : "#666", transition: "all 0.18s", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{tab.emoji} {tab.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, background: isActive ? tab.color + "33" : "#2A2D3E", color: isActive ? tab.color : "#888", padding: "2px 8px", borderRadius: 10 }}>{folderCount(tab.key)}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ padding: "12px 16px 8px" }}>
              <input placeholder="이름 또는 운동목적 검색..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", background: "#1A1D27", border: "1px solid #2A2D3E", borderRadius: 10, padding: "12px 16px", color: "#E8E8E8", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "'Noto Sans KR', sans-serif" }} />
            </div>
            <div style={{ padding: "0 16px" }}>
              {filtered.length === 0 && <p style={{ textAlign: "center", color: "#555", marginTop: 60 }}>등록된 회원이 없습니다</p>}
              {filtered.map(m => {
                const badge = getChangeBadge(m);
                return (
                <div key={m.id} onClick={() => openDetail(m)}
                  style={{ background: badge ? badge.color + "08" : "#151821", border: badge ? "2.5px solid " + badge.color : "1px solid #1E2133", borderRadius: 14, padding: "16px 18px", marginBottom: 12, cursor: "pointer", transition: "border-color 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: badge ? "0 0 12px " + badge.color + "22" : "none" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = badge ? badge.color : (currentFolder?.color || "#4ECDC4")}
                  onMouseLeave={e => e.currentTarget.style.borderColor = badge ? badge.color : "#1E2133"}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{m.name}</span>
                      <span style={{ fontSize: 13, color: "#999" }}>{m.age} · {m.gender}</span>
                      {m.timeSlot && m.timeSlot.length > 0 && (
                        <span style={{ fontSize: 12, color: "#4D96FF" }}>🕐 {m.timeSlot.join(" · ")}</span>
                      )}
                      {badge && (
                        <span style={{ fontSize: 10, fontWeight: 900, padding: "3px 8px", borderRadius: 6, background: badge.color, color: badge.textColor }}>
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      {(m.purpose || []).map(p => (
                        <span key={p} style={{ background: (purposeColor[p] || "#A0A0A0") + "22", color: purposeColor[p] || "#A0A0A0", fontSize: 12, padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>{p}</span>
                      ))}
                      <span style={{ color: "#555", fontSize: 12 }}>기록 {(m.notes || []).length}건</span>
                      {(m.inbody || []).length > 0 && <span style={{ color: "#A78BFA", fontSize: 12 }}>인바디 {(m.inbody || []).length}회</span>}
                    </div>
                  </div>
                  <span style={{ color: "#444", fontSize: 20 }}>›</span>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 상세 */}
        {view === "detail" && selected && (
          <div style={{ padding: "16px 20px" }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: currentFolders.find(f=>f.key===selected.folder)?.color || "#4ECDC4", background: (currentFolders.find(f=>f.key===selected.folder)?.color || "#4ECDC4") + "22", padding: "4px 12px", borderRadius: 20, fontWeight: 600 }}>
                {currentFolders.find(f => f.key === selected.folder)?.emoji} {selected.folder}
              </span>
            </div>
            <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: "20px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>{selected.name}</h2>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "55%" }}>
                  {(selected.purpose || []).map(p => (
                    <span key={p} style={{ background: (purposeColor[p] || "#A0A0A0") + "22", color: purposeColor[p] || "#A0A0A0", fontSize: 12, padding: "5px 12px", borderRadius: 20, fontWeight: 600, whiteSpace: "nowrap" }}>{p}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  { label: "연령대", value: selected.age || "-" },
                  { label: "성별", value: selected.gender },
                  { label: "운동목적", value: (selected.purpose || []).join(", ") },
                  { label: "등록일", value: formatDate(selected.registeredDate) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: "#0F1117", borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#E0E0E0" }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#0F1117", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>최근 특이사항</div>
                <div style={{ fontSize: 13, color: "#C0C0C0", lineHeight: 1.6 }}>{(selected.notes || []).slice(-1)[0]?.text || "없음"}</div>
                <div style={{ fontSize: 11, color: "#4ECDC4", marginTop: 6 }}>
                  {(selected.notes || []).slice(-1)[0]?.date ? formatDate(selected.notes.slice(-1)[0].date) : ""} 기준 · 총 {(selected.notes || []).length}건
                </div>
              </div>
            </div>

            <div style={{ display: "flex", background: "#151821", borderRadius: 12, padding: 4, gap: 4, marginBottom: 20 }}>
              {[{ key: "record", label: "📋 건강 기록" }, { key: "inbody", label: "📊 인바디" }, { key: "survey", label: "📝 설문지" }].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{ flex: 1, padding: "10px", border: "none", borderRadius: 9, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 700, fontSize: 12, background: activeTab === tab.key ? "#4ECDC4" : "transparent", color: activeTab === tab.key ? "#0F1117" : "#666", transition: "all 0.18s" }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "record" && (
              <div>
                <h3 style={{ fontSize: 14, color: "#888", fontWeight: 500, margin: "0 0 14px" }}>건강 기록 히스토리</h3>
                <div style={{ marginBottom: 24 }}>
                  {(selected.notes || []).length === 0 && <p style={{ color: "#555", fontSize: 14, textAlign: "center", marginTop: 20 }}>기록이 없습니다</p>}
                  {(selected.notes || []).map((note, i) => (
                    <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 16 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: i === selected.notes.length - 1 ? "#4ECDC4" : "#2A2D3E", border: "2px solid " + (i === selected.notes.length - 1 ? "#4ECDC4" : "#3A3D4E"), flexShrink: 0, marginTop: 4 }} />
                        {i < selected.notes.length - 1 && <div style={{ width: 1, flex: 1, background: "#1E2133", marginTop: 4 }} />}
                      </div>
                      <div style={{ flex: 1, background: "#151821", border: "1px solid #1E2133", borderRadius: 12, padding: "12px 14px" }}>
                        <div style={{ fontSize: 11, color: "#4ECDC4", fontWeight: 600, marginBottom: 6 }}>
                          📅 {formatDate(note.date)}
                          {i === 0 && <span style={{ marginLeft: 8, color: "#888", fontWeight: 400 }}>등록</span>}
                          {i === selected.notes.length - 1 && i !== 0 && <span style={{ marginLeft: 8, color: "#A78BFA", fontWeight: 400 }}>최신</span>}
                        </div>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#D0D0D0" }}>{note.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#151821", border: "1px solid #2A2D3E", borderRadius: 16, padding: "18px", marginBottom: 24 }}>
                  <h4 style={{ margin: "0 0 14px", fontSize: 14, color: "#E8E8E8", fontWeight: 600 }}>✏️ 새 기록 추가</h4>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 5 }}>기록 날짜</label>
                    <input type="date" value={noteDate} onChange={e => setNoteDate(e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
                  </div>
                  <textarea value={newNote} onChange={e => setNewNote(e.target.value)}
                    placeholder={"예) 어깨 통증 줄어듦. 벤치프레스 중량 5kg 증량."}
                    rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                  <button onClick={addNoteToMember} disabled={saving}
                    style={{ marginTop: 10, width: "100%", background: newNote.trim() && !saving ? "#4ECDC4" : "#2A2D3E", color: newNote.trim() && !saving ? "#0F1117" : "#555", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 15, cursor: newNote.trim() ? "pointer" : "not-allowed", fontFamily: "'Noto Sans KR', sans-serif" }}>
                    {saving ? "저장 중..." : "기록 추가"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "survey" && (
              <div>
                {/* 링크 공유 */}
                <div style={{ background: "#151821", border: "1px solid #2A2D3E", borderRadius: 16, padding: "16px", marginBottom: 16 }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: 14, color: "#E8E8E8", fontWeight: 600 }}>🔗 설문지 링크 공유</h4>
                  <p style={{ fontSize: 13, color: "#888", margin: "0 0 12px", lineHeight: 1.6 }}>
                    회원에게 링크를 보내면 PAR-Q 설문지를 작성할 수 있어요.
                  </p>
                  <div style={{ background: "#0F1117", borderRadius: 8, padding: "10px 14px", marginBottom: 10, wordBreak: "break-all", fontSize: 13, color: "#4ECDC4" }}>
                    {`${window.location.origin}/#/survey/${selected.id}`}
                  </div>
                  <button onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/#/survey/${selected.id}`);
                    alert("링크가 복사됐어요!");
                  }}
                    style={{ width: "100%", background: "#4ECDC4", border: "none", borderRadius: 10, padding: "11px", color: "#0F1117", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
                    링크 복사
                  </button>
                </div>

                {/* 설문지 결과 */}
                {survey ? (
                  <div>
                    <div style={{ background: "#151821", border: "1px solid #4ECDC4", borderRadius: 16, padding: "16px", marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h4 style={{ margin: 0, fontSize: 14, color: "#4ECDC4", fontWeight: 700 }}>✅ 설문지 제출 완료</h4>
                        <span style={{ fontSize: 12, color: "#555" }}>
                          {survey.submittedAt?.toDate?.()?.toLocaleDateString("ko-KR") || ""}
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                        <div style={{ background: "#0F1117", borderRadius: 8, padding: "8px 12px" }}>
                          <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>PAR-Q</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: survey.parqHasYes ? "#FF6B6B" : "#4ECDC4" }}>
                            {survey.parqHasYes ? "⚠️ 주의필요" : "✅ 이상없음"}
                          </div>
                        </div>
                        <div style={{ background: "#0F1117", borderRadius: 8, padding: "8px 12px" }}>
                          <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>PAR-Q+</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: survey.parqPlusHasYes ? "#FF6B6B" : "#4ECDC4" }}>
                            {survey.parqPlusHasYes ? "⚠️ 주의필요" : "✅ 이상없음"}
                          </div>
                        </div>
                      </div>

                      {/* 서명 */}
                      {survey.signature && (
                        <div>
                          <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>서명</div>
                          <img src={survey.signature} alt="서명" style={{ width: "100%", borderRadius: 8, border: "1px solid #2A2D3E" }} />
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button onClick={() => setShowSurveyDetail(!showSurveyDetail)}
                          style={{ flex: 2, background: "#2A2D3E", border: "none", borderRadius: 10, padding: "10px", color: "#E8E8E8", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
                          {showSurveyDetail ? "접기 ▲" : "상세 내용 보기 ▼"}
                        </button>
                        <button onClick={() => window.open(`${window.location.origin}/#/survey-view/${selected.id}`, "_blank")}
                          style={{ flex: 1, background: "#4ECDC422", border: "1px solid #4ECDC444", borderRadius: 10, padding: "10px", color: "#4ECDC4", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
                          📄 원본
                        </button>
                        <button onClick={() => window.open(`${window.location.origin}/#/survey/${selected.id}?edit=1`, "_blank")}
                          style={{ flex: 1, background: "#1A0F0F", border: "1px solid #FFA50044", borderRadius: 10, padding: "10px", color: "#FFA500", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
                          ✏️ 수정
                        </button>
                      </div>
                    </div>

                    {/* 상세 내용 */}
                    {showSurveyDetail && (
                      <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: "16px", marginBottom: 16 }}>

                        {/* PT 회원설문지 */}
                        {survey.pt && (
                          <>
                            <h4 style={{ fontSize: 14, color: "#4ECDC4", margin: "0 0 14px", paddingBottom: 8, borderBottom: "1px solid #1E2133" }}>📋 PT 회원 설문지</h4>
                            {[
                              ["이름", survey.pt.name],
                              ["연락처", survey.pt.phone],
                              ["생년월일", survey.pt.birth],
                              ["성별", survey.pt.gender],
                              ["직업", survey.pt.job],
                            ].filter(([,v]) => v).map(([label, value]) => (
                              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}>
                                <span style={{ fontSize: 13, color: "#888" }}>{label}</span>
                                <span style={{ fontSize: 13, color: "#E8E8E8", fontWeight: 600 }}>{value}</span>
                              </div>
                            ))}
                            {survey.pt.goal?.length > 0 && (
                              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}>
                                <span style={{ fontSize: 13, color: "#888" }}>운동목적</span>
                                <span style={{ fontSize: 13, color: "#E8E8E8", fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{Array.isArray(survey.pt.goal) ? survey.pt.goal.join(", ") : survey.pt.goal}</span>
                              </div>
                            )}
                            {survey.pt.expYears && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}><span style={{ fontSize: 13, color: "#888" }}>운동경력</span><span style={{ fontSize: 13, color: "#E8E8E8", fontWeight: 600 }}>{survey.pt.expYears}</span></div>}
                            {survey.pt.freq && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}><span style={{ fontSize: 13, color: "#888" }}>운동빈도</span><span style={{ fontSize: 13, color: "#E8E8E8", fontWeight: 600 }}>{survey.pt.freq}</span></div>}
                            {survey.pt.extype?.length > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}><span style={{ fontSize: 13, color: "#888" }}>운동경험</span><span style={{ fontSize: 13, color: "#E8E8E8", fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{Array.isArray(survey.pt.extype) ? survey.pt.extype.join(", ") : survey.pt.extype}</span></div>}
                            {survey.pt.medication && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}><span style={{ fontSize: 13, color: "#888" }}>복용약</span><span style={{ fontSize: 13, color: "#E8E8E8", fontWeight: 600 }}>{survey.pt.medication}</span></div>}
                            {survey.pt.painZones?.length > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}><span style={{ fontSize: 13, color: "#888" }}>통증부위</span><span style={{ fontSize: 13, color: "#FF6B6B", fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{Array.isArray(survey.pt.painZones) ? survey.pt.painZones.map(v => typeof v === "string" ? v : (v?.label || "")).filter(Boolean).join(", ") : survey.pt.painZones}</span></div>}
                            {survey.pt.noPain && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}><span style={{ fontSize: 13, color: "#888" }}>통증여부</span><span style={{ fontSize: 13, color: "#4ECDC4", fontWeight: 600 }}>통증 없음</span></div>}
                            {survey.pt.healthDetail && <div style={{ padding: "8px 0", borderBottom: "1px solid #1E2133" }}><div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>건강 상세</div><div style={{ fontSize: 13, color: "#E8E8E8", lineHeight: 1.6 }}>{survey.pt.healthDetail}</div></div>}
                            {survey.pt.sleep && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}><span style={{ fontSize: 13, color: "#888" }}>수면</span><span style={{ fontSize: 13, color: "#E8E8E8", fontWeight: 600 }}>{survey.pt.sleep}</span></div>}
                            {survey.pt.meal && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}><span style={{ fontSize: 13, color: "#888" }}>식사횟수</span><span style={{ fontSize: 13, color: "#E8E8E8", fontWeight: 600 }}>{survey.pt.meal}</span></div>}
                            {survey.pt.smoke && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}><span style={{ fontSize: 13, color: "#888" }}>흡연</span><span style={{ fontSize: 13, color: "#E8E8E8", fontWeight: 600 }}>{survey.pt.smoke}</span></div>}
                            {survey.pt.drink && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}><span style={{ fontSize: 13, color: "#888" }}>음주</span><span style={{ fontSize: 13, color: "#E8E8E8", fontWeight: 600 }}>{survey.pt.drink}</span></div>}
                            {survey.pt.activity && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}><span style={{ fontSize: 13, color: "#888" }}>활동강도</span><span style={{ fontSize: 13, color: "#E8E8E8", fontWeight: 600 }}>{survey.pt.activity}</span></div>}
                            {survey.pt.stress && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}><span style={{ fontSize: 13, color: "#888" }}>스트레스</span><span style={{ fontSize: 13, color: "#E8E8E8", fontWeight: 600 }}>{survey.pt.stress}/10</span></div>}
                            {survey.pt.motive && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}><span style={{ fontSize: 13, color: "#888" }}>운동의지</span><span style={{ fontSize: 13, color: "#E8E8E8", fontWeight: 600 }}>{survey.pt.motive}/10</span></div>}
                            {survey.pt.timeSlot?.length > 0 && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}><span style={{ fontSize: 13, color: "#888" }}>선호시간대</span><span style={{ fontSize: 13, color: "#E8E8E8", fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{Array.isArray(survey.pt.timeSlot) ? survey.pt.timeSlot.join(", ") : survey.pt.timeSlot}</span></div>}
                            {survey.pt.ptExp && <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2133" }}><span style={{ fontSize: 13, color: "#888" }}>PT경험</span><span style={{ fontSize: 13, color: "#E8E8E8", fontWeight: 600 }}>{survey.pt.ptExp}</span></div>}
                            {survey.pt.expectation && <div style={{ padding: "8px 0", borderBottom: "1px solid #1E2133" }}><div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>기대하는 점</div><div style={{ fontSize: 13, color: "#E8E8E8", lineHeight: 1.6 }}>{survey.pt.expectation}</div></div>}
                            {survey.pt.note && <div style={{ padding: "8px 0", borderBottom: "1px solid #1E2133" }}><div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>전달사항</div><div style={{ fontSize: 13, color: "#E8E8E8", lineHeight: 1.6 }}>{survey.pt.note}</div></div>}
                          </>
                        )}
                        {/* PAR-Q */}
                        <h4 style={{ fontSize: 14, color: "#4ECDC4", margin: "0 0 14px", paddingBottom: 8, borderBottom: "1px solid #1E2133" }}>📋 PAR-Q 신체활동 준비도 설문지</h4>
                        {[
                          "의사가 당신의 심장에 이상이 있고, 의사권고에 따라 신체활동을 해야 한다는 말을 들었습니까?",
                          "신체활동을 할 때 가슴에 통증을 느낀 적이 있습니까?",
                          "지난 달에 쉬고 있는 도중에도 가슴에 통증을 느낀 적이 있습니까?",
                          "어지럼증 때문에 몸의 균형을 잃거나 의식을 잃은 적이 있습니까?",
                          "신체활동의 변화가 생기면 악화될 수 있는 뼈나 관절의 문제(예: 허리, 무릎 등)가 있습니까?",
                          "현재 혈압이나 심장질환으로 의사로부터 약(예: 이뇨제) 등을 처방받고 있습니까?",
                          "신체활동을 하지 말아야 하는 다른 어떤 이유를 알고 있는 것이 있습니까?",
                        ].map((q, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #1E2133" }}>
                            <span style={{ fontSize: 13, color: "#C0C0C0", flex: 1, marginRight: 12, lineHeight: 1.5 }}>{i+1}. {q}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: survey.parqAnswers?.[i] === true ? "#FF6B6B" : "#4ECDC4", whiteSpace: "nowrap", minWidth: 45 }}>
                              {survey.parqAnswers?.[i] === true ? "그렇다" : survey.parqAnswers?.[i] === false ? "아니다" : "-"}
                            </span>
                          </div>
                        ))}

                        {/* PAR-Q+ 일반 */}
                        <h4 style={{ fontSize: 14, color: "#A78BFA", margin: "20px 0 14px", paddingBottom: 8, borderBottom: "1px solid #1E2133" }}>📋 PAR-Q+ 일반 건강 질문</h4>
                        {[
                          "의사가 당신의 심장질환 또는 고혈압에 대해 이야기한 적이 있습니까?",
                          "안정 시나 일상활동 중 또는 신체활동 할 때 가슴에 통증이 있습니까?",
                          "지난 12개월 동안 어지럼증으로 쓰러졌거나 의식을 잃은 적이 있습니까?",
                          "심장병이나 고혈압 이외의 다른 만성질환으로 진단받은 적이 있습니까?",
                          "현재 만성질환을 치료하기 위해 처방약을 복용하고 있습니까?",
                          "신체활동을 통해 더 악화될 수 있는 뼈, 관절 또는 연부조직 문제가 현재(또는 지난 12개월 이내) 있습니까?",
                          "의사가 의학적인 감독하에서만 신체활동을 해야 한다고 말했습니까?",
                        ].map((q, i) => (
                          <div key={i}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #1E2133" }}>
                              <span style={{ fontSize: 13, color: "#C0C0C0", flex: 1, marginRight: 12, lineHeight: 1.5 }}>{i+1}. {q}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: survey.parqPlusGeneral?.[i] === true ? "#FF6B6B" : "#4ECDC4", whiteSpace: "nowrap", minWidth: 45 }}>
                                {survey.parqPlusGeneral?.[i] === true ? "그렇다" : survey.parqPlusGeneral?.[i] === false ? "아니다" : "-"}
                              </span>
                            </div>
                            {i === 3 && survey.disease4Note && <div style={{ padding: "6px 10px", background: "#0F1117", borderRadius: 6, margin: "4px 0 8px" }}><span style={{ fontSize: 11, color: "#888" }}>기술: </span><span style={{ fontSize: 12, color: "#E8E8E8" }}>{survey.disease4Note}</span></div>}
                            {i === 4 && survey.disease5Note && <div style={{ padding: "6px 10px", background: "#0F1117", borderRadius: 6, margin: "4px 0 8px" }}><span style={{ fontSize: 11, color: "#888" }}>기술: </span><span style={{ fontSize: 12, color: "#E8E8E8" }}>{survey.disease5Note}</span></div>}
                            {i === 5 && survey.disease6Note && <div style={{ padding: "6px 10px", background: "#0F1117", borderRadius: 6, margin: "4px 0 8px" }}><span style={{ fontSize: 11, color: "#888" }}>기술: </span><span style={{ fontSize: 12, color: "#E8E8E8" }}>{survey.disease6Note}</span></div>}
                          </div>
                        ))}

                        {/* PAR-Q+ 추가 질문 - 항상 표시 */}
                        {Object.keys(survey.parqPlusFollowup || {}).length > 0 && (
                          <>
                            <h4 style={{ fontSize: 14, color: "#FFA500", margin: "20px 0 14px", paddingBottom: 8, borderBottom: "1px solid #1E2133" }}>📋 PAR-Q+ 추가 질문</h4>
                            {[
                              { id: "q1", main: "관절염, 골다공증, 또는 허리에 문제가 있습니까?", subs: ["약물/치료로 질환 조절 어려움", "관절 통증, 골절, 척추 문제", "스테로이드 주사 3개월 이상"] },
                              { id: "q2", main: "어떤 종류의 암을 지니고 있습니까?", subs: ["폐/기관지, 다발성 골수종, 두경부, 목 유형", "현재 암 치료(화학/방사선) 중"] },
                              { id: "q3", main: "심장이나 심혈관질환이 있습니까?", subs: ["약물/치료로 질환 조절 어려움", "불규칙한 심장박동", "만성심부전", "관상동맥질환 + 2개월 미운동"] },
                              { id: "q4", main: "고혈압이 있습니까?", subs: ["약물/치료로 질환 조절 어려움", "안정 시 혈압 160/90mmHg 이상"] },
                              { id: "q5", main: "대사질환이 있습니까? (당뇨 등)", subs: ["혈당 조절 어려움", "저혈당 증상", "당뇨 합병증", "다른 대사질환", "고강도 운동 계획"] },
                              { id: "q6", main: "정신건강 문제나 학습장애가 있습니까?", subs: ["약물/치료로 질환 조절 어려움", "신경/근육에 영향 미치는 허리 문제"] },
                              { id: "q7", main: "호흡기 질환이 있습니까?", subs: ["약물/치료로 질환 조절 어려움", "혈중산소수치 낮음", "천식 증상", "폐혈관 고혈압"] },
                              { id: "q8", main: "척추 손상이 있습니까?", subs: ["약물/치료로 질환 조절 어려움", "낮은 혈압으로 현기증", "자율신경반사장애"] },
                              { id: "q9", main: "뇌졸중이 있었습니까?", subs: ["약물/치료로 질환 조절 어려움", "걷기/이동 장애", "6개월 내 뇌졸중"] },
                              { id: "q10", main: "기타 질환이 있습니까?", subs: ["12개월 내 뇌진탕", "기타 질병", "2가지 이상 질병"] },
                            ].map(group => {
                              const mainVal = survey.parqPlusFollowup?.[`${group.id}_main`];
                              return (
                                <div key={group.id} style={{ marginBottom: 12 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #1E2133" }}>
                                    <span style={{ fontSize: 13, color: "#C0C0C0", flex: 1, marginRight: 12, lineHeight: 1.5 }}>{group.main}</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: mainVal === true ? "#FF6B6B" : mainVal === false ? "#4ECDC4" : "#555", whiteSpace: "nowrap", minWidth: 45 }}>
                                      {mainVal === true ? "그렇다" : mainVal === false ? "아니다" : "-"}
                                    </span>
                                  </div>
                                  {mainVal === true && group.subs.map((sub, si) => {
                                    const subVal = survey.parqPlusFollowup?.[`${group.id}_${si}`];
                                    return (
                                      <div key={si} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "6px 0 6px 12px", borderBottom: "1px solid #1A1D27" }}>
                                        <span style={{ fontSize: 12, color: "#888", flex: 1, marginRight: 12 }}>└ {sub}</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: subVal === true ? "#FF6B6B" : subVal === false ? "#666" : "#555", whiteSpace: "nowrap", minWidth: 45 }}>
                                          {subVal === true ? "그렇다" : subVal === false ? "아니다" : "-"}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#555" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                    <p style={{ fontSize: 14, fontFamily: "'Noto Sans KR', sans-serif" }}>아직 설문지를 제출하지 않았어요</p>
                    <p style={{ fontSize: 13, color: "#444" }}>위 링크를 회원에게 공유해 주세요</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "inbody" && (
              <div>
                {/* 회원용 인바디 입력 링크 */}
                <div style={{ background: "#151821", border: "1px solid #2A2D3E", borderRadius: 12, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#E8E8E8", fontWeight: 600, marginBottom: 2 }}>📲 회원 인바디 입력 링크</div>
                    <div style={{ fontSize: 12, color: "#555" }}>회원이 직접 수치를 입력할 수 있어요</div>
                  </div>
                  <button onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/#/inbody/${selected.id}`);
                    alert("링크가 복사됐어요!");
                  }}
                    style={{ background: "#4ECDC422", border: "1px solid #4ECDC444", borderRadius: 8, padding: "8px 14px", color: "#4ECDC4", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", whiteSpace: "nowrap" }}>
                    링크 복사
                  </button>
                </div>
                {inbodyData.length > 0 && (
                  <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: "16px", marginBottom: 20 }}>
                    <p style={{ margin: "0 0 12px", fontSize: 13, color: "#888" }}>📈 변화 추이</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={inbodyData}>
                        <XAxis dataKey="date" stroke="#555" tick={{ fontSize: 10, fill: "#666" }} />
                        <YAxis stroke="#555" tick={{ fontSize: 10, fill: "#666" }} width={30} />
                        <Tooltip contentStyle={{ background: "#1A1D27", border: "1px solid #2A2D3E", borderRadius: 8, color: "#E8E8E8", fontSize: 11 }} />
                        <Line type="monotone" dataKey="체중" stroke="#4ECDC4" strokeWidth={2} dot={{ fill: "#4ECDC4", r: 3 }} />
                        <Line type="monotone" dataKey="골격근량" stroke="#6BCB77" strokeWidth={2} dot={{ fill: "#6BCB77", r: 3 }} />
                        <Line type="monotone" dataKey="체지방률" stroke="#FF6B6B" strokeWidth={2} dot={{ fill: "#FF6B6B", r: 3 }} />
                        <Line type="monotone" dataKey="체지방량" stroke="#FFA500" strokeWidth={2} dot={{ fill: "#FFA500", r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                      {[
                        { key: "체중", color: "#4ECDC4", unit: "kg" },
                        { key: "골격근량", color: "#6BCB77", unit: "kg" },
                        { key: "체지방률", color: "#FF6B6B", unit: "%" },
                        { key: "체지방량", color: "#FFA500", unit: "kg" },
                      ].map(({ key, color, unit }) => (
                        <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                          <span style={{ fontSize: 11, color: "#888" }}>{key}({unit})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 컨디션 그래프 */}
                {inbodyData.some(d => d.컨디션) && (
                  <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 16, padding: "16px", marginBottom: 20 }}>
                    <p style={{ margin: "0 0 12px", fontSize: 13, color: "#F9CA24" }}>🌟 컨디션 변화</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={inbodyData}>
                        <XAxis dataKey="date" stroke="#555" tick={{ fontSize: 10, fill: "#666" }} />
                        <YAxis stroke="#555" tick={{ fontSize: 10, fill: "#666" }} width={30} domain={[0, 6]} ticks={[1,2,3,4,5]}
                          tickFormatter={v => ["","😴","😐","🙂","😊","💪"][v] || ""} />
                        <Tooltip contentStyle={{ background: "#1A1D27", border: "1px solid #2A2D3E", borderRadius: 8, color: "#E8E8E8", fontSize: 11 }}
                          formatter={(value, name, props) => [props.payload.컨디션이모지 || value, "컨디션"]} />
                        <Line type="monotone" dataKey="컨디션" stroke="#F9CA24" strokeWidth={2}
                          dot={{ fill: "#F9CA24", r: 5 }} activeDot={{ r: 7 }} connectNulls={false} />
                      </LineChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px", fontSize: 11, color: "#555" }}>
                      <span>😴 최악</span><span>😐</span><span>🙂</span><span>😊</span><span>💪 최고</span>
                    </div>
                  </div>
                )}

                {/* 최근 기록 1건만 표시 */}
                <div style={{ marginBottom: 20 }}>
                  {(selected.inbody || []).length === 0 && !showInbodyAdd && (
                    <p style={{ color: "#555", fontSize: 14, textAlign: "center", margin: "20px 0" }}>인바디 기록이 없습니다</p>
                  )}
                  {(selected.inbody || []).length > 0 && (() => {
                    const latest = [...(selected.inbody || [])].sort((a, b) => b.date.localeCompare(a.date))[0];
                    return (
                      <div style={{ background: "#151821", border: "1px solid #4ECDC4", borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                          <div style={{ fontSize: 12, color: "#4ECDC4", fontWeight: 600 }}>📅 최근 기록 · {formatDate(latest.date)}</div>
                          <span style={{ fontSize: 11, color: "#555" }}>총 {(selected.inbody || []).length}회 기록</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          {[
                            { label: "체중", value: latest.weight, unit: "kg", color: "#4ECDC4" },
                            { label: "골격근량", value: latest.muscle, unit: "kg", color: "#6BCB77" },
                            { label: "체지방률", value: latest.fat, unit: "%", color: "#FF6B6B" },
                            { label: "체지방량", value: latest.fatmass, unit: "kg", color: "#FFA500" },
                          ].map(({ label, value, unit, color }) => (
                            <div key={label} style={{ background: "#0F1117", borderRadius: 8, padding: "8px 12px" }}>
                              <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>{label}</div>
                              <div style={{ fontSize: 16, fontWeight: 700, color: value ? color : "#333" }}>
                                {value ? `${value}${unit}` : "-"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                {showInbodyAdd ? (
                  <div style={{ background: "#151821", border: "1px solid #2A2D3E", borderRadius: 16, padding: "18px", marginBottom: 20 }}>
                    <h4 style={{ margin: "0 0 16px", fontSize: 14, color: "#E8E8E8", fontWeight: 600 }}>📊 인바디 기록 추가</h4>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 5 }}>측정일</label>
                      <div style={{ position: "relative" }} onClick={() => document.getElementById("inbody-date-input").showPicker?.()}>
                        <input id="inbody-date-input" type="date" value={inbodyForm.date} max={today()}
                          onChange={e => setInbodyForm({...inbodyForm, date: e.target.value})}
                          style={{ ...inputStyle, colorScheme: "dark", width: "100%", cursor: "pointer" }} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                      {[
                        { key: "weight", label: "체중 (kg)" }, { key: "muscle", label: "골격근량 (kg)" },
                        { key: "fat", label: "체지방률 (%)" }, { key: "fatmass", label: "체지방량 (kg)" },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 5 }}>{label}</label>
                          <input type="number" step="0.1" value={inbodyForm[key]} onChange={e => setInbodyForm({...inbodyForm, [key]: e.target.value})}
                            placeholder="0.0" style={{ ...inputStyle, padding: "10px 12px" }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setShowInbodyAdd(false)}
                        style={{ flex: 1, background: "#2A2D3E", border: "none", borderRadius: 10, padding: "12px", color: "#E8E8E8", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>취소</button>
                      <button onClick={addInbody} disabled={saving || !inbodyForm.weight}
                        style={{ flex: 2, background: inbodyForm.weight && !saving ? "#A78BFA" : "#2A2D3E", border: "none", borderRadius: 10, padding: "12px", color: inbodyForm.weight ? "#0F1117" : "#555", fontWeight: 700, fontSize: 14, cursor: inbodyForm.weight ? "pointer" : "not-allowed", fontFamily: "'Noto Sans KR', sans-serif" }}>
                        {saving ? "저장 중..." : "저장"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowInbodyAdd(true)}
                    style={{ width: "100%", background: "#151821", border: "1px dashed #A78BFA66", borderRadius: 12, padding: "14px", color: "#A78BFA", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
                    + 인바디 기록 추가
                  </button>
                )}

                {/* 전체 기록 목록 */}
                {(selected.inbody || []).length > 0 && (
                  <div style={{ background: "#151821", border: "1px solid #1E2133", borderRadius: 14, padding: "16px", marginTop: 16 }}>
                    <p style={{ fontSize: 12, color: "#888", fontWeight: 700, marginBottom: 12 }}>📅 전체 기록</p>
                    {[...(selected.inbody || [])].sort((a, b) => b.date.localeCompare(a.date)).map((d, i) => (
                      <div key={i} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: i < (selected.inbody || []).length - 1 ? "1px solid #1E2133" : "none" }}>
                        {editingInbodyIdx === i ? (
                          <div>
                            <div style={{ marginBottom: 8 }}>
                              <input type="date" value={editingInbodyForm.date} max={today()}
                                onChange={e => setEditingInbodyForm({ ...editingInbodyForm, date: e.target.value })}
                                style={{ ...inputStyle, fontSize: 13, padding: "8px 12px", colorScheme: "dark" }} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                              {[
                                { key: "weight", label: "체중", unit: "kg", color: "#4ECDC4" },
                                { key: "muscle", label: "골격근량", unit: "kg", color: "#6BCB77" },
                                { key: "fat", label: "체지방률", unit: "%", color: "#FF6B6B" },
                                { key: "fatmass", label: "체지방량", unit: "kg", color: "#FFA500" },
                              ].map(({ key, label, unit, color }) => (
                                <div key={key} style={{ background: "#0F1117", borderRadius: 8, padding: "8px 10px", border: "1px solid " + color + "33" }}>
                                  <div style={{ fontSize: 10, color: color, fontWeight: 700, marginBottom: 4 }}>{label}</div>
                                  <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                                    <input type="number" step="0.1" value={editingInbodyForm[key]}
                                      onChange={e => setEditingInbodyForm({ ...editingInbodyForm, [key]: e.target.value })}
                                      style={{ background: "transparent", border: "none", outline: "none", color: color, fontSize: 16, fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif", width: "100%" }} />
                                    <span style={{ fontSize: 10, color: "#555" }}>{unit}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                              <button onClick={() => { setEditingInbodyIdx(null); setEditingInbodyForm(null); }}
                                style={{ padding: "9px", background: "#2A2D3E", border: "none", borderRadius: 8, color: "#888", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>취소</button>
                              <button onClick={saveEditInbody} disabled={saving}
                                style={{ padding: "9px", background: "#4ECDC4", border: "none", borderRadius: 8, color: "#0F1117", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>{saving ? "저장 중..." : "저장"}</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>{formatDate(d.date)}</div>
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
                              <button onClick={() => { setEditingInbodyIdx(i); setEditingInbodyForm({ date: d.date, weight: d.weight ?? "", muscle: d.muscle ?? "", fat: d.fat ?? "", fatmass: d.fatmass ?? "" }); setShowInbodyAdd(false); }}
                                style={{ padding: "5px 10px", background: "#1E2133", border: "none", borderRadius: 6, color: "#888", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>수정</button>
                              <button onClick={() => deleteInbody(i)} disabled={saving}
                                style={{ padding: "5px 10px", background: "#FF6B6B18", border: "none", borderRadius: 6, color: "#FF6B6B", fontSize: 11, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>삭제</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ borderTop: "1px solid #1E2133", paddingTop: 24, marginTop: 8 }}>
              {!showMoveConfirm ? (
                <div>
                  <p style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>📁 다른 폴더로 이동</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {currentFolders.filter(f => f.key !== selected.folder).map(f => (
                      <button key={f.key} onClick={() => { setMoveTarget(f.key); setShowMoveConfirm(true); }}
                        style={{ background: "transparent", border: "1px solid " + f.color + "44", borderRadius: 10, padding: "11px 16px", color: f.color, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif", textAlign: "left" }}>
                        {f.emoji} {f.label}로 이동
                      </button>
                    ))}
                  </div>
                  {/* 삭제 버튼 */}
                  <button onClick={deleteMember} disabled={saving}
                    style={{ marginTop: 24, width: "100%", background: "transparent", border: "1px solid #FF6B6B44", borderRadius: 10, padding: "12px", color: "#FF6B6B", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
                    🗑️ {selected.name} 회원 삭제
                  </button>
                </div>
              ) : (
                <div style={{ background: "#13101A", border: "1px solid " + (currentFolders.find(f=>f.key===moveTarget)?.color || "#4ECDC4") + "44", borderRadius: 12, padding: "18px" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, textAlign: "center", color: currentFolders.find(f=>f.key===moveTarget)?.color || "#4ECDC4" }}>
                    {currentFolders.find(f => f.key === moveTarget)?.emoji} {currentFolders.find(f=>f.key===moveTarget)?.label}으로 이동할까요?
                  </p>
                  <p style={{ margin: "0 0 16px", fontSize: 12, color: "#666", textAlign: "center" }}>{selected.name} 회원을 이동합니다.</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => { setShowMoveConfirm(false); setMoveTarget(""); }}
                      style={{ flex: 1, background: "#2A2D3E", border: "none", borderRadius: 8, padding: "11px", color: "#E8E8E8", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>취소</button>
                    <button onClick={moveMember} disabled={saving}
                      style={{ flex: 1, background: currentFolders.find(f=>f.key===moveTarget)?.color || "#4ECDC4", border: "none", borderRadius: 8, padding: "11px", color: "#0F1117", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'Noto Sans KR', sans-serif" }}>
                      {saving ? "이동 중..." : "이동 확인"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {view === "edit" && editForm && renderForm(editForm, setEditForm, submitEdit, "회원 정보 수정")}
        {view === "add" && addForm && renderForm(addForm, setAddForm, submitAdd, "신규 회원 등록")}
      </main>
    </div>
  );
}
