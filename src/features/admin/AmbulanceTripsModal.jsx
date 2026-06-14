// src/features/admin/AmbulanceTripsModal.jsx
import React, { useEffect, useState } from "react";
import "./AdminDoctors.css";

const AmbulanceTripsModal = ({ vehicle, onClose }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const [editingTrip, setEditingTrip] = useState(null);
  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    tripDateTime: "",
    pickupLocation: "",
    dropLocation: "",
    notes: "",
    status: "SCHEDULED",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const token = localStorage.getItem("token");

  const loadTrips = async () => {
    try {
      const res = await fetch(
        `http://localhost:8081/api/admin/ambulance/${vehicle.id}/trips`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        console.error("Failed to load trips");
        return;
      }
      const data = await res.json();
      setTrips(data);
    } catch (e) {
      console.error("Error loading trips", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle.id]);

  const resetForm = () => {
    setEditingTrip(null);
    setForm({
      patientId: "",
      patientName: "",
      tripDateTime: "",
      pickupLocation: "",
      dropLocation: "",
      notes: "",
      status: "SCHEDULED",
    });
    setErrors({});
    setServerError("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.patientName.trim()) errs.patientName = "Patient name is required";
    if (!form.tripDateTime) errs.tripDateTime = "Trip date & time is required";
    if (!form.pickupLocation.trim())
      errs.pickupLocation = "Pickup location is required";
    if (!form.dropLocation.trim())
      errs.dropLocation = "Drop location is required";

    if (form.tripDateTime) {
      const nowIso = new Date().toISOString();
      if (form.tripDateTime < nowIso) {
        errs.tripDateTime = "Trip time cannot be in the past";
      }
    }
    return errs;
  };

  const hasTimeConflict = (tripDateTime, ignoreId) => {
    const target = new Date(tripDateTime);
    const start = new Date(target.getTime() - 30 * 60 * 1000);
    const end = new Date(target.getTime() + 30 * 60 * 1000);

    return trips.some((t) => {
      if (ignoreId && t.id === ignoreId) return false;
      const tTime = new Date(t.tripDateTime);
      return (
        t.status !== "CANCELLED" &&
        tTime >= start &&
        tTime <= end
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (vehicle.status === "MAINTENANCE" || vehicle.status === "INACTIVE") {
      setServerError("Cannot assign trips to a non-active vehicle");
      return;
    }

    if (hasTimeConflict(form.tripDateTime, editingTrip?.id)) {
      setErrors((prev) => ({
        ...prev,
        tripDateTime: "Vehicle already has a trip in this time window",
      }));
      return;
    }

    try {
      const isEdit = !!editingTrip;
      const url = isEdit
        ? `http://localhost:8081/api/admin/ambulance/trips/${editingTrip.id}`
        : `http://localhost:8081/api/admin/ambulance/${vehicle.id}/trips`;
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        patientId: form.patientId ? Number(form.patientId) : null,
        patientName: form.patientName.trim(),
        tripDateTime: form.tripDateTime,
        pickupLocation: form.pickupLocation.trim(),
        dropLocation: form.dropLocation.trim(),
        notes: form.notes.trim(),
        status: form.status,
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
        console.error("Failed to save trip", res.status, text);
        setServerError("Failed to save trip. Please try again.");
        return;
      }

      await loadTrips();
      resetForm();
    } catch (e) {
      console.error("Error saving trip", e);
      setServerError("Something went wrong. Please try again.");
    }
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setForm({
      patientId: trip.patientId || "",
      patientName: trip.patientName || "",
      tripDateTime: trip.tripDateTime?.slice(0, 16) || "",
      pickupLocation: trip.pickupLocation || "",
      dropLocation: trip.dropLocation || "",
      notes: trip.notes || "",
      status: trip.status || "SCHEDULED",
    });
    setErrors({});
    setServerError("");
  };

  const handleCancelTrip = async (trip) => {
    if (!window.confirm("Cancel this trip?")) return;
    try {
      const res = await fetch(
        `http://localhost:8081/api/admin/ambulance/trips/${trip.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        console.error("Failed to cancel trip");
        alert("Failed to cancel trip");
        return;
      }
      await loadTrips();
    } catch (e) {
      console.error("Error canceling trip", e);
    }
  };

  const handleQuickComplete = async (trip) => {
    try {
      const res = await fetch(
        `http://localhost:8081/api/admin/ambulance/trips/${trip.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...trip, status: "COMPLETED" }),
        }
      );
      if (!res.ok) {
        console.error("Failed to update trip status");
        return;
      }
      await loadTrips();
    } catch (e) {
      console.error("Error completing trip", e);
    }
  };

  const filteredTrips = trips.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (dateFilter && t.tripDateTime?.slice(0, 10) !== dateFilter) return false;
    return true;
  });

  const nowIso = new Date().toISOString();

  return (
    <div className="add-doctor-overlay">
      <div className="add-doctor-dialog" style={{ maxWidth: "900px" }}>
        <div className="add-doctor-header">
          <h2>Trips for {vehicle.vehicleNo}</h2>
          <button className="add-doctor-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="add-doctor-body" style={{ gap: "1.5rem" }}>
          <div className="add-doctor-column" style={{ flex: 1.3 }}>
            <div
              className="doctor-toolbar"
              style={{
                padding: "0.5rem 0 0.75rem",
                boxShadow: "none",
                background: "transparent",
              }}
            >
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <input
                type="date"
                className="doctor-search"
                style={{ maxWidth: "180px", marginLeft: "0.5rem" }}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value || "")}
              />
            </div>

            {loading ? (
              <p>Loading trips...</p>
            ) : filteredTrips.length === 0 ? (
              <p style={{ fontSize: "0.9rem", color: "#6B7280" }}>
                No trips found for this vehicle.
              </p>
            ) : (
              <div
                style={{
                  maxHeight: "320px",
                  overflowY: "auto",
                  paddingRight: "0.25rem",
                }}
              >
                {filteredTrips.map((t) => {
                  const canQuickComplete =
                    t.status === "SCHEDULED" && t.tripDateTime < nowIso;
                  return (
                    <div
                      key={t.id}
                      className="complaint-item"
                      style={{ marginBottom: "0.5rem" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {t.patientName}{" "}
                            {t.patientId && (
                              <span style={{ color: "#6B7280", fontSize: "0.8rem" }}>
                                (ID: {t.patientId})
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                            {t.tripDateTime?.replace("T", " ").slice(0, 16)} •{" "}
                            <span
                              style={{
                                padding: "0.1rem 0.45rem",
                                borderRadius: "999px",
                                backgroundColor:
                                  t.status === "SCHEDULED"
                                    ? "#DBEAFE"
                                    : t.status === "COMPLETED"
                                    ? "#DCFCE7"
                                    : "#FEE2E2",
                                color:
                                  t.status === "SCHEDULED"
                                    ? "#1D4ED8"
                                    : t.status === "COMPLETED"
                                    ? "#166534"
                                    : "#B91C1C",
                              }}
                            >
                              {t.status}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.8rem", marginTop: "0.2rem" }}>
                            {t.pickupLocation} → {t.dropLocation}
                          </div>
                          {t.notes && (
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "#6B7280",
                                marginTop: "0.2rem",
                              }}
                            >
                              Notes: {t.notes}
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.25rem",
                            marginLeft: "0.75rem",
                            alignItems: "flex-end",
                          }}
                        >
                          <button
                            type="button"
                            className="doctor-action-btn edit"
                            onClick={() => handleEditTrip(t)}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="doctor-action-btn delete"
                            onClick={() => handleCancelTrip(t)}
                          >
                            🗑️
                          </button>
                          {canQuickComplete && (
                            <button
                              type="button"
                              className="doctor-action-btn"
                              onClick={() => handleQuickComplete(t)}
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="add-doctor-column" style={{ flex: 1 }}>
            <h4 style={{ marginBottom: "0.5rem" }}>
              {editingTrip ? "Edit trip" : "Add trip"}
            </h4>

            {serverError && (
              <p className="error-text" style={{ marginBottom: "0.5rem" }}>
                {serverError}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="add-field">
                <label>Patient ID (optional)</label>
                <input
                  type="number"
                  name="patientId"
                  value={form.patientId}
                  onChange={handleFormChange}
                />
              </div>

              <div className="add-field">
                <label>Patient name *</label>
                <input
                  type="text"
                  name="patientName"
                  value={form.patientName}
                  onChange={handleFormChange}
                />
                {errors.patientName && (
                  <p className="error-text">{errors.patientName}</p>
                )}
              </div>

              <div className="add-field">
                <label>Trip date & time *</label>
                <input
                  type="datetime-local"
                  name="tripDateTime"
                  value={form.tripDateTime}
                  onChange={handleFormChange}
                />
                {errors.tripDateTime && (
                  <p className="error-text">{errors.tripDateTime}</p>
                )}
              </div>

              <div className="add-field">
                <label>Pickup location *</label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={form.pickupLocation}
                  onChange={handleFormChange}
                />
                {errors.pickupLocation && (
                  <p className="error-text">{errors.pickupLocation}</p>
                )}
              </div>

              <div className="add-field">
                <label>Drop location *</label>
                <input
                  type="text"
                  name="dropLocation"
                  value={form.dropLocation}
                  onChange={handleFormChange}
                />
                {errors.dropLocation && (
                  <p className="error-text">{errors.dropLocation}</p>
                )}
              </div>

              <div className="add-field">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  rows={3}
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    padding: "0.5rem 0.7rem",
                    fontSize: "0.9rem",
                    resize: "vertical",
                  }}
                />
              </div>

              <div className="add-field">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="add-doctor-footer" style={{ paddingTop: "0.75rem" }}>
                <button
                  type="button"
                  className="add-cancel"
                  onClick={resetForm}
                >
                  Clear
                </button>
                <button type="submit" className="add-submit">
                  {editingTrip ? "Save changes" : "Add trip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceTripsModal;
