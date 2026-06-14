// src/features/patient/PatientAppointments.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PatientNavbar from "./PatientNavbar";
import "../admin/AdminDoctors.css";

const PatientAppointments = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:8081/api/patient/appointment",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        console.error("Error loading appointments", err);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const upcoming = useMemo(
    () => appointments.filter((a) => a.date >= today),
    [appointments]
  );

  const completed = useMemo(
    () => appointments.filter((a) => a.date < today),
    [appointments]
  );

  const filterFn = (list) =>
    list.filter((a) => {
      const text = a.doctor.fullname.toLowerCase();
      if (!text.includes(search.toLowerCase())) return false;
      if (filterDate && a.date !== filterDate) return false;
      return true;
    });

  const filteredUpcoming = useMemo(
    () => filterFn(upcoming),
    [upcoming, search, filterDate]
  );

  const filteredCompleted = useMemo(
    () => filterFn(completed),
    [completed, search, filterDate]
  );

  if (loading) {
    return (
      <div className="admin-doctors-page">
        <PatientNavbar />
        <p style={{ padding: "1.5rem 2rem" }}>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="admin-doctors-page">
      <PatientNavbar />

      {/* Toolbar */}
      <div className="doctor-toolbar">
        <input
          type="text"
          className="doctor-search"
          placeholder="Search by doctor..."
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

        <button
          className="add-doctor-button"
          onClick={() => navigate("/patient/book-appointment")}
        >
          Book Appointment
        </button>
      </div>

      {/* Upcoming */}
      <h3 style={{ padding: "1rem 2rem", textAlign: "center" }}>
        Upcoming Appointments
      </h3>

      <div className="doctor-grid">
        {filteredUpcoming.map((a) => (
          <div key={a.id} className="doctor-card">
            <div className="doctor-info">
              <h4>Dr. {a.doctor.fullname}</h4>
              <p className="doctor-dept">{a.doctor.branch}</p>
              <p className="doctor-place">
                {a.date} • {a.timeSlot}
              </p>
              <p className="doctor-place">
                {a.branch} • {a.city}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Completed */}
      <h3 style={{ padding: "1rem 2rem", textAlign: "center" }}>
        Completed Appointments
      </h3>

      <div className="doctor-grid">
        {filteredCompleted.map((a) => (
          <div key={a.id} className="doctor-card">
            <div className="doctor-info">
              <h4>Dr. {a.doctor.fullname}</h4>
              <p className="doctor-dept">{a.doctor.branch}</p>
              <p className="doctor-place">
                {a.date} • {a.timeSlot}
              </p>
              <p className="doctor-place">
                {a.branch} • {a.city}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientAppointments;