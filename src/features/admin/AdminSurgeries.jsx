// src/features/admin/AdminSurgeries.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import AdminNavbar from "./AdminNavbar";
import "./AdminDoctors.css";

const SURGERY_TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00",
  "15:00", "15:30", "16:00", "16:30"
];

const AdminSurgeries = () => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [operationTheatres, setOperationTheatres] = useState([]);

  const [requests, setRequests] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [bookedSlots, setBookedSlots] = useState([]);

  const [newSurgery, setNewSurgery] = useState({
    doctorId: "",
    patientId: "",
    surgeryType: "",
    date: "",
    timeSlot: "",
    operationTheatre: "",
    priority: "normal",
    notes: "",
    requestId: null,
  });

  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [activeTab, setActiveTab] = useState("requests");

  const todayStr = new Date().toISOString().slice(0, 10);
  const token = localStorage.getItem("token");

 // ✅ FIXED useEffect - Add scheduledRes/scheduledData
useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
       try {
        await fetch("http://localhost:8081/api/admin/surgeries/maintenance/complete-past", {
          method: "PUT",
          headers,
        });
      } catch (e) {
        console.warn("maintenance complete-past failed (ignored)", e);
      }

      // ✅ Added scheduledRes fetch
      const [docRes, patRes, reqRes, scheduledRes, completedRes] = await Promise.all([
        fetch("http://localhost:8081/api/admin/doctor", { headers }),
        fetch("http://localhost:8081/api/admin/patient", { headers }),
        fetch("http://localhost:8081/api/admin/surgeries/requests", { headers }),
        fetch("http://localhost:8081/api/admin/surgeries?status=scheduled", { headers }),
        fetch("http://localhost:8081/api/admin/surgeries?status=completed", { headers }),
      ]);

      const safeJson = async (res, label) => {
        if (!res.ok) {
          console.error(`${label}: ${res.status}`);
          return [];
        }
        const text = await res.text();
        return text.trim() ? JSON.parse(text) : [];
      };

      // ✅ Added scheduledData
      const [docData, patData, reqData, scheduledData, completedData] = await Promise.all([
        safeJson(docRes, "doctors"),
        safeJson(patRes, "patients"),
        safeJson(reqRes, "requests"),
        safeJson(scheduledRes, "scheduled"),
         safeJson(completedRes, "completed"), 
      ]);

      setDoctors(docData);
      setPatients(patData);
      setRequests(reqData);
      setScheduled(scheduledData);  // ✅ SET SCHEDULED DATA
       setCompleted(completedData);  
      setOperationTheatres(["OT-1", "OT-2", "OT-3"]);
    } catch (err) {
      console.error("Error loading surgeries", err);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [token]);

// ✅ FIXED refreshData - Add scheduledRes/scheduledData
const refreshData = useCallback(async () => {
  try {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await fetch("http://localhost:8081/api/admin/surgeries/maintenance/complete-past", {
        method: "PUT",
        headers,
      });
    } catch (e) {
      console.warn("maintenance complete-past failed (ignored)", e);
    }

    // ✅ Added scheduledRes fetch
    const [docRes, patRes, reqRes, scheduledRes, completedRes] = await Promise.all([
      fetch("http://localhost:8081/api/admin/doctor", { headers }),
      fetch("http://localhost:8081/api/admin/patient", { headers }),
      fetch("http://localhost:8081/api/admin/surgeries/requests", { headers }),
      fetch("http://localhost:8081/api/admin/surgeries?status=scheduled", { headers }),
      fetch("http://localhost:8081/api/admin/surgeries?status=completed", { headers }),
    ]);

    const safeJson = async (res, label) => {
      if (!res.ok) {
        console.error(`${label}: ${res.status}`);
        return [];
      }
      const text = await res.text();
      return text.trim() ? JSON.parse(text) : [];
    };

    // ✅ Added scheduledData
    const [docData, patData, reqData, scheduledData, completedData] = await Promise.all([
      safeJson(docRes, "doctors"),
      safeJson(patRes, "patients"),
      safeJson(reqRes, "requests"),
      safeJson(scheduledRes, "scheduled"),
       safeJson(completedRes, "completed"),  
    ]);

    setDoctors(docData);
    setPatients(patData);
    setRequests(reqData);
    setScheduled(scheduledData);  // ✅ SET SCHEDULED DATA
    setCompleted(completedData);
  } catch (err) {
    console.error("Error refreshing data", err);
  } finally {
    setLoading(false);
  }
}, [token]);


  const toggleModal = () => {
    setErrors({});
    setServerError("");
    setIsModalOpen(prev => !prev);
    if (!isModalOpen) {
      setNewSurgery({
        doctorId: "",
        patientId: "",
        surgeryType: "",
        date: "",
        timeSlot: "",
        operationTheatre: "",
        priority: "normal",
        notes: "",
        requestId: null,
        appointmentId:"",
      });
      setBookedSlots([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "doctorId") {
      setNewSurgery(prev => ({ ...prev, doctorId: value }));
      setBookedSlots([]);
      return;
    }
    if (name === "patientId") {
      setNewSurgery(prev => ({ ...prev, patientId: value }));
      return;
    }

    setNewSurgery(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = async (e) => {
    const value = e.target.value;
    if (value < todayStr) {
      alert("You cannot schedule surgeries for past dates");
      return;
    }

    setNewSurgery(prev => ({ ...prev, date: value }));
    setBookedSlots([]);

    if (!newSurgery.doctorId || !value) return;

    try {
      const res = await fetch(
        `http://localhost:8081/api/admin/surgeries/doctor/${newSurgery.doctorId}/date/${value}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json().catch(() => []);
        setBookedSlots(data.map(s => s.surgeryTime));
      }
    } catch (err) {
      console.error("Error loading booked surgery slots", err);
    }
  };

  const validate = () => {
    const errs = {};
    if (!newSurgery.doctorId) errs.doctorId = "Doctor is required";
    if (!newSurgery.patientId) errs.patientId = "Patient is required";
    if (!newSurgery.surgeryType) errs.surgeryType = "Surgery type is required";
    if (!newSurgery.date) errs.date = "Date is required";
    if (!newSurgery.timeSlot) errs.timeSlot = "Time slot is required";
    if (!newSurgery.operationTheatre) errs.operationTheatre = "OT is required";
    return errs;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const errs = validate();
  setErrors(errs);
  setServerError("");
  if (Object.keys(errs).length > 0) return;

  try {
    const url = "http://localhost:8081/api/admin/surgeries";
    const payload = {
      doctorId: Number(newSurgery.doctorId),
      patientId: Number(newSurgery.patientId),
      surgeryType: newSurgery.surgeryType,
      surgeryDate: newSurgery.date,
      surgeryTime: newSurgery.timeSlot,
      operationTheatre: newSurgery.operationTheatre,
      priority: newSurgery.priority,
      notes: newSurgery.notes,
      appointmentId: newSurgery.appointmentId || null,
      requestId: newSurgery.requestId || null,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Failed to save surgery", res.status, text);
      setServerError("Failed to save surgery. Please try again.");
      return;
    }

    const saved = await res.json();

    // 🔥 If this was scheduled from a request, delete that request in backend + UI
    if (newSurgery.requestId) {
      await fetch(
        `http://localhost:8081/api/admin/surgery-requests/${newSurgery.requestId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRequests(prev =>
        prev.filter(r => r.id !== newSurgery.requestId)
      );
      console.log("✅ Removed request #" + newSurgery.requestId);
    }

    // Add to scheduled state (optional, since refreshData also does it)
    setScheduled(prev => [...prev, saved]);

    toggleModal();
    await refreshData(); // reload from DB
  } catch (err) {
    console.error("Error saving surgery", err);
    setServerError("Something went wrong. Please try again.");
  }
};

  // ✅ FIXED AUTO-SCHEDULE FUNCTION
  const handleScheduleFromRequest = useCallback(async (req) => {
    console.log("📋 Auto-scheduling request:", req);
    
    const doctor = doctors.find(d => 
      d.username === req.doctorUsername || 
      d.user?.username === req.doctorUsername
    );
    
    if (!doctor?.id) {
      alert("Doctor not found!");
      return;
    }
    
    // Open modal PRE-FILLED with request data (patient needs manual selection)
    setNewSurgery({
      doctorId: String(doctor.id),
      patientId: "",
      surgeryType: req.surgeryType,
      date: req.surgeryDate || "",
      timeSlot: req.surgeryTime || "",
      operationTheatre: req.operationTheatre || "",
      priority: req.priority || "normal",
      notes: `From request #${req.id}: ${req.notes || ""}`,
      requestId: req.id,
      appointmentId: req.appointmentId ,
    });
    
    setBookedSlots([]);
    setErrors({});
    setServerError("");
    setIsModalOpen(true);
    
    console.log("✅ Modal opened with pre-filled data");
  }, [doctors]);

  const filteredRequests = useMemo(
    () =>
      requests.filter(r => {
        const patientName = r.patientName || 
                           r.patient?.fullname || 
                           r.patientname || 
                           r.patient_fullname || 
                           (r.patient && r.patient.fullname) || 
                           'N/A';
        
        const doctorName = r.doctorName || 
                          r.doctorUsername || 
                          r.doctor?.fullname || 
                          r.doctorname || 
                          'N/A';
        
        const surgeryType = r.surgeryType || r.surgery_type || '';
        
        const text = `${patientName} ${doctorName} ${surgeryType}`.toLowerCase();
        
        if (!text.includes(search.toLowerCase())) return false;
        
        const reqDate = r.requestedDate || r.createdAt || r.requestDate || r.date;
        if (filterDate && reqDate !== filterDate) return false;
        
        return true;
      }),
    [requests, search, filterDate]
  );

  // ✅ Replace filteredScheduled useMemo
const filteredScheduled = useMemo(() => {
  return scheduled.filter(s => {
    const doctorName = s.doctor?.fullname || s.doctorName || '';
    const patientName = s.patient?.fullname || s.patientName || '';
    const surgeryType = s.surgeryType || '';
    
    const text = `${doctorName} ${patientName} ${surgeryType}`.toLowerCase();
    if (!text.includes(search.toLowerCase())) return false;
    
    if (filterDate && s.surgeryDate !== filterDate) return false;
    return true;
  });
}, [scheduled, search, filterDate]);

const filteredCompleted = useMemo(() => {
  return completed.filter(s => {
    const doctorName = s.doctor?.fullname || s.doctorName || '';
    const patientName = s.patient?.fullname || s.patientName || '';
    const surgeryType = s.surgeryType || '';

    const text = `${doctorName} ${patientName} ${surgeryType}`.toLowerCase();
    if (!text.includes(search.toLowerCase())) return false;

    if (filterDate && s.surgeryDate !== filterDate) return false;
    return true;
  });
}, [completed, search, filterDate]);


  if (loading) {
    return (
      <div className="admin-doctors-page">
        <AdminNavbar />
        <p style={{ padding: "1.5rem 2rem" }}>Loading surgeries...</p>
      </div>
    );
  }

  return (
    <div className="admin-doctors-page">
      <AdminNavbar />

      <div className="doctor-toolbar">
        <input
          type="text"
          className="doctor-search"
          placeholder="Search by doctor, patient or surgery..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="date"
          className="doctor-search"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value || "")}
          style={{ maxWidth: "200px" }}
        />

        <button className="add-doctor-button" onClick={toggleModal}>
          Schedule surgery
        </button>
      </div>

      {/* Tabs */}
      <div className="surgeries-tabs">
        <button
          className={`tab-btn ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          Requests ({filteredRequests.length})
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

      {/* Modal for schedule */}
      {isModalOpen && (
        <div className="add-doctor-overlay">
          <div className="add-doctor-dialog">
            <div className="add-doctor-header">
              <h2>Schedule Surgery</h2>
              <button className="add-doctor-close" onClick={toggleModal}>
                ×
              </button>
            </div>

            <form className="add-doctor-form" onSubmit={handleSubmit}>
              {serverError && (
                <p className="error-text" style={{ marginBottom: "0.75rem" }}>
                  {serverError}
                </p>
              )}

              <div className="add-doctor-body">
                {/* LEFT */}
                <div className="add-doctor-column">
                  <div className="add-field">
                    <label>Doctor *</label>
                    <select
                      name="doctorId"
                      value={newSurgery.doctorId}
                      onChange={handleChange}
                    >
                      <option value="">Select doctor</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.fullname} ({d.branch})
                        </option>
                      ))}
                    </select>
                    {errors.doctorId && (
                      <p className="error-text">{errors.doctorId}</p>
                    )}
                  </div>

                  <div className="add-field">
                    <label>Patient *</label>
                    <select
                      name="patientId"
                      value={newSurgery.patientId}
                      onChange={handleChange}
                    >
                      <option value="">Select patient</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.fullname}
                        </option>
                      ))}
                    </select>
                    {errors.patientId && (
                      <p className="error-text">{errors.patientId}</p>
                    )}
                  </div>

                  <div className="add-field">
                    <label>Surgery type *</label>
                    <input
                      type="text"
                      name="surgeryType"
                      value={newSurgery.surgeryType}
                      onChange={handleChange}
                      placeholder="Appendectomy, CABG, etc."
                    />
                    {errors.surgeryType && (
                      <p className="error-text">{errors.surgeryType}</p>
                    )}
                  </div>
                </div>

                {/* RIGHT */}
                <div className="add-doctor-column">
                  <div className="add-field">
                    <label>Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={newSurgery.date}
                      min={todayStr}
                      onChange={handleDateChange}
                    />
                    {errors.date && (
                      <p className="error-text">{errors.date}</p>
                    )}
                  </div>

                  <div className="add-field">
                    <label>Time slot *</label>
                    <select
                      name="timeSlot"
                      value={newSurgery.timeSlot}
                      onChange={handleChange}
                    >
                      <option value="">Select time</option>
                      {SURGERY_TIME_SLOTS.map(slot => (
                        <option
                          key={slot}
                          value={slot}
                          disabled={bookedSlots.includes(slot)}
                        >
                          {slot} {bookedSlots.includes(slot) ? "(Booked)" : ""}
                        </option>
                      ))}
                    </select>
                    {errors.timeSlot && (
                      <p className="error-text">{errors.timeSlot}</p>
                    )}
                  </div>

                  <div className="add-field">
                    <label>Operation Theatre *</label>
                    <select
                      name="operationTheatre"
                      value={newSurgery.operationTheatre}
                      onChange={handleChange}
                    >
                      <option value="">Select OT</option>
                      {operationTheatres.map(ot => (
                        <option key={ot} value={ot}>
                          {ot}
                        </option>
                      ))}
                    </select>
                    {errors.operationTheatre && (
                      <p className="error-text">{errors.operationTheatre}</p>
                    )}
                  </div>

                  <div className="add-field">
                    <label>Priority</label>
                    <select
                      name="priority"
                      value={newSurgery.priority}
                      onChange={handleChange}
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="add-field" style={{ marginTop: "0.75rem" }}>
                <label>Notes</label>
                <textarea
                  name="notes"
                  rows="3"
                  value={newSurgery.notes}
                  onChange={handleChange}
                  placeholder="Additional instructions..."
                />
              </div>

              <div className="add-doctor-footer">
                <button
                  type="button"
                  className="add-cancel"
                  onClick={toggleModal}
                >
                  Cancel
                </button>
                <button type="submit" className="add-submit">
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUESTS TAB */}
      {activeTab === "requests" && (
        <div className="doctor-grid">
          {filteredRequests.length > 0 ? (
            filteredRequests.map(r => (
              <div key={r.id} className="doctor-card">
                <div className="doctor-info">
                  <h4>{r.surgeryType || 'Surgery'}</h4>
                  <p className="doctor-dept">
                    Dr: {r.doctorUsername || 'N/A'} • Patient: {r.patientName || 'TBD'}
                  </p>
                  <p className="doctor-place">
                    {r.surgeryDate} {r.surgeryTime} • {r.operationTheatre}
                  </p>
                  <p className="doctor-place">
                    Priority: {r.priority?.toUpperCase() || 'NORMAL'}
                  </p>
                  <div className="doctor-actions">
                    <button
                      type="button"
                      className="doctor-action-btn edit"
                      onClick={() => handleScheduleFromRequest(r)}
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="doctor-card empty-state">
              <h4>No requests found</h4>
              <p>
                {search
                  ? `No matches for "${search}"`
                  : "Surgery requests from doctors will appear here"
                }
              </p>
            </div>
          )}
        </div>
      )}

     {activeTab === "scheduled" && (
  <div className="doctor-grid">
    {filteredScheduled.length > 0 ? (
      filteredScheduled.map(s => (
        <div key={s.id} className="doctor-card">
          <div className="doctor-info">
            <h4>{s.surgeryType}</h4>
            <p className="doctor-dept">
              Patient: {s.patient?.fullname || s.patientName || 'N/A'} • 
              Dr: {s.doctor?.fullname || s.doctorName || 'N/A'}
            </p>
            <p className="doctor-place">
              {s.surgeryDate} {s.surgeryTime} • {s.operationTheatre}
            </p>
            <p className="doctor-place">
              Priority: {s.priority?.toUpperCase()} • Status: {s.status}
            </p>
          </div>
        </div>
      ))
    ) : (
      <div className="doctor-card empty-state">
        <h4>No scheduled surgeries</h4>
        <p>Schedule surgeries from requests tab</p>
      </div>
    )}
  </div>
)}


      {/* COMPLETED TAB */}
      {activeTab === "completed" && (
        <div className="doctor-grid">
          {filteredCompleted.length > 0 ? (
            filteredCompleted.map(s => (
              <div key={s.id} className="doctor-card">
                <div className="doctor-info">
                  <h4>{s.patient?.fullname || 'N/A'}</h4>
                  <p className="doctor-dept">
                    {s.surgeryType} • Dr. {s.doctor?.fullname || 'N/A'}
                  </p>
                  <p className="doctor-place">
                    {s.surgeryDate} • {s.surgeryTime} • {s.operationTheatre}
                  </p>
                  <p className="doctor-place">
                    Priority: {s.priority?.toUpperCase()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="doctor-card empty-state">
              <h4>No completed surgeries</h4>
              <p>Surgeries marked completed will appear here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSurgeries;
