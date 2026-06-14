// src/features/doctor/DoctorAppointments.jsx
import React, { useState, useEffect } from "react";
import DoctorNavbar from "./DoctorNavbar";
import "./DoctorAppointments.css";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);


  // Prescription modal state
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState("");
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState("");
  const [prescriptionSuccess, setPrescriptionSuccess] = useState("");

  // Surgery modal state
  const [showSurgeryModal, setShowSurgeryModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [surgeryData, setSurgeryData] = useState({
    surgeryType: "",
    surgeryDate: "",
    surgeryTime: "",
    operationTheatre: "",
    priority: "normal"
  });
  const [savingSurgery, setSavingSurgery] = useState(false);
  const [surgeryError, setSurgeryError] = useState("");
  const [surgerySuccess, setSurgerySuccess] = useState("");


  // Scans modal state
const [showScansModal, setShowScansModal] = useState(false);
const [selectedScansAppointmentId, setSelectedScansAppointmentId] = useState(null);
const [scansData, setScansData] = useState({
  scanType: "",
  bodyPart: "",
  scanDate: ""
});
const [savingScans, setSavingScans] = useState(false);
const [scansError, setScansError] = useState("");
const [scansSuccess, setScansSuccess] = useState("");


// Medicines modal state
const [showMedicinesModal, setShowMedicinesModal] = useState(false);
const [selectedMedicinesAppointmentId, setSelectedMedicinesAppointmentId] = useState(null);
const [medicines, setMedicines] = useState([]);
const [medicinesSearch, setMedicinesSearch] = useState("");
const [selectedMedicine, setSelectedMedicine] = useState(null);
const [medicineQuantity, setMedicineQuantity] = useState(1);
const [medicinePeriod, setMedicinePeriod] = useState(7); // days
const [medicineInterval, setMedicineInterval] = useState("twice");
const [savingMedicines, setSavingMedicines] = useState(false);
const [medicinesError, setMedicinesError] = useState("");
const [medicinesSuccess, setMedicinesSuccess] = useState("");



// Next appointment states
const [showNextAppointmentModal, setShowNextAppointmentModal] = useState(false);
const [selectedNextAppointmentId, setSelectedNextAppointmentId] = useState(null);
const [nextAppointmentDate, setNextAppointmentDate] = useState("");
const [savingNextAppointment, setSavingNextAppointment] = useState(false);
const [nextAppointmentError, setNextAppointmentError] = useState("");
const [nextAppointmentSuccess, setNextAppointmentSuccess] = useState("");




  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:8081/api/doctor/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Failed to load appointments: ${res.status}`);
      }

      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Prescription handlers
  const handlePrescriptionClick = (appointment) => {
    setSelectedAppointment(appointment);
    setPrescriptionText(appointment.prescriptionText || "");
    setPrescriptionError("");
    setPrescriptionSuccess("");
    setShowPrescriptionModal(true);
  };

  const handleSavePrescription = async () => {
    if (!selectedAppointment) return;

    try {
      setSavingPrescription(true);
      setPrescriptionError("");
      setPrescriptionSuccess("");

      const res = await fetch(
        `http://localhost:8081/api/doctor/appointments/${selectedAppointment.id}/prescription`,
        {
          method: "PUT",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ prescriptionText }),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to save: ${res.status}`);
      }

      // Update appointment in state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === selectedAppointment.id
            ? { ...apt, prescriptionText }
            : apt
        )
      );

      setPrescriptionSuccess("Prescription saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      setPrescriptionError(err.message);
    } finally {
      setSavingPrescription(false);
    }
  };

  // 🔧 SURGERY HANDLERS (MISSING IN YOUR CODE)
  const handleSurgeryClick = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setSurgeryData({ surgeryType: "", surgeryDate: "", surgeryTime: "", operationTheatre: "", priority: "normal" });
    setSurgeryError("");
    setSurgerySuccess("");
    setShowSurgeryModal(true);
  };

  const handleSaveSurgery = async () => {
    if (!selectedAppointmentId) return;

    try {
      setSavingSurgery(true);
      setSurgeryError("");
      setSurgerySuccess("");

      const res = await fetch(
        `http://localhost:8081/api/doctor/appointments/${selectedAppointmentId}/surgery`,
        {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(surgeryData),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to save: ${res.status}`);
      }

      const result = await res.json();
      setSurgerySuccess("Surgery request sent to admin successfully!");
    } catch (err) {
      console.error("Surgery save error:", err);
      setSurgeryError(err.message);
    } finally {
      setSavingSurgery(false);
    }
  };

  // Scans handlers
  const handleScansClick = (appointmentId) => {
  setSelectedScansAppointmentId(appointmentId);
  setScansData({ scanType: "", bodyPart: "", scanDate: "" });
  setScansError("");
  setScansSuccess("");
  setShowScansModal(true);
};

const handleSaveScans = async () => {
  if (!selectedScansAppointmentId) return;

  try {
    setSavingScans(true);
    setScansError("");
    setScansSuccess("");

    const res = await fetch(
      `http://localhost:8081/api/doctor/appointments/${selectedScansAppointmentId}/scans`,
      {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(scansData),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to save: ${res.status}`);
    }

    const result = await res.json();
    setScansSuccess("Scan details saved successfully!");
  } catch (err) {
    console.error("Scans save error:", err);
    setScansError(err.message);
  } finally {
    setSavingScans(false);
  }
};


// Load medicines on component mount
useEffect(() => {
  fetchMedicines();
}, []);

// Medicines handlers
const fetchMedicines = async () => {
  try {
    const res = await fetch("http://localhost:8081/api/admin/pharmacy/medicines", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setMedicines(data);
    }
  } catch (err) {
    console.error("Failed to load medicines:", err);
  }
};

const handleMedicinesClick = (appointmentId) => {
  setSelectedMedicinesAppointmentId(appointmentId);
  setSelectedMedicine(null);
  setMedicineQuantity(1);
  setMedicinePeriod(7);
  setMedicineInterval("twice");
  setMedicinesError("");
  setMedicinesSuccess("");
  setShowMedicinesModal(true);
  fetchMedicines(); // Refresh list
};

const handleSaveMedicines = async () => {
  if (!selectedMedicine || medicineQuantity < 1) return;

  try {
    setSavingMedicines(true);
    setMedicinesError("");
    setMedicinesSuccess("");

    const res = await fetch(
      `http://localhost:8081/api/doctor/appointments/${selectedMedicinesAppointmentId}/medicines`,
      {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          medicineId: selectedMedicine.id,
          medicineName: selectedMedicine.name,
          quantity: medicineQuantity,
          periodDays: medicinePeriod,
          interval: medicineInterval
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to save: ${res.status}`);
    }

    setMedicinesSuccess(`Prescribed ${medicineQuantity}x ${selectedMedicine.name} for ${medicinePeriod} days!`);
  } catch (err) {
    setMedicinesError(err.message);
  } finally {
    setSavingMedicines(false);
  }
};


const handleNextAppointmentClick = (appointmentId) => {
  setSelectedNextAppointmentId(appointmentId);
  setNextAppointmentDate("");
  setNextAppointmentError("");
  setNextAppointmentSuccess("");
  setShowNextAppointmentModal(true);
};

const handleSaveNextAppointment = async () => {
  if (!selectedNextAppointmentId || !nextAppointmentDate) {
    setNextAppointmentError("Please select date");
    return;
  }

  try {
    setSavingNextAppointment(true);
    setNextAppointmentError("");
    setNextAppointmentSuccess("");
     const appointment = appointments.find(a => a.id === selectedNextAppointmentId);

    const res = await fetch(
      `http://localhost:8081/api/doctor/appointments/${selectedNextAppointmentId}/next-appointment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          nextAppointmentDate: nextAppointmentDate,
          currentAppointmentId: selectedNextAppointmentId,
          patientId: appointment?.patientId || appointment?.id,  // ✅ NEW
          patientName: appointment?.patientName || "Unknown", 
        }),
      }
    );

    const result = await res.json();
    if (res.ok) {
      setNextAppointmentSuccess("Next appointment request sent to admin!");
      setShowNextAppointmentModal(false);
    } else {
      setNextAppointmentError(result.error || "Failed to send request");
    }
  } catch (err) {
    setNextAppointmentError(err.message);
  } finally {
    setSavingNextAppointment(false);
  }
};



  // Auto-status logic
  const now = new Date();
  const getStatus = (appointment) => {
    if (!appointment.date || !appointment.timeSlot) return appointment.status || "Scheduled";
    
    const apptDateTime = new Date(appointment.date + 'T' + appointment.timeSlot);
    return apptDateTime <= now ? "Completed" : (appointment.status || "Scheduled");
  };

  // Split appointments
  const upcomingAppointments = appointments.filter(a => getStatus(a) === "Scheduled");
  const completedAppointments = appointments.filter(a => getStatus(a) === "Completed");

  // Filter upcoming
  const filteredUpcoming = upcomingAppointments.filter((a) => {
    const text = (a.patientName + " " + (a.phone || "")).toLowerCase();
    if (!text.includes(search.toLowerCase())) return false;
    if (filterDate && a.date?.slice(0, 10) !== filterDate) return false;
    return true;
  });

  // Filter completed
  const filteredCompleted = completedAppointments.filter((a) => {
    const text = (a.patientName + " " + (a.phone || "")).toLowerCase();
    if (!text.includes(search.toLowerCase())) return false;
    if (filterDate && a.date?.slice(0, 10) !== filterDate) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="admin-doctors-page">
        <DoctorNavbar />
        <p style={{ padding: "1.5rem 2rem" }}>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="admin-doctors-page">
      <DoctorNavbar />

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
        <button className="add-doctor-button" onClick={fetchAppointments}>
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ padding: "1rem 2rem", color: "#ef4444" }}>
          Error: {error}
          <button 
            className="add-doctor-button" 
            onClick={fetchAppointments} 
            style={{ marginLeft: "1rem" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Upcoming Appointments */}
      <h3 style={{ padding: "1rem 2rem 0.25rem" }}>
        Upcoming ({filteredUpcoming.length})
      </h3>
      <div className="doctor-grid" style={{ gridTemplateColumns: "1fr", gap: "1.5rem", padding: "0 1rem 1rem", maxWidth: "1500px", margin: "0 auto" }}>
        {filteredUpcoming.length > 0 ? (
          filteredUpcoming.map((a) => (
            <AppointmentCard 
              key={a.id} 
              appointment={a} 
              getStatus={getStatus}
              onPrescriptionClick={handlePrescriptionClick}
              onSurgeryClick={handleSurgeryClick}  // 🔧 ADDED
               onScansClick={handleScansClick} 
               onMedicinesClick={handleMedicinesClick}
               onNextAppointmentClick={handleNextAppointmentClick}
            />
          ))
        ) : (
          <div className="doctor-card" style={{ gridColumn: "1", textAlign: "center", padding: "3rem 2rem" }}>
            <div className="doctor-info">
              <h4 style={{ color: "#6b7280" }}>No upcoming appointments</h4>
            </div>
          </div>
        )}
      </div>

      {/* Completed Appointments */}
      <h3 style={{ padding: "0.5rem 2rem 0.25rem" }}>
        Completed ({filteredCompleted.length})
      </h3>
      <div className="doctor-grid" style={{ gridTemplateColumns: "1fr", gap: "1.5rem", padding: "0 1rem 2rem", maxWidth: "1500px", margin: "0 auto" }}>
        {filteredCompleted.length > 0 ? (
          filteredCompleted.map((a) => (
            <AppointmentCard 
              key={a.id} 
              appointment={a} 
              getStatus={getStatus}
              onPrescriptionClick={handlePrescriptionClick}
              onSurgeryClick={handleSurgeryClick}  // 🔧 ADDED
              onScansClick={handleScansClick}
              onMedicinesClick={handleMedicinesClick}
              onNextAppointmentClick={handleNextAppointmentClick}
            />
          ))
        ) : (
          <div className="doctor-card" style={{ gridColumn: "1", textAlign: "center", padding: "3rem 2rem" }}>
            <div className="doctor-info">
              <h4 style={{ color: "#9ca3af" }}>No completed appointments</h4>
            </div>
          </div>
        )}
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="add-doctor-overlay" onClick={() => setShowPrescriptionModal(false)}>
          <div 
            className="add-doctor-dialog" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "700px", width: "90%" }}
          >
            <div className="add-doctor-header">
              <h3>Prescription for {selectedAppointment?.patientName}</h3>
              <button 
                className="close-button" 
                onClick={() => setShowPrescriptionModal(false)}
              >
                ×
              </button>
            </div>

            <div className="add-doctor-form">
              <div className="form-group">
                <label>Give Prescription</label>
                <textarea
                  value={prescriptionText}
                  onChange={(e) => setPrescriptionText(e.target.value)}
                  placeholder="Enter prescription details..."
                  rows={12}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontFamily: "monospace",
                    resize: "vertical",
                    minHeight: "200px"
                  }}
                />
              </div>

              {prescriptionError && (
                <div style={{ color: "#ef4444", margin: "0.5rem 0", padding: "0.75rem", background: "#fef2f2", borderRadius: "6px" }}>
                  {prescriptionError}
                </div>
              )}

              {prescriptionSuccess && (
                <div style={{ color: "#059669", margin: "0.5rem 0", padding: "0.75rem", background: "#f0fdf4", borderRadius: "6px" }}>
                  {prescriptionSuccess}
                </div>
              )}
            </div>

            <div className="add-doctor-actions">
              <button 
                type="button" 
                className="add-doctor-button" 
                onClick={handleSavePrescription}
                disabled={savingPrescription}
                style={{ flex: 1 }}
              >
                {savingPrescription ? "Saving..." : "Save Prescription"}
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setShowPrescriptionModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔧 SURGERY MODAL (MISSING IN YOUR CODE) */}
      {showSurgeryModal && (
        <div className="add-doctor-overlay" onClick={() => setShowSurgeryModal(false)}>
          <div 
            className="add-doctor-dialog" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "600px", width: "90%" }}
          >
            <div className="add-doctor-header">
              <h3>Surgery Request</h3>
              <button className="close-button" onClick={() => setShowSurgeryModal(false)}>×</button>
            </div>

            <div className="add-doctor-form">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label>Surgery Type *</label>
                  <input
                    type="text"
                    value={surgeryData.surgeryType}
                    onChange={(e) => setSurgeryData({...surgeryData, surgeryType: e.target.value})}
                    placeholder="Appendectomy, Cardiac Bypass..."
                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Surgery Date *</label>
                  <input
                    type="date"
                    value={surgeryData.surgeryDate}
                    onChange={(e) => setSurgeryData({...surgeryData, surgeryDate: e.target.value})}
                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label>Surgery Time *</label>
                  <input
                    type="time"
                    value={surgeryData.surgeryTime}
                    onChange={(e) => setSurgeryData({...surgeryData, surgeryTime: e.target.value})}
                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Operation Theatre</label>
                  <select
                    value={surgeryData.operationTheatre}
                    onChange={(e) => setSurgeryData({...surgeryData, operationTheatre: e.target.value})}
                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                  >
                    <option value="">Select OT</option>
                    <option value="OT-1">OT-1 (General)</option>
                    <option value="OT-2">OT-2 (Cardiac)</option>
                    <option value="ICU-1">ICU-1</option>
                    <option value="ICU-2">ICU-2</option>
                    <option value="Emergency OT">Emergency OT</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Priority *</label>
                <select
                  value={surgeryData.priority}
                  onChange={(e) => setSurgeryData({...surgeryData, priority: e.target.value})}
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent ⚡</option>
                  <option value="critical">Critical 🚨</option>
                </select>
              </div>

              {surgeryError && (
                <div style={{ color: "#ef4444", margin: "0.5rem 0", padding: "0.75rem", background: "#fef2f2", borderRadius: "6px" }}>
                  {surgeryError}
                </div>
              )}
              {surgerySuccess && (
                <div style={{ color: "#059669", margin: "0.5rem 0", padding: "0.75rem", background: "#f0fdf4", borderRadius: "6px" }}>
                  {surgerySuccess}
                </div>
              )}
            </div>

            <div className="add-doctor-actions">
              <button 
                type="button" 
                className="add-doctor-button" 
                onClick={handleSaveSurgery}
                disabled={savingSurgery}
                style={{ flex: 1, background: "#10B981" }}
              >
                {savingSurgery ? "Sending..." : "Send to Admin"}
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setShowSurgeryModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {showScansModal && (
  <div className="add-doctor-overlay" onClick={() => setShowScansModal(false)}>
    <div className="add-doctor-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px", width: "90%" }}>
      <div className="add-doctor-header">
        <h3>Scan Details</h3>
        <button className="close-button" onClick={() => setShowScansModal(false)}>×</button>
      </div>

      <div className="add-doctor-form">
        <div className="form-group">
          <label>Scan Type *</label>
          <select
            value={scansData.scanType}
            onChange={(e) => setScansData({...scansData, scanType: e.target.value})}
            style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", color: "#374151" }}
            required
          >
            <option value="">Select Scan Type</option>
            <option value="X-Ray">X-Ray</option>
            <option value="MRI">MRI</option>
            <option value="CT Scan">CT Scan</option>
            <option value="Ultrasound">Ultrasound</option>
            <option value="ECG">ECG</option>
            <option value="Blood Test">Blood Test</option>
          </select>
        </div>

        <div className="form-group">
          <label>Body Part *</label>
          <select
            value={scansData.bodyPart}
            onChange={(e) => setScansData({...scansData, bodyPart: e.target.value})}
            style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", color: "#374151" }}
            required
          >
            <option value="">Select Body Part</option>
            <option value="Chest">Chest</option>
            <option value="Abdomen">Abdomen</option>
            <option value="Head">Head</option>
            <option value="Spine">Spine</option>
            <option value="Legs">Legs</option>
            <option value="Arms">Arms</option>
            <option value="Heart">Heart</option>
          </select>
        </div>

        <div className="form-group">
          <label>Scan Date *</label>
          <input
            type="date"
            value={scansData.scanDate}
            onChange={(e) => setScansData({...scansData, scanDate: e.target.value})}
            style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", color: "#374151" }}
            required
          />
        </div>

        {scansError && (
          <div style={{ color: "#FF385C", margin: "0.5rem 0", padding: "0.75rem", background: "#fef2f2", borderRadius: "6px", borderLeft: "4px solid #FF385C" }}>
            {scansError}
          </div>
        )}
        {scansSuccess && (
          <div style={{ color: "#FF385C", margin: "0.5rem 0", padding: "0.75rem", background: "#fff7ed", borderRadius: "6px", borderLeft: "4px solid #FF385C" }}>
            {scansSuccess}
          </div>
        )}
      </div>

      <div className="add-doctor-actions">
        <button 
          type="button" 
          className="add-doctor-button" 
          onClick={handleSaveScans}
          disabled={savingScans}
          style={{ flex: 1, background: "#FF385C" }}
        >
          {savingScans ? "Saving..." : "Save Scans"}
        </button>
        <button 
          type="button" 
          className="cancel-button"
          onClick={() => setShowScansModal(false)}
          style={{ flex: 1 }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


{/* NEXT APPOINTMENT MODAL - ADD THIS */}
{showNextAppointmentModal && (
  <div className="add-doctor-overlay" onClick={() => setShowNextAppointmentModal(false)}>
    <div className="add-doctor-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px", width: "90%" }}>
      <div className="add-doctor-header">
        <h3>Next Appointment</h3>
        <button className="close-button" onClick={() => setShowNextAppointmentModal(false)}>×</button>
      </div>
      
      <div className="add-doctor-form">
        <div className="form-group">
          <label>Requested Date *</label>
          <input
            type="date"
            value={nextAppointmentDate}
            onChange={(e) => setNextAppointmentDate(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        
        {nextAppointmentError && (
          <div style={{ color: "#FF385C", padding: "0.75rem", background: "#fef2f2", borderRadius: "6px" }}>
            {nextAppointmentError}
          </div>
        )}
        {nextAppointmentSuccess && (
          <div style={{ color: "#059669", padding: "0.75rem", background: "#f0fdf4", borderRadius: "6px" }}>
            {nextAppointmentSuccess}
          </div>
        )}
      </div>
      
      <div className="add-doctor-actions">
        <button 
          className="add-doctor-button" 
          onClick={handleSaveNextAppointment}
          disabled={savingNextAppointment || !nextAppointmentDate}
          style={{ flex: 1, background: "#FF385C" }}
        >
          {savingNextAppointment ? "Sending..." : "Send to Admin"}
        </button>
        <button className="cancel-button" onClick={() => setShowNextAppointmentModal(false)} style={{ flex: 1 }}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


{showMedicinesModal && (
  <div className="add-doctor-overlay" onClick={() => setShowMedicinesModal(false)}>
    <div className="add-doctor-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", width: "90%" }}>
      <div className="add-doctor-header">
        <h3>Prescribe Medicines</h3>
        <button className="close-button" onClick={() => setShowMedicinesModal(false)}>×</button>
      </div>

      <div className="add-doctor-form">
        {/* Simplified Medicine Search */}
       <div className="form-group">
  <label>Medicine *</label>
  <div style={{ position: "relative" }}>
    <input
      type="text"
      placeholder={selectedMedicine ? selectedMedicine.name : "Click to select medicine..."}
      value={medicinesSearch}
      onChange={(e) => setMedicinesSearch(e.target.value)}
      onFocus={() => setShowMedicineDropdown(true)}  // ✅ SHOW ON CLICK
      onBlur={() => setTimeout(() => setShowMedicineDropdown(false), 200)}  // ✅ HIDE ON BLUR
      style={{ 
        width: "100%", 
        padding: "0.75rem", 
        border: "1px solid #d1d5db", 
        borderRadius: "6px",
        cursor: "pointer"
      }}
      readOnly
    />
    
    {/* Dropdown - SHOW ONLY ON FOCUS */}
   {showMedicineDropdown && (
  <div style={{
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    maxHeight: "200px",
    overflowY: "auto",
    background: "white",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    zIndex: 1000,
    marginTop: "2px"
  }}>
    {medicines
      .filter(m =>
        m.name.toLowerCase().includes(medicinesSearch.toLowerCase())
      )
      .slice(0, 8)
      .map((medicine) => (
        <div
          key={medicine.id}
          style={{
            padding: "1rem",
            cursor: "pointer",
            borderBottom: "1px solid #f3f4f6"
          }}
          onMouseDown={() => {   // ✅ IMPORTANT (prevents blur issue)
            setSelectedMedicine(medicine);
            setMedicinesSearch(medicine.name);
            setShowMedicineDropdown(false);
          }}
        >
          {medicine.name}
        </div>
      ))}
  

      </div>
    )}
  </div>
</div>



        {/* Clean 2-column inputs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={medicineQuantity}
              onChange={(e) => setMedicineQuantity(parseInt(e.target.value) || 1)}
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
            />
          </div>
          <div className="form-group">
            <label>Period (days)</label>
            <input
              type="number"
              min="1"
              value={medicinePeriod}
              onChange={(e) => setMedicinePeriod(parseInt(e.target.value) || 7)}
              style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Interval</label>
          <select
            value={medicineInterval}
            onChange={(e) => setMedicineInterval(e.target.value)}
            style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
          >
            <option value="once">Once daily</option>
            <option value="twice">Twice daily</option>
            <option value="thrice">Thrice daily</option>
            <option value="four">Four times daily</option>
          </select>
        </div>

        {medicinesError && (
          <div style={{ 
            color: "#FF385C", 
            margin: "1rem 0", 
            padding: "0.75rem", 
            background: "#fef2f2", 
            borderRadius: "6px",
            borderLeft: "4px solid #FF385C"
          }}>
            {medicinesError}
          </div>
        )}
        {medicinesSuccess && (
          <div style={{ 
            color: "#059669", 
            margin: "1rem 0", 
            padding: "0.75rem", 
            background: "#f0fdf4", 
            borderRadius: "6px",
            borderLeft: "4px solid #10B981"
          }}>
            {medicinesSuccess}
          </div>
        )}
      </div>

      <div className="add-doctor-actions">
        <button 
          className="add-doctor-button" 
          onClick={handleSaveMedicines}
          disabled={!selectedMedicine || savingMedicines}
          style={{ flex: 1, background: "#FF385C" }}
        >
          {savingMedicines ? "Saving..." : "Prescribe Medicine"}
        </button>
        <button className="cancel-button" onClick={() => setShowMedicinesModal(false)} style={{ flex: 1 }}>
          Cancel
        </button>
      </div>
    </div>
  </div>

  

)}

 </div>
  );
};




// Updated AppointmentCard with Surgery
const AppointmentCard = ({ appointment, getStatus, onPrescriptionClick, onSurgeryClick , onScansClick, onMedicinesClick, onNextAppointmentClick}) => {
  const status = getStatus ? getStatus(appointment) : appointment.status || "Scheduled";

  return (
    <div className="doctor-card">
      <div className="doctor-info">
        {/* Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-start", 
          marginBottom: "1.5rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid #e5e7eb"
        }}>
          <div>
            <h4 style={{ margin: 0 }}>{appointment.patientName || "Unknown Patient"}</h4>
            <p style={{ margin: "0.25rem 0 0 0", color: "#6b7280" }}>
              #{appointment.id} • Age: {appointment.age || "N/A"} • {appointment.phone || "N/A"}
            </p>
          </div>
          <span style={{
            padding: "0.25rem 0.75rem",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: 600,
            backgroundColor: status === "Completed" ? "#dcfce7" : "#dbeafe",
            color: status === "Completed" ? "#166534" : "#1d4ed8",
          }}>
            {status}
          </span>
        </div>

        {/* 2-Column Details - Clean Admin Style */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Date & Time</p>
            <p style={{ margin: 0, fontSize: "1.1rem" }}>{appointment.date?.slice(0, 10) || "N/A"}</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.1rem" }}>{appointment.timeSlot || "N/A"}</p>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Location</p>
            <p style={{ margin: 0, fontSize: "1.1rem" }}>{appointment.branch || "N/A"}</p>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.1rem" }}>{appointment.city || "N/A"}</p>
          </div>
        </div>

        {/* Full Width Action Buttons */}
        <div style={{ 
          display: "flex", 
          gap: "0.75rem", 
          paddingTop: "1.25rem",
          borderTop: "1px solid #e5e7eb",
          flexWrap: "wrap"
        }}>
          <button 
            className="add-doctor-button" 
            style={{ flex: 1, minWidth: "140px", background: "#FF385C", border: "none", height: "48px" }}
            onClick={() => onPrescriptionClick(appointment)}
          >
            Prescription
          </button>
          <button 
            className="add-doctor-button" 
            style={{ flex: 1, minWidth: "140px", background: "#FF385C", border: "none", height: "48px" }} 
            onClick={() => onSurgeryClick(appointment.id)}
          >
            Surgery
          </button>
          <button className="add-doctor-button" onClick={() => onScansClick(appointment.id)} style={{ flex: 1, minWidth: "140px", background: "#FF385C", border: "none", height: "48px" }}>
            Scans
          </button>
          <button className="add-doctor-button" onClick={() => onMedicinesClick(appointment.id)} style={{ flex: 1, minWidth: "140px", background: "#FF385C", border: "none", height: "48px" }}>
            Medicines
          </button>
          <button className="add-doctor-button" onClick={() => onNextAppointmentClick(appointment.id)} style={{ flex: 1, minWidth: "140px", background: "#FF385C", border: "none", height: "48px" }}>
            Next Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;
