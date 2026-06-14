// src/features/admin/AdminReports.jsx
import React, { useEffect, useMemo, useState } from "react";
import AdminNavbar from "./AdminNavbar";
import "./AdminDoctors.css";

const PAGE_SIZE = 10;

const AdminReports = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    todaysAppointments: 0,
    totalAmbulances: 0,
    totalMedicines: 0,
  });

  const [activity, setActivity] = useState([]);
  const [activityPage, setActivityPage] = useState(0);
  const [activityTotalPages, setActivityTotalPages] = useState(0);

  const [admissionsByDate, setAdmissionsByDate] = useState([]);
  const [appointmentsByDept, setAppointmentsByDept] = useState([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);

  const token = localStorage.getItem("token");

  // load stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(
          "http://localhost:8081/api/admin/reports/summary",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          console.error("Failed to load summary stats", res.status);
          return;
        }
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error("Error loading summary stats", e);
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, [token]);

  // load activity with pagination
  const loadActivity = async (page) => {
    setLoadingActivity(true);
    try {
      const res = await fetch(
        `http://localhost:8081/api/admin/reports/activity?page=${page}&size=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        console.error("Failed to load activity log", res.status);
        return;
      }
      const data = await res.json();
      setActivity(data.content || []);
      setActivityPage(data.page || 0);
      setActivityTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error("Error loading activity log", e);
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    loadActivity(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // load charts data
  useEffect(() => {
    const loadCharts = async () => {
      try {
        const [admRes, deptRes] = await Promise.all([
          fetch(
            "http://localhost:8081/api/admin/reports/admissions-by-date",
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(
            "http://localhost:8081/api/admin/reports/appointments-by-department",
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        if (admRes.ok) {
          setAdmissionsByDate(await admRes.json());
        }
        if (deptRes.ok) {
          setAppointmentsByDept(await deptRes.json());
        }
      } catch (e) {
        console.error("Error loading charts", e);
      } finally {
        setLoadingCharts(false);
      }
    };

    loadCharts();
  }, [token]);

  const canPrev = activityPage > 0;
  const canNext =
    activityTotalPages > 0 && activityPage < activityTotalPages - 1;

  const totalAdmissions = useMemo(
    () => admissionsByDate.reduce((sum, d) => sum + d.count, 0),
    [admissionsByDate]
  );

  return (
    <div className="admin-doctors-page">
      <AdminNavbar />

      {/* KPI cards */}
      <div
        style={{
          padding: "1.5rem 2rem 1rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
        }}
      >
        {loadingStats ? (
          <p>Loading summary...</p>
        ) : (
          <>
            <KpiCard
              title="Doctors"
              value={stats.totalDoctors}
              subtitle="Total active doctors"
            />
            <KpiCard
              title="Patients"
              value={stats.totalPatients}
              subtitle="Registered patients"
            />
            <KpiCard
              title="Appointments (today)"
              value={stats.todaysAppointments}
              subtitle={`Total: ${stats.totalAppointments}`}
            />
            <KpiCard
              title="Ambulances"
              value={stats.totalAmbulances}
              subtitle="Vehicles in system"
            />
            <KpiCard
              title="Medicines"
              value={stats.totalMedicines}
              subtitle="Tracked items"
            />
            <KpiCard
              title="Admissions (7 days)"
              value={totalAdmissions}
              subtitle="Patients admitted"
            />
          </>
        )}
      </div>

      {/* Activity + charts grid */}
      <div
        style={{
          padding: "0 2rem 2rem",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: "1.5rem",
          alignItems: "flex-start",
        }}
      >
        {/* Activity log */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
            padding: "1rem 1.25rem 0.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "1.05rem" }}>
              Recent activity
            </h3>
            <span
              style={{
                fontSize: "0.8rem",
                color: "#6B7280",
              }}
            >
              Page {activityTotalPages === 0 ? 0 : activityPage + 1} of{" "}
              {activityTotalPages}
            </span>
          </div>

          {loadingActivity ? (
            <p>Loading activity...</p>
          ) : activity.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "#6B7280" }}>
              No activity logged yet.
            </p>
          ) : (
            <div style={{ maxHeight: "360px", overflowY: "auto" }}>
              {activity.map((item) => (
  <div key={item.id} className="complaint-item" style={{ marginBottom: "0.4rem" }}>
    <div style={{ fontSize: "0.85rem" }}>
      <span
        style={{
          padding: "0.12rem 0.5rem",
          borderRadius: "999px",
          fontSize: "0.7rem",
          marginRight: "0.4rem",
          backgroundColor:
            item.type === "APPOINTMENT"
              ? "#DBEAFE"
              : item.type === "AMBULANCE"
              ? "#FEF9C3"
              : item.type === "PHARMACY"
              ? "#DCFCE7"
              : "#E5E7EB",
          color:
            item.type === "APPOINTMENT"
              ? "#1D4ED8"
              : item.type === "AMBULANCE"
              ? "#854D0E"
              : item.type === "PHARMACY"
              ? "#166534"
              : "#4B5563",
        }}
      >
        {item.type}
      </span>
      {item.message}
    </div>
    <div
      style={{
        fontSize: "0.75rem",
        color: "#6B7280",
        marginTop: "0.1rem",
      }}
    >
      {/* SAFE DATE HANDLING */}
      {item.createdAt ? 
        item.createdAt.toString().replace("T", " ").slice(0, 16) : 
        "Just now"
      } • {item.actor || "System"}
    </div>
  </div>
))}

            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
              marginTop: "0.75rem",
            }}
          >
            <button
              className="doctor-action-btn"
              disabled={!canPrev}
              onClick={() => canPrev && loadActivity(activityPage - 1)}
              style={{
                opacity: canPrev ? 1 : 0.5,
                cursor: canPrev ? "pointer" : "not-allowed",
              }}
            >
              Prev
            </button>
            <button
              className="doctor-action-btn"
              disabled={!canNext}
              onClick={() => canNext && loadActivity(activityPage + 1)}
              style={{
                opacity: canNext ? 1 : 0.5,
                cursor: canNext ? "pointer" : "not-allowed",
              }}
            >
              Next
            </button>
          </div>
        </div>

        {/* Charts */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* Admissions by date */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
              padding: "1rem 1.25rem 0.75rem",
            }}
          >
            <h3 style={{ margin: 0, marginBottom: "0.6rem", fontSize: "1.05rem" }}>
              Patients admitted (last 7 days)
            </h3>
            {loadingCharts ? (
              <p>Loading chart...</p>
            ) : admissionsByDate.length === 0 ? (
              <p style={{ fontSize: "0.9rem", color: "#6B7280" }}>
                No admissions data.
              </p>
            ) : (
              <SimpleBarChart data={admissionsByDate} />
            )}
          </div>

          {/* Appointments by department */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
              padding: "1rem 1.25rem 0.75rem",
            }}
          >
            <h3 style={{ margin: 0, marginBottom: "0.6rem", fontSize: "1.05rem" }}>
              Appointments by department (today)
            </h3>
            {loadingCharts ? (
              <p>Loading chart...</p>
            ) : appointmentsByDept.length === 0 ? (
              <p style={{ fontSize: "0.9rem", color: "#6B7280" }}>
                No appointments data.
              </p>
            ) : (
              <SimpleBarChartHorizontal data={appointmentsByDept} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Small KPI card component
const KpiCard = ({ title, value, subtitle }) => (
  <div
    style={{
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      padding: "0.85rem 1rem",
      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
      display: "flex",
      flexDirection: "column",
      gap: "0.15rem",
    }}
  >
    <span style={{ fontSize: "0.8rem", color: "#6B7280" }}>{title}</span>
    <span style={{ fontSize: "1.4rem", fontWeight: 600 }}>{value}</span>
    <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{subtitle}</span>
  </div>
);

// Simple vertical bar chart (date on X)
const SimpleBarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.count || 0), 1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "0.4rem",
        height: "160px",
      }}
    >
      {data.map((d) => {
        const h = (d.count / max) * 120;
        return (
          <div
            key={d.date}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontSize: "0.7rem",
            }}
          >
            <div
              style={{
                width: "70%",
                height: `${h}px`,
                borderRadius: "999px 999px 4px 4px",
                background:
                  "linear-gradient(180deg, #FB7185 0%, #F97316 100%)",
              }}
            />
            <span style={{ marginTop: "0.25rem", color: "#6B7280" }}>
              {d.date.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Simple horizontal bar chart (label on Y)
const SimpleBarChartHorizontal = ({ data }) => {
  const max = Math.max(...data.map((d) => d.count || 0), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {data.map((d) => {
        const w = (d.count / max) * 100;
        return (
          <div
            key={d.label}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <span style={{ fontSize: "0.75rem", color: "#6B7280", width: "90px" }}>
              {d.label}
            </span>
            <div
              style={{
                flex: 1,
                height: "6px",
                borderRadius: "999px",
                backgroundColor: "#E5E7EB",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${w}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, #4F46E5 0%, #38BDF8 100%)",
                }}
              />
            </div>
            <span style={{ fontSize: "0.75rem", color: "#4B5563" }}>
              {d.count}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default AdminReports;
