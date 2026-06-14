// src/features/doctor/DoctorPatients.jsx
import React, { useState, useEffect } from "react";
import DoctorNavbar from "./DoctorNavbar";
import { useNavigate } from "react-router-dom";
import { createSearchParams } from "react-router-dom";

import "./DoctorPatients.css";

const DoctorPatients = () => {
    const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");


  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:8081/api/doctor/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Failed to load patients: ${res.status}`);
      }

      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 const handleChatClick = (patientId, patientName) => {
  navigate({
    pathname: "/doctor/inbox",
    search: createSearchParams({
      patientId,
      patientName: encodeURIComponent(patientName),
    }).toString(),
  });
};


  // Filter patients
  const filteredPatients = patients.filter((patient) => {
    const text = (patient.patientName + " " + (patient.phone || "")).toLowerCase();
    if (!text.includes(search.toLowerCase())) return false;
    if (filterDate && patient.lastAppointmentDate?.slice(0, 10) !== filterDate) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="admin-doctors-page">
        <DoctorNavbar />
        <p style={{ padding: "1.5rem 2rem" }}>Loading patients...</p>
      </div>
    );
  }

  return (
    <div className="admin-doctors-page">
      <DoctorNavbar />

      {/* SAME TOOLBAR as DoctorAppointments */}
      <div className="doctor-toolbar">
        <input
          type="text"
          className="doctor-search"
          placeholder="Search patient name or phone..."
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
        <button className="add-doctor-button" onClick={fetchPatients}>
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ padding: "1rem 2rem", color: "#ef4444" }}>
          Error: {error}
          <button className="add-doctor-button" onClick={fetchPatients} style={{ marginLeft: "1rem" }}>
            Retry
          </button>
        </div>
      )}

      {/* SAME GRID as DoctorAppointments */}
      <h3 style={{ padding: "1rem 2rem 0.25rem" }}>
        Patients ({filteredPatients.length})
      </h3>
      <div className="doctor-grid" style={{ gridTemplateColumns: "1fr", gap: "1.5rem", padding: "0 0.5rem 2rem", maxWidth: "1000px", margin: "0 auto" }}>
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <PatientCard
              key={patient.patientId}
              patient={patient}
              onChatClick={handleChatClick}
            />
          ))
        ) : (
          <div className="doctor-card" style={{ gridColumn: "1", textAlign: "center", padding: "3rem 2rem" }}>
            <div className="doctor-info">
              <h4 style={{ color: "#6b7280" }}>No patients found</h4>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PatientCard = ({ patient, onChatClick }) => {
  return (
    <div className="doctor-card">
      <div className="doctor-info">
        {/* Header - SAME as AppointmentCard */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-start", 
          marginBottom: "1.5rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid #e5e7eb"
        }}>
          <div>
            <h4 style={{ margin: 0 }}>{patient.patientName || "Unknown Patient"}</h4>
            <p style={{ margin: "0.25rem 0 0 0", color: "#6b7280" }}>
              Patient ID: #{patient.patientId} • Phone: {patient.phone || "N/A"}
            </p>
          </div>
          <span style={{
            padding: "0.25rem 0.75rem",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 600,
            backgroundColor: patient.hasActiveAppointment ? "#dbeafe" : "#dcfce7",
            color: patient.hasActiveAppointment ? "#1d4ed8" : "#166534",
          }}>
            {patient.hasActiveAppointment ? "Scheduled" : "Past"}
          </span>
        </div>

        {/* Details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
              Last Appointment
            </p>
            <p style={{ margin: 0, fontSize: "1.1rem" }}>
              {patient.lastAppointmentDate ? 
               new Date(patient.lastAppointmentDate).toLocaleDateString('en-IN') : "Never"}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
              Total Visits
            </p>
            <p style={{ margin: 0, fontSize: "1.1rem" }}>{patient.totalAppointments || 0}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
              Concern
            </p>
            <p style={{ margin: 0, fontSize: "1.1rem" }}>{patient.disease || 0}</p>
          </div>
        </div>
 {/* ✅ FIXED CHAT BUTTON */}
        <div style={{ 
          display: "flex", 
          gap: "0.75rem", 
          paddingTop: "1.25rem",
          borderTop: "1px solid #e5e7eb"
        }}>
          <button
            className="chat-btn"
            onClick={() => onChatClick(patient.patientId, patient.patientName)}
          >
            Open Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatients;
