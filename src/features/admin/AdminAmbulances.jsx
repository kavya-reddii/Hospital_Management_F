// src/features/admin/AdminAmbulances.jsx
import React, { useEffect, useMemo, useState } from "react";
import AdminNavbar from "./AdminNavbar";
import "./AdminDoctors.css"; // reuse existing styles
import AmbulanceVehicleForm from "./AmbulanceVehicleForm";
import AmbulanceTripsModal from "./AmbulanceTripsModal";

const AdminAmbulances = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [isTripsOpen, setIsTripsOpen] = useState(false);

  const token = localStorage.getItem("token");

  // load vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const res = await fetch("http://localhost:8081/api/admin/ambulance", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.error("Failed to load ambulances", res.status);
          return;
        }
        const data = await res.json();
        setVehicles(data);
      } catch (e) {
        console.error("Error loading ambulances", e);
      } finally {
        setLoading(false);
      }
    };
    loadVehicles();
  }, [token]);

  const openAddVehicle = () => {
    setEditingVehicle(null);
    setIsVehicleFormOpen(true);
  };

  const openEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setIsVehicleFormOpen(true);
  };

  const handleVehicleSaved = (saved) => {
    setVehicles((prev) => {
      const exists = prev.some((v) => v.id === saved.id);
      if (exists) {
        return prev.map((v) => (v.id === saved.id ? saved : v));
      }
      return [...prev, saved];
    });
    setIsVehicleFormOpen(false);
    setEditingVehicle(null);
  };

  const handleVehicleStatusToggle = async (vehicle) => {
    try {
      const newStatus =
        vehicle.status === "ACTIVE" ? "MAINTENANCE" : "ACTIVE";
      const res = await fetch(
        `http://localhost:8081/api/admin/ambulance/${vehicle.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...vehicle, status: newStatus }),
        }
      );
      if (!res.ok) {
        console.error("Failed to update status");
        return;
      }
      const updated = await res.json();
      setVehicles((prev) =>
        prev.map((v) => (v.id === updated.id ? updated : v))
      );
    } catch (e) {
      console.error("Error toggling status", e);
    }
  };

  const handleDeleteVehicle = async (vehicle) => {
    if (
      !window.confirm(
        "Mark this vehicle as inactive? Trips history will be kept."
      )
    )
      return;
    try {
      const res = await fetch(
        `http://localhost:8081/api/admin/ambulance/${vehicle.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        console.error("Failed to delete vehicle");
        alert("Failed to delete vehicle");
        return;
      }
      setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
    } catch (e) {
      console.error("Error deleting vehicle", e);
    }
  };

  const openTripsModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsTripsOpen(true);
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const text = (
        v.vehicleNo +
        " " +
        v.driverName +
        " " +
        v.place
      ).toLowerCase();
      if (!text.includes(search.toLowerCase())) return false;
      if (statusFilter !== "ALL" && v.status !== statusFilter) return false;
      return true;
    });
  }, [vehicles, search, statusFilter]);

  if (loading) {
    return (
      <div className="admin-doctors-page">
        <AdminNavbar />
        <p style={{ padding: "1.5rem 2rem" }}>Loading ambulances...</p>
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
          placeholder="Search by vehicle, driver or place..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ marginLeft: "0.75rem" }}
        >
          <option value="ALL">All</option>
          <option value="ACTIVE">Active</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <button className="add-doctor-button" onClick={openAddVehicle}>
          Add vehicle
        </button>
      </div>
      

      <h3 style={{ padding: "1rem 2rem 0.25rem" , textAlign:"center"}}>Ambulance vehicles</h3>
      <div className="doctor-grid">
        {filteredVehicles.map((v) => (
          <div key={v.id} className="doctor-card">
            <div className="doctor-info">
              <h4>{v.vehicleNo}</h4>
              <p className="doctor-dept">Driver: {v.driverName}</p>
              <p className="doctor-place">
                {v.place} <br></br> Registered: {v.registeredDate}
              </p>
              <br></br>
              <p className="doctor-place">
                Status:{" "}
                <span
                  style={{
                    padding: "0.15rem 0.5rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    backgroundColor:
                      v.status === "ACTIVE"
                        ? "#DCFCE7"
                        : v.status === "MAINTENANCE"
                        ? "#FEF9C3"
                        : "#E5E7EB",
                    color:
                      v.status === "ACTIVE"
                        ? "#166534"
                        : v.status === "MAINTENANCE"
                        ? "#854D0E"
                        : "#4B5563",
                  }}
                >
                  {v.status}
                </span>
              </p>
               <br></br> <br></br>

              <div className="doctor-actions">
                <button
                  type="button"
                  className="doctor-action-btn"
                  onClick={() => openTripsModal(v)}
                >
                  Trips
                </button>
               
                <button
                  type="button"
                  className="doctor-action-btn edit"
                  onClick={() => openEditVehicle(v)}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="doctor-action-btn"
                  onClick={() => handleVehicleStatusToggle(v)}
                >
                  {v.status === "ACTIVE" ? "Maintenance" : "Activate"}
                </button>
                <button
                  type="button"
                  className="doctor-action-btn delete"
                  onClick={() => handleDeleteVehicle(v)}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isVehicleFormOpen && (
        <AmbulanceVehicleForm
          onClose={() => {
            setIsVehicleFormOpen(false);
            setEditingVehicle(null);
          }}
          onSaved={handleVehicleSaved}
          editingVehicle={editingVehicle}
        />
      )}

      {isTripsOpen && selectedVehicle && (
        <AmbulanceTripsModal
          vehicle={selectedVehicle}
          onClose={() => setIsTripsOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminAmbulances;
