import React, { useEffect, useState, useCallback, useMemo } from "react";
import AdminNavbar from "./AdminNavbar";
import "../doctor/DoctorInbox.css"

const AdminInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [activeDoctor, setActiveDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({}); // ✅ NEW
  const token = localStorage.getItem("token");

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const res = await fetch("http://localhost:8081/api/admin/inbox/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = res.ok ? await res.json() : [];
    setConversations(data);
  };

  // ✅ NEW: Load unread counts
  const loadUnreadCounts = useCallback(async () => {
    try {
      const promises = conversations.map(async (c) => {
        const res = await fetch(`http://localhost:8081/api/admin/inbox/conversations/${c.id}/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const count = res.ok ? await res.json() : 0;
        return { id: c.id, count };
      });

      const counts = await Promise.all(promises);
      setUnreadCounts(Object.fromEntries(counts.map(c => [c.id, c.count])));
    } catch (e) {
      console.error("Unread counts error:", e);
    }
  }, [conversations, token]);

  // ✅ Run when conversations load
  useEffect(() => {
    if (conversations.length > 0) {
      loadUnreadCounts();
    }
  }, [conversations]);

  const loadMessages = useCallback(async (doctorUsername) => {
    const res = await fetch(
      `http://localhost:8081/api/admin/inbox/conversations/${doctorUsername}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = res.ok ? await res.json() : [];
    setMessages(data);
  }, [token]);

 const handleSelect = async (c) => {
  setActiveDoctor(c);
  await loadMessages(c.id);
  
  // ✅ Mark as read
  await fetch(`http://localhost:8081/api/admin/inbox/conversations/${c.id}/mark-read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // Clear badge
  if (unreadCounts[c.id] > 0) {
    setUnreadCounts(prev => ({ ...prev, [c.id]: 0 }));
  }
};


  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeDoctor) return;

    const res = await fetch(
      `http://localhost:8081/api/admin/inbox/conversations/${activeDoctor.id}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: input }),
      }
    );
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setInput("");
    }
  };

  // ✅ Add unread counts to conversations
  const conversationsWithBadges = useMemo(() => 
    conversations.map(c => ({
      ...c,
      unreadCount: unreadCounts[c.id] || 0
    })), 
  [conversations, unreadCounts]);

  return (
    <div className="doctor-inbox-page">
      <AdminNavbar />
      <div className="inbox-layout">
        <div className="inbox-sidebar">
          <div className="inbox-sidebar-header">
            <h3>Inbox</h3>
          </div>
          <div className="inbox-conversation-list">
            {conversationsWithBadges.length === 0 ? (
              <div className="inbox-empty">No conversations</div>
            ) : (
              conversationsWithBadges.map((c) => (
                <button
                  key={c.id}
                  className={
                    "inbox-conversation-item" +
                    (activeDoctor?.id === c.id ? " active" : "") +
                    (c.unreadCount > 0 ? " has-unread" : "")
                  }
                  onClick={() => handleSelect(c)}
                >
                  <div className="inbox-conv-title">{c.name}</div>
                  {c.unreadCount > 0 && (
                    <div className="unread-badge">
                      {c.unreadCount > 99 ? "99+" : c.unreadCount}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="inbox-chat">
          {activeDoctor ? (
            <>
              <div className="inbox-chat-header">
                <h3>{activeDoctor.name}</h3>
              </div>
              <div className="inbox-chat-messages">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={
                      "inbox-message " +
                      (m.fromDoctor ? "from-them" : "from-me")  // Admin: doctor=from-them
                    }
                  >
                    <div className="inbox-message-content">{m.content}</div>
                    <div className="inbox-message-meta">
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <form className="inbox-chat-input" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" disabled={!input.trim()}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="inbox-chat-empty">
              Select a doctor to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInbox;
