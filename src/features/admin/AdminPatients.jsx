// src/features/admin/AdminPatients.jsx
import React, { useState, useMemo, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import "./AdminDoctors.css"; // reuse same styles

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingPatientId, setEditingPatientId] = useState(null);

  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [selectedDisease, setSelectedDisease] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [newPatient, setNewPatient] = useState({
    name: "",
    disease: "",
    age: "",
    gender: "",        // NEW
    branch: "",
    city: "",
    joiningDate: "",
    contactNumber: "",
    username: "",
    password: "",
    profilePicFile: null,
    profilePicUrl: "/default_patient.png",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const handleEditPatient = (pat) => {
    setEditingPatientId(pat.id);
    setNewPatient({
      name: pat.fullname,
      disease: pat.disease,
      age: pat.age != null ? String(pat.age) : "",
      gender: pat.gender || "",
      branch: pat.branch,
      city: pat.city,
      joiningDate: pat.joiningDate || "",
      contactNumber: pat.contactNumber || "",
      username: pat.username || "",
      password: "",
      profilePicFile: null,
      profilePicUrl:
        pat.profilePicBase64 || pat.profilePicUrl || "/default_patient.png",
    });
    setErrors({});
    setServerError("");
    setIsAddOpen(true);
  };

  const handleDeletePatient = async (pat) => {
    if (!window.confirm(`Delete patient ${pat.fullname}?`)) return;

    try {
      const res = await fetch(
        `http://localhost:8081/api/admin/patient/${pat.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to delete patient", res.status, text);
        alert("Failed to delete patient");
        return;
      }

      setPatients((prev) => prev.filter((p) => p.id !== pat.id));
    } catch (err) {
      console.error("Error deleting patient", err);
      alert("Something went wrong while deleting");
    }
  };

  // Load patients
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const res = await fetch("http://localhost:8081/api/admin/patient", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) {
          console.error("Failed to load patients", res.status);
          setLoading(false);
          return;
        }
        const data = await res.json();
        const mapped = data.map((p) => ({
          ...p,
          profilePicUrl:
            p.profilePicBase64 || p.profilePicUrl || "/default_patient.png",
        }));
        setPatients(mapped);
      } catch (err) {
        console.error("Error loading patients", err);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const toggleFilter = () => setIsFilterOpen((prev) => !prev);
  const toggleAdd = () => {
    setErrors({});
    setServerError("");
    setIsAddOpen((prev) => !prev);
    if (!isAddOpen) {
      setEditingPatientId(null);
      setNewPatient({
        name: "",
        disease: "",
        age: "",
        gender: "",
        branch: "",
        city: "",
        joiningDate: "",
        contactNumber: "",
        username: "",
        password: "",
        profilePicFile: null,
        profilePicUrl: "/default_patient.png",
      });
    }
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((pat) => {
      const text = (pat.fullname + " " + pat.disease).toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesDisease = selectedDisease
        ? pat.disease === selectedDisease
        : true;
      const matchesCity = selectedCity ? pat.city === selectedCity : true;
      return matchesSearch && matchesDisease && matchesCity;
    });
  }, [patients, search, selectedDisease, selectedCity]);

  const diseases = Array.from(new Set(patients.map((p) => p.disease)));
  const cities = Array.from(new Set(patients.map((p) => p.city)));

  const handleNewPatientChange = (e) => {
    const { name, value } = e.target;
    setNewPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !newPatient.username.trim()) {
      alert("Please enter Username first");
      e.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      alert("Image must be under 1MB");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", newPatient.username.trim());

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8081/api/admin/patient/upload-profile-pic",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (response.ok) {
        const backendBase64 = await response.text();
        setNewPatient((prev) => ({
          ...prev,
          profilePicFile: file,
          profilePicUrl: backendBase64,
        }));
      } else {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const base64Image = evt.target.result;
          setNewPatient((prev) => ({
            ...prev,
            profilePicFile: file,
            profilePicUrl: base64Image,
          }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64Image = evt.target.result;
        setNewPatient((prev) => ({
          ...prev,
          profilePicFile: file,
          profilePicUrl: base64Image,
        }));
      };
      reader.readAsDataURL(file);
    }

    e.target.value = "";
  };

  const isStrongPassword = (pwd) => {
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasDigit = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    return (
      pwd.length >= 8 && hasUpper && hasLower && hasDigit && hasSpecial
    );
  };

  const validateNewPatient = () => {
    const errs = {};

    const name = newPatient.name.trim();
    if (!name) {
      errs.name = "Name is required";
    } else {
      const words = name.split(" ").filter(Boolean);
      const allCapitalized = words.every(
        (w) => w[0] === w[0]?.toUpperCase()
      );
      if (!allCapitalized) {
        errs.name = "Each word should start with a capital letter";
      }
    }

    if (!newPatient.disease.trim()) errs.disease = "Disease is required";

    const age = newPatient.age.trim();
    if (!age) {
      errs.age = "Age is required";
    } else if (!/^\d+$/.test(age) || Number(age) <= 0) {
      errs.age = "Age must be a positive number";
    }

    if (!newPatient.gender) errs.gender = "Gender is required";

    if (!newPatient.branch.trim()) errs.branch = "Branch is required";
    if (!newPatient.city.trim()) errs.city = "City is required";
    if (!newPatient.joiningDate) errs.joiningDate = "Joining date is required";

    const contact = newPatient.contactNumber.trim();
    if (!contact) {
      errs.contactNumber = "Contact number is required";
    } else if (!/^\d{10}$/.test(contact)) {
      errs.contactNumber = "Contact must be 10 digits";
    }

    const username = newPatient.username.trim();
    if (!username) {
      errs.username = "Username is required";
    } else if (username.length < 4) {
      errs.username = "Username must be at least 4 characters";
    }

    const password = newPatient.password.trim();
    if (!editingPatientId) {
      if (!password) {
        errs.password = "Password is required";
      } else if (!isStrongPassword(password)) {
        errs.password =
          "Password must be 8+ chars with uppercase, lowercase, number, and special character";
      }
    } else {
      if (password && !isStrongPassword(password)) {
        errs.password =
          "Password must be 8+ chars with uppercase, lowercase, number, and special character";
      }
    }

    return errs;
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    const errs = validateNewPatient();
    setErrors(errs);
    setServerError("");
    if (Object.keys(errs).length > 0) {
      console.log("Validation failed", errs);
      return;
    }

    try {
      const isEdit = editingPatientId !== null;
      const url = isEdit
        ? `http://localhost:8081/api/admin/patient/${editingPatientId}`
        : "http://localhost:8081/api/admin/patient";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        name: newPatient.name.trim(),
        disease: newPatient.disease.trim(),
        age: Number(newPatient.age.trim()),
        gender: newPatient.gender, // NEW
        branch: newPatient.branch.trim(),
        city: newPatient.city.trim(),
        joiningDate: newPatient.joiningDate,
        contactNumber: newPatient.contactNumber.trim(),
        username: newPatient.username.trim(),
        profilePicBase64: newPatient.profilePicUrl || "",
      };

      if (!isEdit || newPatient.password.trim()) {
        payload.password = newPatient.password.trim();
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Failed to create patient", response.status, text);

        if (
          response.status === 400 &&
          text.toLowerCase().includes("username")
        ) {
          setErrors((prev) => ({
            ...prev,
            username: "Username already exists",
          }));
        } else {
          setServerError("Failed to create patient. Please try again.");
        }
        return;
      }

      const savedPatient = await response.json();

      if (isEdit) {
        setPatients((prev) =>
          prev.map((p) =>
            p.id === savedPatient.id
              ? {
                  ...savedPatient,
                  profilePicUrl:
                    savedPatient.profilePicBase64 ||
                    newPatient.profilePicUrl ||
                    p.profilePicUrl ||
                    "/default_patient.png",
                }
              : p
          )
        );
      } else {
        setPatients((prev) => [
          ...prev,
          {
            ...savedPatient,
            profilePicUrl:
              savedPatient.profilePicBase64 ||
              newPatient.profilePicUrl ||
              "/default_patient.png",
          },
        ]);
      }

      setNewPatient({
        name: "",
        disease: "",
        age: "",
        gender: "",
        branch: "",
        city: "",
        joiningDate: "",
        contactNumber: "",
        username: "",
        password: "",
        profilePicFile: null,
        profilePicUrl: "/default_patient.png",
      });
      setEditingPatientId(null);
      setErrors({});
      setServerError("");
      setIsAddOpen(false);
    } catch (err) {
      console.error("Error creating patient", err);
      setServerError("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="admin-doctors-page">
        <AdminNavbar />
        <p style={{ padding: "1.5rem 2rem" }}>Loading patients...</p>
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
          placeholder="Search by name or disease..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="filter-button" onClick={toggleFilter}>
          Filters
        </button>

        <button className="add-doctor-button" onClick={toggleAdd}>
          + Add patient
        </button>
      </div>

      {isFilterOpen && (
        <div className="filter-modal">
          <div className="filter-card">
            <div className="filter-header">
              <h3>Filter patients</h3>
              <button className="filter-close" onClick={toggleFilter}>
                ×
              </button>
            </div>

            <div className="filter-body">
              <div className="filter-group">
                <label>Disease</label>
                <select
                  value={selectedDisease}
                  onChange={(e) => setSelectedDisease(e.target.value)}
                >
                  <option value="">All</option>
                  {diseases.map((dis) => (
                    <option key={dis} value={dis}>
                      {dis}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="">All</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-footer">
              <button
                className="filter-clear"
                onClick={() => {
                  setSelectedDisease("");
                  setSelectedCity("");
                }}
              >
                Clear
              </button>
              <button className="filter-apply" onClick={toggleFilter}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
{isAddOpen && (
  <div className="add-doctor-overlay">
    <div className="add-doctor-dialog">
      <div className="add-doctor-header">
        <h2>{editingPatientId ? "Edit Patient" : "Add Patient"}</h2>
        <button className="add-doctor-close" onClick={toggleAdd}>
          ×
        </button>
      </div>

      <form className="add-doctor-form" onSubmit={handleAddPatient}>
        {serverError && (
          <p className="error-text" style={{ marginBottom: "0.75rem" }}>
            {serverError}
          </p>
        )}

        <div className="add-doctor-body">
          {/* LEFT column */}
          <div className="add-doctor-column">
            <div className="add-field">
              <label>Full name *</label>
              <input
                type="text"
                name="name"
                value={newPatient.name}
                onChange={handleNewPatientChange}
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            <div className="add-field">
              <label>Disease *</label>
              <input
                type="text"
                name="disease"
                value={newPatient.disease}
                onChange={handleNewPatientChange}
              />
              {errors.disease && (
                <p className="error-text">{errors.disease}</p>
              )}
            </div>

            <div className="add-field">
              <label>Age *</label>
              <input
                type="text"
                name="age"
                value={newPatient.age}
                onChange={handleNewPatientChange}
              />
              {errors.age && <p className="error-text">{errors.age}</p>}
            </div>

             <div className="add-field">
              <label>Branch *</label>
              <input
                type="text"
                name="branch"
                value={newPatient.branch}
                onChange={handleNewPatientChange}
              />
              {errors.branch && (
                <p className="error-text">{errors.branch}</p>
              )}
            </div>

             <div className="add-field">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={newPatient.city}
                onChange={handleNewPatientChange}
              />
              {errors.city && <p className="error-text">{errors.city}</p>}
            </div>

            <div className="add-field">
              <label>Gender *</label>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <label style={{ fontSize: "0.85rem", color: "#4B5563" }}>
                  <input
                    type="radio"
                    name="gender"
                    value="MALE"
                    checked={newPatient.gender === "MALE"}
                    onChange={handleNewPatientChange}
                  />{" "}
                  Male
                </label>
                <label style={{ fontSize: "0.85rem", color: "#4B5563" }}>
                  <input
                    type="radio"
                    name="gender"
                    value="FEMALE"
                    checked={newPatient.gender === "FEMALE"}
                    onChange={handleNewPatientChange}
                  />{" "}
                  Female
                </label>
                <label style={{ fontSize: "0.85rem", color: "#4B5563" }}>
                  <input
                    type="radio"
                    name="gender"
                    value="OTHER"
                    checked={newPatient.gender === "OTHER"}
                    onChange={handleNewPatientChange}
                  />{" "}
                  Other
                </label>
              </div>
              {errors.gender && (
                <p className="error-text">{errors.gender}</p>
              )}
            </div>
          </div>

          {/* RIGHT column */}
          <div className="add-doctor-column">
           

           

            <div className="add-field">
              <label>Joining date *</label>
              <input
                type="date"
                name="joiningDate"
                value={newPatient.joiningDate}
                onChange={handleNewPatientChange}
              />
              {errors.joiningDate && (
                <p className="error-text">{errors.joiningDate}</p>
              )}
            </div>

            <div className="add-field">
              <label>Contact number *</label>
              <input
                type="text"
                name="contactNumber"
                value={newPatient.contactNumber}
                onChange={handleNewPatientChange}
              />
              {errors.contactNumber && (
                <p className="error-text">{errors.contactNumber}</p>
              )}
            </div>

            <div className="add-field">
              <label>Username for login *</label>
              <input
                type="text"
                name="username"
                value={newPatient.username}
                onChange={handleNewPatientChange}
              />
              {errors.username && (
                <p className="error-text">{errors.username}</p>
              )}
            </div>

            <div className="add-field">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={newPatient.password}
                onChange={handleNewPatientChange}
              />
              {errors.password && (
                <p className="error-text">{errors.password}</p>
              )}
            </div>

            <div className="add-field">
              <label>Profile picture (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
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
            {editingPatientId ? "Save changes" : "Add patient"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      <div className="doctor-grid">
        {filteredPatients.map((pat) => (
          <div key={pat.id} className="doctor-card">
            <div className="doctor-avatar">
              <img
                src={pat.profilePicUrl || "/default_patient.png"}
                alt={pat.fullname}
              />
            </div>
            <div className="doctor-info">
              <h4>{pat.fullname}</h4>
              <p className="doctor-dept">{pat.disease}</p>
              <p className="doctor-place">
                {pat.gender} • Age {pat.age} • {pat.branch} • {pat.city}
              </p>
              <p className="doctor-place">
                Joined: {pat.joiningDate} • {pat.contactNumber}
              </p>
  <br></br>
 <br></br>             <div className="doctor-actions">
                <button
                  type="button"
                  className="doctor-action-btn edit"
                  onClick={() => handleEditPatient(pat)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="doctor-action-btn delete"
                  onClick={() => handleDeletePatient(pat)}
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

export default AdminPatients;
