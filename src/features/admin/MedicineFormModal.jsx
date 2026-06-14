// src/features/admin/MedicineFormModal.jsx
import React, { useEffect, useState } from "react";
import "./AdminDoctors.css";

const todayStr = new Date().toISOString().slice(0, 10);

const MedicineFormModal = ({ editingMedicine, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: "",
    disease: "",
    currentStock: 0,
    maxStock: 0,
    reorderLevel: 0,
    lastRestockDate: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (editingMedicine) {
      setForm({
        name: editingMedicine.name || "",
        disease: editingMedicine.disease || "",
        currentStock: editingMedicine.currentStock ?? 0,
        maxStock: editingMedicine.maxStock ?? 0,
        reorderLevel: editingMedicine.reorderLevel ?? 0,
        lastRestockDate: editingMedicine.lastRestockDate || todayStr,
      });
    } else {
      setForm((prev) => ({
        ...prev,
        lastRestockDate: todayStr,
      }));
    }
  }, [editingMedicine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      ["currentStock", "maxStock", "reorderLevel"].includes(name)
    ) {
      setForm((prev) => ({ ...prev, [name]: value === "" ? "" : Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.disease.trim()) errs.disease = "Disease is required";
    if (form.maxStock <= 0) errs.maxStock = "Max stock must be > 0";
    if (form.currentStock < 0) errs.currentStock = "Stock cannot be negative";
    if (form.currentStock > form.maxStock)
      errs.currentStock = "Current stock cannot exceed max stock";
    if (form.reorderLevel < 0)
      errs.reorderLevel = "Reorder level cannot be negative";
    if (form.reorderLevel >= form.maxStock)
      errs.reorderLevel = "Reorder level must be less than max stock";
    if (!form.lastRestockDate)
      errs.lastRestockDate = "Last restock date is required";
    if (form.lastRestockDate && form.lastRestockDate > todayStr)
      errs.lastRestockDate = "Restock date cannot be in future";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const isEdit = !!editingMedicine;
      const url = isEdit
        ? `http://localhost:8081/api/admin/pharmacy/medicines/${editingMedicine.id}`
        : "http://localhost:8081/api/admin/pharmacy/medicines";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        name: form.name.trim(),
        disease: form.disease.trim(),
        currentStock: form.currentStock,
        maxStock: form.maxStock,
        reorderLevel: form.reorderLevel,
        lastRestockDate: form.lastRestockDate,
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
        console.error("Failed to save medicine", res.status, text);
        if (text.toLowerCase().includes("already exists")) {
          setErrors((prev) => ({
            ...prev,
            name: "Medicine with this name already exists",
          }));
        } else {
          setServerError("Failed to save medicine. Please try again.");
        }
        return;
      }

      const saved = await res.json();
      onSaved(saved);
    } catch (e) {
      console.error("Error saving medicine", e);
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="add-doctor-overlay">
      <div className="add-doctor-dialog">
        <div className="add-doctor-header">
          <h2>{editingMedicine ? "Edit medicine" : "Add medicine"}</h2>
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
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <p className="error-text">{errors.name}</p>
                )}
              </div>

              <div className="add-field">
                <label>Disease *</label>
                <input
                  type="text"
                  name="disease"
                  value={form.disease}
                  onChange={handleChange}
                  placeholder="e.g. Diabetes"
                />
                {errors.disease && (
                  <p className="error-text">{errors.disease}</p>
                )}
              </div>

              <div className="add-field">
                <label>Last restock date *</label>
                <input
                  type="date"
                  name="lastRestockDate"
                  value={form.lastRestockDate}
                  max={todayStr}
                  onChange={handleChange}
                />
                {errors.lastRestockDate && (
                  <p className="error-text">{errors.lastRestockDate}</p>
                )}
              </div>
            </div>

            <div className="add-doctor-column">
              <div className="add-field">
                <label>Current stock *</label>
                <input
                  type="number"
                  name="currentStock"
                  min="0"
                  value={form.currentStock}
                  onChange={handleChange}
                />
                {errors.currentStock && (
                  <p className="error-text">{errors.currentStock}</p>
                )}
              </div>

              <div className="add-field">
                <label>Max stock *</label>
                <input
                  type="number"
                  name="maxStock"
                  min="1"
                  value={form.maxStock}
                  onChange={handleChange}
                />
                {errors.maxStock && (
                  <p className="error-text">{errors.maxStock}</p>
                )}
              </div>

              <div className="add-field">
                <label>Reorder level *</label>
                <input
                  type="number"
                  name="reorderLevel"
                  min="0"
                  value={form.reorderLevel}
                  onChange={handleChange}
                />
                {errors.reorderLevel && (
                  <p className="error-text">{errors.reorderLevel}</p>
                )}
              </div>
            </div>
          </div>

          <div className="add-doctor-footer">
            <button type="button" className="add-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="add-submit">
              {editingMedicine ? "Save changes" : "Add medicine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicineFormModal;
