// src/features/admin/MedicinePurchasesModal.jsx
import React, { useEffect, useState } from "react";
import "./AdminDoctors.css";

const MedicinePurchasesModal = ({ medicine, onClose, onStockChanged }) => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const [doctors, setDoctors] = useState([]);

  const [editingPurchase, setEditingPurchase] = useState(null);
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    quantity: "",
    purchaseDate: "",
    prescription: "",
    invoiceNo: "",
    paymentStatus: "PAID",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const token = localStorage.getItem("token");
  const todayStr = new Date().toISOString().slice(0, 10);

  const loadPurchases = async () => {
    try {
      const res = await fetch(
        `http://localhost:8081/api/admin/pharmacy/medicines/${medicine.id}/purchases`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        console.error("Failed to load purchases");
        return;
      }
      const data = await res.json();
      setPurchases(data);
    } catch (e) {
      console.error("Error loading purchases", e);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/admin/doctor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setDoctors(data);
    } catch (e) {
      console.error("Error loading doctors", e);
    }
  };

  useEffect(() => {
    loadPurchases();
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicine.id]);

  const resetForm = () => {
    setEditingPurchase(null);
    setForm({
      patientId: "",
      doctorId: "",
      quantity: "",
      purchaseDate: todayStr,
      prescription: "",
      invoiceNo: "",
      paymentStatus: "PAID",
    });
    setErrors({});
    setServerError("");
  };

  useEffect(() => {
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "quantity") {
      setForm((prev) => ({ ...prev, [name]: value === "" ? "" : Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.patientId) errs.patientId = "Patient ID is required";
    if (!form.doctorId) errs.doctorId = "Doctor is required";
    if (!form.quantity || form.quantity <= 0)
      errs.quantity = "Quantity must be > 0";
    if (!form.purchaseDate) errs.purchaseDate = "Date is required";
    if (form.purchaseDate && form.purchaseDate > todayStr)
      errs.purchaseDate = "Date cannot be in future";
    if (!form.invoiceNo.trim())
      errs.invoiceNo = "Invoice number is required";

    // stock check only for new or increased quantity
    const currentStock = medicine.currentStock;
    const oldQuantity = editingPurchase ? editingPurchase.quantity : 0;
    const delta = form.quantity - oldQuantity;
    if (delta > 0 && delta > currentStock)
      errs.quantity = "Not enough stock for this quantity";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const isEdit = !!editingPurchase;
      const url = isEdit
        ? `http://localhost:8081/api/admin/pharmacy/purchases/${editingPurchase.id}`
        : `http://localhost:8081/api/admin/pharmacy/medicines/${medicine.id}/purchases`;
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        patientId: form.patientId ? Number(form.patientId) : null,
        doctorId: form.doctorId ? Number(form.doctorId) : null,
        quantity: form.quantity,
        purchaseDate: form.purchaseDate,
        prescription: form.prescription.trim(),
        invoiceNo: form.invoiceNo.trim(),
        paymentStatus: form.paymentStatus,
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
        console.error("Failed to save purchase", res.status, text);
        setServerError(text || "Failed to save purchase");
        return;
      }

      const result = await res.json();
      await loadPurchases();
      if (result.updatedMedicine) {
        onStockChanged(result.updatedMedicine);
      }
      resetForm();
    } catch (e) {
      console.error("Error saving purchase", e);
      setServerError("Something went wrong. Please try again.");
    }
  };

  const handleEditPurchase = (p) => {
    setEditingPurchase(p);
    setForm({
      patientId: p.patientId || "",
      doctorId: p.doctorId || "",
      quantity: p.quantity,
      purchaseDate: p.purchaseDate,
      prescription: p.prescription || "",
      invoiceNo: p.invoiceNo || "",
      paymentStatus: p.paymentStatus || "PAID",
    });
    setErrors({});
    setServerError("");
  };

  const handleCancelPurchase = async (p) => {
    if (!window.confirm("Cancel this purchase and return stock?")) return;
    try {
      const res = await fetch(
        `http://localhost:8081/api/admin/pharmacy/purchases/${p.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to cancel purchase", res.status, text);
        alert("Failed to cancel purchase");
        return;
      }
      const result = await res.json(); // contains updatedMedicine
      await loadPurchases();
      if (result.updatedMedicine) {
        onStockChanged(result.updatedMedicine);
      }
    } catch (e) {
      console.error("Error cancelling purchase", e);
    }
  };

  const filteredPurchases = purchases.filter((p) => {
    if (statusFilter !== "ALL" && p.paymentStatus !== statusFilter) return false;
    if (dateFilter && p.purchaseDate !== dateFilter) return false;
    return true;
  });

  return (
    <div className="add-doctor-overlay">
      <div className="add-doctor-dialog" style={{ maxWidth: "950px" }}>
        <div className="add-doctor-header">
          <h2>Purchases for {medicine.name}</h2>
          <button className="add-doctor-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="add-doctor-body" style={{ gap: "1.5rem" }}>
          <div className="add-doctor-column" style={{ flex: 1.4 }}>
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
                <option value="ALL">All payments</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
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
              <p>Loading purchases...</p>
            ) : filteredPurchases.length === 0 ? (
              <p style={{ fontSize: "0.9rem", color: "#6B7280" }}>
                No purchases for this medicine.
              </p>
            ) : (
              <div
                style={{
                  maxHeight: "320px",
                  overflowY: "auto",
                  paddingRight: "0.25rem",
                }}
              >
                {filteredPurchases.map((p) => (
                  <div
                    key={p.id}
                    className="complaint-item"
                    style={{ marginBottom: "0.5rem" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          Patient ID: {p.patientId || "-"}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                          Doctor: {p.doctorName || p.doctorId || "-"} • Qty:{" "}
                          {p.quantity}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                          {p.purchaseDate} • Invoice: {p.invoiceNo}
                        </div>
                        <div style={{ fontSize: "0.8rem", marginTop: "0.15rem" }}>
                          Payment:{" "}
                          <span
                            style={{
                              padding: "0.1rem 0.45rem",
                              borderRadius: "999px",
                              backgroundColor:
                                p.paymentStatus === "PAID"
                                  ? "#DCFCE7"
                                  : p.paymentStatus === "PENDING"
                                  ? "#FEF9C3"
                                  : "#FEE2E2",
                              color:
                                p.paymentStatus === "PAID"
                                  ? "#166534"
                                  : p.paymentStatus === "PENDING"
                                  ? "#854D0E"
                                  : "#B91C1C",
                              fontSize: "0.75rem",
                            }}
                          >
                            {p.paymentStatus}
                          </span>
                        </div>
                        {p.prescription && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#6B7280",
                              marginTop: "0.2rem",
                            }}
                          >
                            Prescription: {p.prescription}
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
                          onClick={() => handleEditPurchase(p)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="doctor-action-btn delete"
                          onClick={() => handleCancelPurchase(p)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="add-doctor-column" style={{ flex: 1 }}>
            <h4 style={{ marginBottom: "0.5rem" }}>
              {editingPurchase ? "Edit purchase" : "Make purchase"}
            </h4>

            {serverError && (
              <p className="error-text" style={{ marginBottom: "0.5rem" }}>
                {serverError}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="add-field">
                <label>Patient ID *</label>
                <input
                  type="number"
                  name="patientId"
                  value={form.patientId}
                  onChange={handleFormChange}
                />
                {errors.patientId && (
                  <p className="error-text">{errors.patientId}</p>
                )}
              </div>

              <div className="add-field">
                <label>Doctor *</label>
                <select
                  name="doctorId"
                  value={form.doctorId}
                  onChange={handleFormChange}
                >
                  <option value="">Select doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullname}
                    </option>
                  ))}
                </select>
                {errors.doctorId && (
                  <p className="error-text">{errors.doctorId}</p>
                )}
              </div>

              <div className="add-field">
                <label>Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={form.quantity}
                  onChange={handleFormChange}
                />
                {errors.quantity && (
                  <p className="error-text">{errors.quantity}</p>
                )}
              </div>

              <div className="add-field">
                <label>Purchase date *</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={form.purchaseDate}
                  max={todayStr}
                  onChange={handleFormChange}
                />
                {errors.purchaseDate && (
                  <p className="error-text">{errors.purchaseDate}</p>
                )}
              </div>

              <div className="add-field">
                <label>Invoice no. *</label>
                <input
                  type="text"
                  name="invoiceNo"
                  value={form.invoiceNo}
                  onChange={handleFormChange}
                />
                {errors.invoiceNo && (
                  <p className="error-text">{errors.invoiceNo}</p>
                )}
              </div>

              <div className="add-field">
                <label>Prescription</label>
                <textarea
                  name="prescription"
                  value={form.prescription}
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
                <label>Payment status</label>
                <select
                  name="paymentStatus"
                  value={form.paymentStatus}
                  onChange={handleFormChange}
                >
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
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
                  {editingPurchase ? "Save changes" : "Make purchase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicinePurchasesModal;
