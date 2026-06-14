// src/features/admin/AdminPharmacy.jsx
import React, { useEffect, useMemo, useState } from "react";
import AdminNavbar from "./AdminNavbar";
import "./AdminDoctors.css";
import MedicineFormModal from "./MedicineFormModal";
import MedicinePurchasesModal from "./MedicinePurchasesModal";

const AdminPharmacy = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [diseaseFilter, setDiseaseFilter] = useState("ALL");

  const [isMedicineFormOpen, setIsMedicineFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  const [isPurchasesOpen, setIsPurchasesOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const token = localStorage.getItem("token");

  // load medicines
  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const res = await fetch(
          "http://localhost:8081/api/admin/pharmacy/medicines",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          console.error("Failed to load medicines", res.status);
          return;
        }
        const data = await res.json();
        setMedicines(data);
      } catch (e) {
        console.error("Error loading medicines", e);
      } finally {
        setLoading(false);
      }
    };
    loadMedicines();
  }, [token]);

  const openAddMedicine = () => {
    setEditingMedicine(null);
    setIsMedicineFormOpen(true);
  };

  const openEditMedicine = (med) => {
    setEditingMedicine(med);
    setIsMedicineFormOpen(true);
  };

  const handleMedicineSaved = (saved) => {
    setMedicines((prev) => {
      const exists = prev.some((m) => m.id === saved.id);
      if (exists) {
        return prev.map((m) => (m.id === saved.id ? saved : m));
      }
      return [...prev, saved];
    });
    setIsMedicineFormOpen(false);
    setEditingMedicine(null);
  };

  const handleRestockUpdated = (updated) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
  };

  const openPurchases = (med) => {
    setSelectedMedicine(med);
    setIsPurchasesOpen(true);
  };

  const handleStockChangedFromPurchase = (updatedMedicine) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === updatedMedicine.id ? updatedMedicine : m))
    );
  };

  const allDiseases = useMemo(() => {
    const set = new Set();
    medicines.forEach((m) => {
      if (m.disease) set.add(m.disease);
    });
    return Array.from(set);
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const text = (m.name + " " + (m.disease || "")).toLowerCase();
      if (!text.includes(search.toLowerCase())) return false;
      if (statusFilter !== "ALL" && m.status !== statusFilter) return false;
      if (diseaseFilter !== "ALL" && m.disease !== diseaseFilter) return false;
      return true;
    });
  }, [medicines, search, statusFilter, diseaseFilter]);

  const getStatusColors = (status) => {
    if (status === "OK") {
      return { bg: "#DCFCE7", color: "#166534" }; // green
    }
    if (status === "LOW") {
      return { bg: "#FEF9C3", color: "#854D0E" }; // yellow
    }
    return { bg: "#FEE2E2", color: "#B91C1C" }; // CRITICAL red
  };

  if (loading) {
    return (
      <div className="admin-doctors-page">
        <AdminNavbar />
        <p style={{ padding: "1.5rem 2rem" }}>Loading medicines...</p>
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
          placeholder="Search by medicine or disease..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ marginLeft: "0.5rem" }}
        >
          <option value="ALL">All status</option>
          <option value="CRITICAL">Critical (red)</option>
          <option value="LOW">Low (yellow)</option>
          <option value="OK">OK (green)</option>
        </select>

        <select
          value={diseaseFilter}
          onChange={(e) => setDiseaseFilter(e.target.value)}
          style={{ marginLeft: "0.5rem" }}
        >
          <option value="ALL">All diseases</option>
          {allDiseases.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <button className="add-doctor-button" onClick={openAddMedicine}>
          Add medicine
        </button>
      </div>

      <h3 style={{ padding: "1rem 2rem 0.25rem" ,  textAlign:"center"}}>Pharmacy medicines</h3>
      <div className="doctor-grid">
        {filteredMedicines.map((m) => {
          const { bg, color } = getStatusColors(m.status);
          const ratio =
            m.maxStock && m.maxStock > 0
              ? Math.round((m.currentStock / m.maxStock) * 100)
              : null;

          return (
            <div key={m.id} className="doctor-card">
              <div className="doctor-info">
                <h4>{m.name}</h4>
                <p className="doctor-dept">
                  Disease: {m.disease || "General"}
                </p>
                <p className="doctor-place">
                  Stock: {m.currentStock} / {m.maxStock} units{" "}
                  {ratio !== null && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#6B7280",
                        marginLeft: "0.15rem",
                      }}
                    >
                      ({ratio}%)
                    </span>
                  )}
                </p>
                <div
                  style={{
                    width: "100%",
                    height: "6px",
                    borderRadius: "999px",
                    backgroundColor: "#E5E7EB",
                    margin: "0.25rem 0 0.35rem",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.max(0, Math.min(100, ratio || 0))}%`,
                      backgroundColor: color,
                      transition: "width 0.2s ease",
                    }}
                  />
                </div>
                <p className="doctor-place">
                  Status:{" "}
                  <span
                    style={{
                      padding: "0.15rem 0.5rem",
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      backgroundColor: bg,
                      color,
                    }}
                  >
                    {m.status}
                  </span>
                </p> 
                <p className="doctor-place">
                  Last restock: {m.lastRestockDate || "N/A"}
                </p>

                <br></br>

                <div className="doctor-actions">
                  <button
                    type="button"
                    className="doctor-action-btn"
                    onClick={() => openPurchases(m)}
                  >
                    Purchases
                  </button>
                  <button
                    type="button"
                    className="doctor-action-btn"
                    onClick={() => openEditMedicine(m)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="doctor-action-btn"
                    onClick={async () => {
                      const qtyStr = window.prompt(
                        "Enter restock quantity (to add):"
                      );
                      if (!qtyStr) return;
                      const qty = Number(qtyStr);
                      if (Number.isNaN(qty) || qty <= 0) {
                        alert("Invalid quantity");
                        return;
                      }
                      try {
                        const res = await fetch(
                          `http://localhost:8081/api/admin/pharmacy/medicines/${m.id}/restock`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ quantity: qty }),
                          }
                        );
                        if (!res.ok) {
                          const text = await res.text();
                          console.error("Restock failed", res.status, text);
                          alert("Failed to restock");
                          return;
                        }
                        const updated = await res.json();
                        handleRestockUpdated(updated);
                      } catch (e) {
                        console.error("Error restocking", e);
                        alert("Error while restocking");
                      }
                    }}
                  >
                    Restock
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isMedicineFormOpen && (
        <MedicineFormModal
          editingMedicine={editingMedicine}
          onClose={() => {
            setIsMedicineFormOpen(false);
            setEditingMedicine(null);
          }}
          onSaved={handleMedicineSaved}
        />
      )}

      {isPurchasesOpen && selectedMedicine && (
        <MedicinePurchasesModal
          medicine={selectedMedicine}
          onClose={() => setIsPurchasesOpen(false)}
          onStockChanged={handleStockChangedFromPurchase}
        />
      )}
    </div>
  );
};

export default AdminPharmacy;
