import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import DoctorNavbar from "./DoctorNavbar";
import "./DoctorInbox.css";

const DoctorInbox = () => {
  const [patients, setPatients] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [typingStatus, setTypingStatus] = useState("idle"); // typing, idle
const [unreadCounts, setUnreadCounts] = useState({});

  const [searchParams] = useSearchParams();
  const token = localStorage.getItem("token");

  const loadUnreadCounts = useCallback(async () => {
  try {
    // Patient unread counts
    const patientPromises = patients.map(async (p) => {
      const res = await fetch(`http://localhost:8081/api/doctor/inbox/patients/${p.id}/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const count = res.ok ? await res.json() : 0;
      return { id: p.id, count };
    });

    const patientCounts = await Promise.all(patientPromises);
    
    // Admin unread count
    const adminRes = await fetch("http://localhost:8081/api/doctor/inbox/admin/unread-count", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const adminCount = adminRes.ok ? await adminRes.json() : 0;

    const counts = Object.fromEntries(patientCounts.map(c => [c.id, c.count]));
    counts[19] = adminCount;
    
    setUnreadCounts(counts);
  } catch (e) {
    console.error("Unread counts error:", e);
  }
}, [patients, token]);

useEffect(() => {
  loadPatients();
}, []);

useEffect(() => {
  if (patients.length > 0) {  // ✅ Wait for patients
    loadUnreadCounts();
  }
}, [patients]); 



  // Load patients list for sidebar
  const loadPatients = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/doctor/inbox/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.ok ? await res.json() : [];
      setPatients(data);

      // URL param: ?patientId=8&patientName=Raghu
      const urlPatientId = searchParams.get("patientId");
      if (urlPatientId) {
        const pid = Number(urlPatientId);
        const p = data.find((x) => x.id === pid) || {
          id: pid,
          name: searchParams.get("patientName") || "Patient",
        };
        setActivePatient(p);
        loadMessages(pid);
      }
    } catch (e) {
      console.error("Patients fetch error:", e);
    }
  };

 const loadMessages = useCallback(async (patientId) => {
  try {
    let url;
   
    
    if (patientId===19) {
      url = `http://localhost:8081/api/doctor/inbox/my-admin-messages`;
    } else {
      url = `http://localhost:8081/api/doctor/inbox/patients/${patientId}/messages`;
    }

    const res = await fetch(url, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    const data = res.ok ? await res.json() : [];
    setMessages(data);
  } catch (e) {
    console.error("Messages fetch error:", e);
  }
}, [token]);


 const handleSelectPatient = async (p) => {
  setActivePatient(p);
  await loadMessages(p.id);
  
  // ✅ Mark as read
  if (p.id === 19) {
    await fetch("http://localhost:8081/api/doctor/inbox/admin/mark-read", {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
  } else {
    await fetch(`http://localhost:8081/api/doctor/inbox/patients/${p.id}/mark-read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  
  // Clear badge
  if (unreadCounts[p.id] > 0) {
    setUnreadCounts(prev => ({ ...prev, [p.id]: 0 }));
  }
};



 const handleTyping = (e) => {
  const value = e.target.value;
  setInput(value);
  
  if (activePatient && activePatient.id != 19) {  // Skip admin typing
    const status = value.length > 0 ? "typing" : "idle";
    setTypingStatus(status);
    fetch(
      `http://localhost:8081/api/doctor/inbox/patients/${activePatient.id}/typing?status=${status}`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
    ).catch(console.error);
  }
};


  // ✅ SEND MESSAGE
 const handleSend = async (e) => {
  e.preventDefault();
  if (!input.trim() || !activePatient) return;

  try {
    let url;
    let isAdminChat = activePatient.id == 19;
    
    if (isAdminChat) {
      // Send to admin endpoint
      url = `http://localhost:8081/api/doctor/inbox/admin/messages`;
    } else {
      // Send to patient endpoint
      url = `http://localhost:8081/api/doctor/inbox/patients/${activePatient.id}/messages`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: input }),
    });
    
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setInput("");
      setTypingStatus("idle");
    } else {
      console.error("Send failed:", res.status);
    }
  } catch (e) {
    console.error("Send message failed", e);
  }
};


  const filteredPatients = useMemo(
    () =>
      patients.filter((p) =>
        (p.name || "").toLowerCase().includes(search.toLowerCase())
      ),
    [patients, search]
  );

  // ✅ PINNED ADMIN CHAT FIRST
  const chatsWithAdmin = [
  { 
    id: 19, 
    name: "🛠️ Admin", 
    isAdmin: true,
    unreadCount: unreadCounts[19] || 0
  },
  ...filteredPatients.map(p => ({
    ...p,
    unreadCount: unreadCounts[p.id] || 0
  }))
];


  return (
    <div className="doctor-inbox-page">
      <DoctorNavbar />

      <div className="inbox-layout">
        {/* LEFT: patients list + search */}
        <div className="inbox-sidebar">
          <div className="inbox-sidebar-header">
            <h3>Inbox</h3>
            <input
              type="text"
              className="inbox-search"
              placeholder="Search patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="inbox-conversation-list">
            {chatsWithAdmin.length === 0 ? (
              <div className="inbox-empty">No patients</div>
            ) : (
              chatsWithAdmin.map((p) => (
               <button
  key={p.id}
  className={
    "inbox-conversation-item" +
    (activePatient?.id === p.id ? " active" : "") +
    (p.isAdmin ? " admin-chat" : "") +
    (p.unreadCount > 0 ? " has-unread" : "")
  }
  onClick={() => handleSelectPatient(p)}
>
  <div className="inbox-conv-title">{p.name}</div>
  {p.unreadCount > 0 && (
    <div className="unread-badge">
      {p.unreadCount > 99 ? "99+" : p.unreadCount}
    </div>
  )}
  {p.isAdmin && <div className="inbox-conv-badge">Support</div>}
</button>

              ))
            )}
          </div>
        </div>

        {/* RIGHT: chat with activePatient */}
        <div className="inbox-chat">
          {activePatient ? (
            <>
              <div className="inbox-chat-header">
                <h3>{activePatient.name}</h3>
                {activePatient.isAdmin && <span className="admin-badge">Admin</span>}
              </div>
              <div className="inbox-chat-messages">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={
                      "inbox-message " +
                      (m.fromDoctor ? "from-me" : "from-them")
                    }
                  >
                    <div className="inbox-message-content">{m.content}</div>
                    <div className="inbox-message-meta">
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}

                {/* ✅ TYPING INDICATOR */}
                {typingStatus === "typing" && !activePatient.isAdmin && (
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <span>Patient is typing...</span>
                  </div>
                )}

                {messages.length === 0 && (
                  <div className="inbox-empty">
                    {activePatient.isAdmin ? "Message admin for support" : "No messages yet"}
                  </div>
                )}
              </div>

              <form className="inbox-chat-input" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={handleTyping}
                />
                <button type="submit" disabled={!input.trim()}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="inbox-chat-empty">
              Select a patient to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorInbox;
