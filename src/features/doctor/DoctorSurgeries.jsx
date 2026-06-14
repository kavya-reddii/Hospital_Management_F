// src/features/doctor/DoctorSurgeries.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import DoctorNavbar from "./DoctorNavbar";
import "./DoctorSurgeries.css";

const DoctorSurgeries = () => {
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  
  // ✅ Track scheduled appointment IDs
  const scheduledIdsRef = useRef(new Set());

  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
    const headers = { Authorization: `Bearer ${token}` };
//     try {
//   await fetch("http://localhost:8081/api/admin/surgeries/maintenance/complete-past", {
//     method: "PUT",
//     headers,
//   });
// } catch (e) {
//   console.warn("maintenance complete-past failed (ignored)", e);
// }
  try {
    setLoading(true);
    
    const [reqRes, schedRes, compRes] = await Promise.all([
      fetch("http://localhost:8081/api/doctor/surgeries/requests", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("http://localhost:8081/api/doctor/surgeries/scheduled", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("http://localhost:8081/api/doctor/surgeries/completed", { headers: { Authorization: `Bearer ${token}` } })
    ]);

    const requestsData = reqRes.ok ? await reqRes.json() : [];
    const scheduledData = schedRes.ok ? await schedRes.json() : [];
    const completedData = compRes.ok ? await compRes.json() : [];

    // 🔥 CRITICAL DEBUG
    console.table("REQUESTS appointmentIds:", requestsData.map(r => ({ id: r.id, apptId: r.appointmentId })));
    console.table("SCHEDULED appointmentIds:", scheduledData.map(s => ({ id: s.id, apptId: s.appointmentId })));
    
    setRequests(requestsData);
    setScheduled(scheduledData);
    setCompleted(completedData);
    
  } catch (err) {
    console.error("Surgeries fetch error:", err);
  } finally {
    setLoading(false);
  }
};


  // ✅ Search filters
  const filteredRequests = useMemo(() => 
    requests.filter(req =>
      req.surgeryType?.toLowerCase().includes(search.toLowerCase()) ||
      req.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      req.doctorUsername?.toLowerCase().includes(search.toLowerCase()) ||
      req.appointmentId?.toString().includes(search)
    ),
    [requests, search]
  );

  const filteredScheduled = useMemo(() => 
    scheduled.filter(surg =>
      surg.surgeryType?.toLowerCase().includes(search.toLowerCase()) ||
      (surg.patient?.fullname || surg.patientName)?.toLowerCase().includes(search.toLowerCase()) ||
      (surg.doctor?.fullname || surg.doctorName)?.toLowerCase().includes(search.toLowerCase()) ||
      surg.appointmentId?.toString().includes(search)
    ),
    [scheduled, search]
  );

  const filteredCompleted = useMemo(() => 
    completed.filter(surg =>
      surg.surgeryType?.toLowerCase().includes(search.toLowerCase()) ||
      (surg.patient?.fullname || surg.patientName)?.toLowerCase().includes(search.toLowerCase()) ||
      (surg.doctor?.fullname || surg.doctorName)?.toLowerCase().includes(search.toLowerCase()) ||
      surg.appointmentId?.toString().includes(search)
    ),
    [completed, search]
  );

  if (loading) {
    return (
      <div className="admin-doctors-page">
        <DoctorNavbar />
        <p style={{ padding: "1.5rem 2rem" }}>Loading surgeries...</p>
      </div>
    );
  }

  return (
    <div className="doctors-surgeries-page">
      <DoctorNavbar />

      <div className="doctor-toolbar">
        <input
          type="text"
          className="doctor-search"
          placeholder="Search by surgery type, patient name, doctor, appointment #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="add-doctor-button" onClick={fetchData}>
          Refresh
        </button>
      </div>

      <div className="surgeries-tabs">
        <button
          className={`tab-btn ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          My Requests ({filteredRequests.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "scheduled" ? "active" : ""}`}
          onClick={() => setActiveTab("scheduled")}
        >
          Scheduled ({filteredScheduled.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed ({filteredCompleted.length})
        </button>
      </div>

      {/* REQUESTS TAB */}
      {activeTab === "requests" && (
        <div className="doctor-grid single-column">
          {filteredRequests.length > 0 ? (
            filteredRequests.map(req => (
              <SurgeryRequestCard key={req.id} request={req} />
            ))
          ) : (
            <div className="doctor-card empty-state">
              <h4>No requests found</h4>
              <p>
                {search
                  ? `No matches for "${search}"`
                  : "Create surgery requests from Appointments"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* SCHEDULED TAB */}
      {activeTab === "scheduled" && (
        <div className="doctor-grid single-column">
          {filteredScheduled.length > 0 ? (
            filteredScheduled.map(surg => (
              <SurgeryCard key={surg.id} surgery={surg} />
            ))
          ) : (
            <div className="doctor-card empty-state">
              <h4>No surgeries found</h4>
              <p>
                {search
                  ? `No matches for "${search}"`
                  : "Requests will appear here after admin approval"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* COMPLETED TAB */}
      {activeTab === "completed" && (
        <div className="doctor-grid single-column">
          {filteredCompleted.length > 0 ? (
            filteredCompleted.map(surg => (
              <CompletedSurgeryCard key={surg.id} surgery={surg} />
            ))
          ) : (
            <div className="doctor-card empty-state">
              <h4>No completed surgeries</h4>
              <p>
                {search
                  ? `No matches for "${search}"`
                  : "Completed surgeries will appear here"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// [Card components unchanged]
const SurgeryRequestCard = ({ request }) => (
  <div className="doctor-card">
    <div className="doctor-info">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #e5e7eb" }}>
        <div>
          <h4>{request.surgeryType}</h4>
          <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0" }}>Patient: {request.patientName} • Appt #{request.appointmentId}</p>
        </div>
        <span style={{ padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.8rem", background: "#fef3c7", color: "#92400e", fontWeight: 600 }}>PENDING</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div><p style={{ fontWeight: 600, color: "#374151", marginBottom: "0.25rem", fontSize: "0.9rem" }}>Priority</p><span style={{ padding: "0.25rem 0.75rem", borderRadius: "20px", background: request.priority === "critical" ? "#fecaca" : "#dbeafe", color: request.priority === "critical" ? "#dc2626" : "#1d4ed8", fontSize: "0.8rem", fontWeight: 600 }}>{request.priority?.toUpperCase()}</span></div>
        <div><p style={{ fontWeight: 600, color: "#374151", marginBottom: "0.25rem", fontSize: "0.9rem" }}>Requested</p><p style={{ margin: 0, fontSize: "0.95rem" }}>{request.requestedDate}</p></div>
      </div>
      <div style={{ paddingTop: "1rem", borderTop: "1px solid #e5e7eb", marginTop: "1rem" }}>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: 0 }}>Waiting for admin approval...</p>
      </div>
    </div>
  </div>
);

const SurgeryCard = ({ surgery }) => (
  <div className="doctor-card">
    <div className="doctor-info">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #e5e7eb" }}>
        <div>
          <h4>{surgery.surgeryType}</h4>
          <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0" }}>Patient: {surgery.patientName} • Appt #{surgery.appointmentId}</p>
        </div>
        <span style={{ padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.8rem", background: "#dcfce7", color: "#166534", fontWeight: 600 }}>SCHEDULED</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div><p style={{ fontWeight: 600, color: "#374151", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Date</p><p style={{ margin: 0, fontSize: "1.1rem" }}>{surgery.surgeryDate}</p></div>
        <div><p style={{ fontWeight: 600, color: "#374151", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Time</p><p style={{ margin: 0, fontSize: "1.1rem" }}>{surgery.surgeryTime}</p></div>
        <div><p style={{ fontWeight: 600, color: "#374151", marginBottom: "0.25rem", fontSize: "0.85rem" }}>OT</p><p style={{ margin: 0, fontSize: "1.1rem" }}>{surgery.operationTheatre}</p></div>
      </div>
    </div>
  </div>
);

const CompletedSurgeryCard = ({ surgery }) => (
  <div className="doctor-card">
    <div className="doctor-info">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", paddingBottom: "1rem" }}>
        <div>
          <h4>{surgery.surgeryType}</h4>
          <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0" }}>Patient: {surgery.patientName} • Appt #{surgery.appointmentId}</p>
        </div>
        <span style={{ padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.8rem", background: "#e5e7eb", color: "#374151", fontWeight: 600 }}>COMPLETED</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        <div><p style={{ fontWeight: 600, color: "#374151", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Date</p><p style={{ margin: 0, fontSize: "1.1rem" }}>{surgery.surgeryDate}</p></div>
        <div><p style={{ fontWeight: 600, color: "#374151", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Time</p><p style={{ margin: 0, fontSize: "1.1rem" }}>{surgery.surgeryTime}</p></div>
        <div><p style={{ fontWeight: 600, color: "#374151", marginBottom: "0.25rem", fontSize: "0.85rem" }}>OT</p><p style={{ margin: 0, fontSize: "1.1rem" }}>{surgery.operationTheatre}</p></div>
      </div>
      <div style={{ paddingTop: "1rem", borderTop: "1px solid #e5e7eb", marginTop: "1rem" }}>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: 0 }}>Completed successfully.</p>
      </div>
    </div>
  </div>
);

export default DoctorSurgeries;
