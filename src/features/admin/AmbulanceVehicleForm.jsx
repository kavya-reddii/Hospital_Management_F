// src/features/admin/AmbulanceVehicleForm.jsx
import React, { useEffect, useState } from "react";
import "./AdminDoctors.css";

const todayStr = new Date().toISOString().slice(0, 10);

const AmbulanceVehicleForm = ({ editingVehicle, onClose, onSaved }) => {
  const [form, setForm] = useState({
    vehicleNo: "",
    registeredDate: "",
    place: "",
    driverName: "",
    status: "ACTIVE",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (editingVehicle) {
      setForm({
        vehicleNo: editingVehicle.vehicleNo || "",
        registeredDate: editingVehicle.registeredDate || "",
        place: editingVehicle.place || "",
        driverName: editingVehicle.driverName || "",
        status: editingVehicle.status || "ACTIVE",
      });
    }
  }, [editingVehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.vehicleNo.trim()) errs.vehicleNo = "Vehicle number is required";
    if (!form.registeredDate) errs.registeredDate = "Registered date is required";
    if (form.registeredDate && form.registeredDate > todayStr) {
      errs.registeredDate = "Registered date cannot be in future";
    }
    if (!form.place.trim()) errs.place = "Place is required";
    if (!form.driverName.trim()) errs.driverName = "Driver name is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const isEdit = !!editingVehicle;
      const url = isEdit
        ? `http://localhost:8081/api/admin/ambulance/${editingVehicle.id}`
        : "http://localhost:8081/api/admin/ambulance";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        vehicleNo: form.vehicleNo.trim().toUpperCase(),
        registeredDate: form.registeredDate,
        place: form.place.trim(),
        driverName: form.driverName.trim(),
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
        console.error("Failed to save vehicle", res.status, text);
        if (text.toLowerCase().includes("vehicle already exists")) {
          setErrors((prev) => ({
            ...prev,
            vehicleNo: "Vehicle number already exists",
          }));
        } else {
          setServerError("Failed to save vehicle. Please try again.");
        }
        return;
      }

      const saved = await res.json();
      onSaved(saved);
    } catch (e) {
      console.error("Error saving vehicle", e);
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="add-doctor-overlay">
      <div className="add-doctor-dialog">
        <div className="add-doctor-header">
          <h2>{editingVehicle ? "Edit vehicle" : "Add vehicle"}</h2>
          <button className="add-doctor-close" onClick={onClose}>
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
            <div className="add-doctor-column">
              <div className="add-field">
                <label>Vehicle number *</label>
                <input
                  type="text"
                  name="vehicleNo"
                  value={form.vehicleNo}
                  onChange={handleChange}
                  placeholder="KA01 AB 1234"
                />
                {errors.vehicleNo && (
                  <p className="error-text">{errors.vehicleNo}</p>
                )}
              </div>

              <div className="add-field">
                <label>Registered date *</label>
                <input
                  type="date"
                  name="registeredDate"
                  value={form.registeredDate}
                  max={todayStr}
                  onChange={handleChange}
                />
                {errors.registeredDate && (
                  <p className="error-text">{errors.registeredDate}</p>
                )}
              </div>
            </div>

            <div className="add-doctor-column">
              <div className="add-field">
                <label>Place *</label>
                <input
                  type="text"
                  name="place"
                  value={form.place}
                  onChange={handleChange}
                  placeholder="Bangalore"
                />
                {errors.place && <p className="error-text">{errors.place}</p>}
              </div>

              <div className="add-field">
                <label>Driver name *</label>
                <input
                  type="text"
                  name="driverName"
                  value={form.driverName}
                  onChange={handleChange}
                  placeholder="Driver name"
                />
                {errors.driverName && (
                  <p className="error-text">{errors.driverName}</p>
                )}
              </div>

              <div className="add-field">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="add-doctor-footer">
            <button type="button" className="add-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="add-submit">
              {editingVehicle ? "Save changes" : "Add vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AmbulanceVehicleForm;
