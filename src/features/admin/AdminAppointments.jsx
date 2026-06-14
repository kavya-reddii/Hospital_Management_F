// src/features/admin/AdminAppointments.jsx
import React, { useState, useEffect, useMemo } from "react";
import AdminNavbar from "./AdminNavbar";
import "./AdminDoctors.css";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00",
  "15:00", "15:30", "16:00", "16:30"
];

const AdminAppointments = () => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [bookedSlots, setBookedSlots] = useState([]); // timeSlot strings

  const [newAppointment, setNewAppointment] = useState({
    doctorId: "",
    patientId: "",
    date: "",
    timeSlot: "",
    branch: "",
    city: "",
  });

  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [docRes, patRes, upRes, compRes] = await Promise.all([
          fetch("http://localhost:8081/api/admin/doctor", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8081/api/admin/patient", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8081/api/admin/appointment/upcoming", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8081/api/admin/appointment/completed", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [docData, patData, upData, compData] = await Promise.all([
          docRes.json(),
          patRes.json(),
          upRes.json(),
          compRes.json(),
        ]);

        setDoctors(docData);
        setPatients(patData);
        setUpcoming(upData);
        setCompleted(compData);
      } catch (err) {
        console.error("Error loading appointments", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleAdd = () => {
    setErrors({});
    setServerError("");
    setIsAddOpen((prev) => !prev);
    if (!isAddOpen) {
      setEditingId(null);
      setNewAppointment({
        doctorId: "",
        patientId: "",
        date: "",
        timeSlot: "",
        branch: "",
        city: "",
      });
      setBookedSlots([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "doctorId") {
      const doc = doctors.find((d) => d.id === Number(value));
      if (doc) {
        setNewAppointment((prev) => ({
          ...prev,
          doctorId: value,
          branch: doc.branch,
          city: doc.place, // or doc.city if available
        }));
      } else {
        setNewAppointment((prev) => ({ ...prev, doctorId: value }));
      }
      setBookedSlots([]);
      return;
    }

    setNewAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = async (e) => {
    const value = e.target.value;
    const today = new Date().toISOString().slice(0, 10);
    if (value < today) {
      alert("You cannot book appointments for past dates");
      return;
    }

    setNewAppointment((prev) => ({ ...prev, date: value }));
    setBookedSlots([]);

    if (!newAppointment.doctorId || !value) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8081/api/admin/appointment/doctor/${newAppointment.doctorId}/date/${value}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setBookedSlots(data.map((a) => a.timeSlot));
      }
    } catch (err) {
      console.error("Error loading booked slots", err);
    }
  };

  const validate = () => {
    const errs = {};
    if (!newAppointment.doctorId) errs.doctorId = "Doctor is required";
    if (!newAppointment.patientId) errs.patientId = "Patient is required";
    if (!newAppointment.date) errs.date = "Date is required";
    if (!newAppointment.timeSlot) errs.timeSlot = "Time slot is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setServerError("");
    if (Object.keys(errs).length > 0) return;

    try {
      const token = localStorage.getItem("token");
      const isEdit = editingId !== null;
      const url = isEdit
        ? `http://localhost:8081/api/admin/appointment/${editingId}`
        : "http://localhost:8081/api/admin/appointment";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        doctorId: Number(newAppointment.doctorId),
        patientId: Number(newAppointment.patientId),
        date: newAppointment.date,
        timeSlot: newAppointment.timeSlot,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to save appointment", res.status, text);
        if (text.toLowerCase().includes("slot already booked")) {
          setErrors((prev) => ({
            ...prev,
            timeSlot: "This slot is already booked for the doctor",
          }));
        } else {
          setServerError("Failed to save appointment. Please try again.");
        }
        return;
      }

      const saved = await res.json();

      if (isEdit) {
        setUpcoming((prev) =>
          prev.map((a) => (a.id === saved.id ? saved : a))
        );
        setCompleted((prev) =>
          prev.map((a) => (a.id === saved.id ? saved : a))
        );
      } else {
        const today = new Date().toISOString().slice(0, 10);
        if (saved.date >= today) {
          setUpcoming((prev) => [...prev, saved]);
        } else {
          setCompleted((prev) => [...prev, saved]);
        }
      }

      toggleAdd();
    } catch (err) {
      console.error("Error saving appointment", err);
      setServerError("Something went wrong. Please try again.");
    }
  };

  const handleEdit = (appt) => {
    setEditingId(appt.id);
    setNewAppointment({
      doctorId: String(appt.doctor.id),
      patientId: String(appt.patient.id),
      date: appt.date,
      timeSlot: appt.timeSlot,
      branch: appt.branch,
      city: appt.city,
    });
    setBookedSlots([]);
    setErrors({});
    setServerError("");
    setIsAddOpen(true);
  };

  const handleDelete = async (appt, isUpcoming) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8081/api/admin/appointment/${appt.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to delete appointment", res.status, text);
        alert("Failed to delete appointment");
        return;
      }
      if (isUpcoming) {
        setUpcoming((prev) => prev.filter((a) => a.id !== appt.id));
      } else {
        setCompleted((prev) => prev.filter((a) => a.id !== appt.id));
      }
    } catch (err) {
      console.error("Error deleting appointment", err);
      alert("Something went wrong while deleting");
    }
  };

  const filteredUpcoming = useMemo(
    () =>
      upcoming.filter((a) => {
        const text = (
          a.patient.fullname +
          " " +
          a.doctor.fullname
        ).toLowerCase();
        if (!text.includes(search.toLowerCase())) return false;
        if (filterDate && a.date !== filterDate) return false;
        return true;
      }),
    [upcoming, search, filterDate]
  );

  const filteredCompleted = useMemo(
    () =>
      completed.filter((a) => {
        const text = (
          a.patient.fullname +
          " " +
          a.doctor.fullname
        ).toLowerCase();
        if (!text.includes(search.toLowerCase())) return false;
        if (filterDate && a.date !== filterDate) return false;
        return true;
      }),
    [completed, search, filterDate]
  );

  if (loading) {
    return (
      <div className="admin-doctors-page">
        <AdminNavbar />
        <p style={{ padding: "1.5rem 2rem" }}>Loading appointments...</p>
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
          placeholder="Search by doctor or patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

       <input
  type="date"
  className="doctor-search"
  value={filterDate}
  onChange={(e) => {
    const v = e.target.value;
    setFilterDate(v || "");   // allow empty to mean "no date filter"
  }}
  style={{ maxWidth: "200px" }}
/>


        <button className="add-doctor-button" onClick={toggleAdd}>
          Book appointment
        </button>
      </div>

      {isAddOpen && (
        <div className="add-doctor-overlay">
          <div className="add-doctor-dialog">
            <div className="add-doctor-header">
              <h2>{editingId ? "Edit Appointment" : "Book Appointment"}</h2>
              <button className="add-doctor-close" onClick={toggleAdd}>
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
                {/* LEFT column */}
                <div className="add-doctor-column">
                  <div className="add-field">
                    <label>Doctor *</label>
                    <select
                      name="doctorId"
                      value={newAppointment.doctorId}
                      onChange={handleChange}
                    >
                      <option value="">Select doctor</option>
                      {doctors.map((d) => (
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
                      value={newAppointment.patientId}
                      onChange={handleChange}
                    >
                      <option value="">Select patient</option>
                      {patients.map((p) => (
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
                    <label>Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={newAppointment.date}
                      min={todayStr}
                      onChange={handleDateChange}
                    />
                    {errors.date && (
                      <p className="error-text">{errors.date}</p>
                    )}
                  </div>
                </div>

                {/* RIGHT column */}
                <div className="add-doctor-column">
                  <div className="add-field">
                    <label>Time slot *</label>
                    <select
                      name="timeSlot"
                      value={newAppointment.timeSlot}
                      onChange={handleChange}
                    >
                      <option value="">Select time</option>
                      {TIME_SLOTS.map((slot) => (
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
                    <label>Branch</label>
                    <input
                      type="text"
                      name="branch"
                      value={newAppointment.branch}
                      disabled
                    />
                  </div>

                  <div className="add-field">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={newAppointment.city}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="add-doctor-footer">
                <button
                  type="button"
                  className="add-cancel"
                  onClick={toggleAdd}
                >
                  Cancel
                </button>
                <button type="submit" className="add-submit">
                  {editingId ? "Save changes" : "Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h3 style={{ padding: "1rem 2rem 0.25rem" , textAlign: "center"}}>Upcoming appointments</h3>
      <div className="doctor-grid">
        {filteredUpcoming.map((a) => (
          <div key={a.id} className="doctor-card">
            <div className="doctor-info">
              <h4>{a.patient.fullname}</h4>
              <p className="doctor-dept">Dr. {a.doctor.fullname}</p>
              <p className="doctor-place">
                {a.date} • {a.timeSlot}
              </p>
              <p className="doctor-place">
                {a.branch} • {a.city}
              </p> <br></br><br></br>
              <div className="doctor-actions">
                <button
                  type="button"
                  className="doctor-action-btn edit"
                  onClick={() => handleEdit(a)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="doctor-action-btn delete"
                  onClick={() => handleDelete(a, true)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ padding: "0.5rem 2rem 0.25rem", textAlign:"center" }}>Completed appointments</h3>
      <div className="doctor-grid">
        {filteredCompleted.map((a) => (
          <div key={a.id} className="doctor-card">
            <div className="doctor-info">
              <h4>{a.patient.fullname}</h4>
              <p className="doctor-dept">{a.doctor.fullname}</p>
              <p className="doctor-place">
                {a.date} • {a.timeSlot}
              </p>
              <p className="doctor-place">
                {a.branch} • {a.city}
              </p> <br></br>
              <div className="doctor-actions">
                <button
                  type="button"
                  className="doctor-action-btn edit"
                  onClick={() => handleEdit(a)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="doctor-action-btn delete"
                  onClick={() => handleDelete(a, false)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAppointments;
