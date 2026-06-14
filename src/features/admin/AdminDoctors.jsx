// src/features/admin/AdminDoctors.jsx
import React, { useState, useMemo, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import "./AdminDoctors.css";

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingDoctorId, setEditingDoctorId] = useState(null);

  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");

  const [newDoctor, setNewDoctor] = useState({
    name: "",
    doctorId: "",
    branch: "",
    department: "",
    place: "",
    joiningDate: "",
    username: "",
    password: "",
    profilePicFile: null,
    profilePicUrl: "/default_doctor.png",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const handleEditDoctor = (doc) => {
    setEditingDoctorId(doc.id);
    setNewDoctor({
      name: doc.fullname,
      doctorId: doc.doctorId,
      branch: doc.branch,
      department: doc.department,
      place: doc.place,
      joiningDate: doc.joiningDate || "",
      username: doc.username || "",
      password: "",
      profilePicFile: null,
      profilePicUrl: doc.profilePicBase64 || doc.profilePicUrl || "/default_doctor.png",
    });
    setErrors({});
    setServerError("");
    setIsAddOpen(true);
  };

  const handleDeleteDoctor = async (doc) => {
    if (!window.confirm(`Delete doctor ${doc.fullname}?`)) return;

    try {
      const res = await fetch(
        `http://localhost:8081/api/admin/doctor/${doc.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to delete doctor", res.status, text);
        alert("Failed to delete doctor");
        return;
      }

      setDoctors((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      console.error("Error deleting doctor", err);
      alert("Something went wrong while deleting");
    }
  };

  // Load doctors from backend
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await fetch("http://localhost:8081/api/admin/doctor", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) {
          console.error("Failed to load doctors", res.status);
          setLoading(false);
          return;
        }
        const data = await res.json();
        const mapped = data.map((d) => ({
          ...d,
          profilePicUrl: d.profilePicBase64 || d.profilePicUrl || "/default_doctor.png",
        }));
        setDoctors(mapped);
      } catch (err) {
        console.error("Error loading doctors", err);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const toggleFilter = () => setIsFilterOpen((prev) => !prev);
  const toggleAdd = () => {
    setErrors({});
    setServerError("");
    setIsAddOpen((prev) => !prev);
    if (!isAddOpen) {
      setEditingDoctorId(null);
      setNewDoctor({
        name: "",
        doctorId: "",
        branch: "",
        department: "",
        place: "",
        joiningDate: "",
        username: "",
        password: "",
        profilePicFile: null,
        profilePicUrl: "/default_doctor.png",
      });
    }
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const text = (doc.fullname + " " + doc.department).toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesDept = selectedDepartment
        ? doc.department === selectedDepartment
        : true;
      const matchesPlace = selectedPlace ? doc.place === selectedPlace : true;
      return matchesSearch && matchesDept && matchesPlace;
    });
  }, [doctors, search, selectedDepartment, selectedPlace]);

  const departments = Array.from(new Set(doctors.map((d) => d.department)));
  const places = Array.from(new Set(doctors.map((d) => d.place)));

  const handleNewDoctorChange = (e) => {
    const { name, value } = e.target;
    setNewDoctor((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !newDoctor.doctorId.trim()) {
      alert("Please enter Doctor ID first");
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
    formData.append("doctorId", newDoctor.doctorId.trim());

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8081/api/admin/doctor/upload-profile-pic",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (response.ok) {
        const backendBase64 = await response.text();
        setNewDoctor((prev) => ({
          ...prev,
          profilePicFile: file,
          profilePicUrl: backendBase64,
        }));
      } else {
        // fallback: local base64
        const reader = new FileReader();
        reader.onload = (evt) => {
          const base64Image = evt.target.result;
          setNewDoctor((prev) => ({
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
        setNewDoctor((prev) => ({
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
    return pwd.length >= 8 && hasUpper && hasLower && hasDigit && hasSpecial;
  };

  const validateNewDoctor = () => {
    const errs = {};

    const name = newDoctor.name.trim();
    if (!name) {
      errs.name = "Name is required";
    } else {
      const words = name.split(" ").filter(Boolean);
      const allCapitalized = words.every((w) => w[0] === w[0]?.toUpperCase());
      if (!allCapitalized) {
        errs.name = "Each word should start with a capital letter";
      }
    }

    const id = newDoctor.doctorId.trim();
    if (!id) {
      errs.doctorId = "ID number is required";
    } else if (!/^\d{7}$/.test(id)) {
      errs.doctorId = "ID must be exactly 7 digits";
    }

    if (!newDoctor.branch.trim()) errs.branch = "Branch is required";
    if (!newDoctor.department.trim())
      errs.department = "Department is required";
    if (!newDoctor.place.trim()) errs.place = "Place is required";
    if (!newDoctor.joiningDate) errs.joiningDate = "Joining date is required";

    const username = newDoctor.username.trim();
    if (!username) {
      errs.username = "Username is required";
    } else if (username.length < 4) {
      errs.username = "Username must be at least 4 characters";
    }

    const password = newDoctor.password.trim();
    if (!editingDoctorId) {
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

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    const errs = validateNewDoctor();
    setErrors(errs);
    setServerError("");
    if (Object.keys(errs).length > 0) {
      console.log("Validation failed", errs);
      return;
    }

    try {
      const isEdit = editingDoctorId !== null;
      const url = isEdit
        ? `http://localhost:8081/api/admin/doctor/${editingDoctorId}`
        : "http://localhost:8081/api/admin/doctor";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        name: newDoctor.name.trim(),
        doctorId: newDoctor.doctorId.trim(),
        branch: newDoctor.branch.trim(),
        department: newDoctor.department.trim(),
        place: newDoctor.place.trim(),
        joiningDate: newDoctor.joiningDate,
        username: newDoctor.username.trim(),
        profilePicBase64: newDoctor.profilePicUrl || "",
      };

      if (!isEdit || newDoctor.password.trim()) {
        payload.password = newDoctor.password.trim();
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
        console.error("Failed to create doctor", response.status, text);

        if (
          response.status === 400 &&
          text.toLowerCase().includes("username")
        ) {
          setErrors((prev) => ({
            ...prev,
            username: "Username already exists",
          }));
        } else if (
          response.status === 400 &&
          text.toLowerCase().includes("doctor id")
        ) {
          setErrors((prev) => ({
            ...prev,
            doctorId: "Doctor ID already exists",
          }));
        } else {
          setServerError("Failed to create doctor. Please try again.");
        }
        return;
      }

      const savedDoctor = await response.json();

      if (isEdit) {
        setDoctors((prev) =>
          prev.map((d) =>
            d.id === savedDoctor.id
              ? {
                  ...savedDoctor,
                  profilePicUrl:
                    savedDoctor.profilePicBase64 ||
                    newDoctor.profilePicUrl ||
                    d.profilePicUrl ||
                    "/default_doctor.png",
                }
              : d
          )
        );
      } else {
        setDoctors((prev) => [
          ...prev,
          {
            ...savedDoctor,
            profilePicUrl:
              savedDoctor.profilePicBase64 ||
              newDoctor.profilePicUrl ||
              "/default_doctor.png",
          },
        ]);
      }

      setNewDoctor({
        name: "",
        doctorId: "",
        branch: "",
        department: "",
        place: "",
        joiningDate: "",
        username: "",
        password: "",
        profilePicFile: null,
        profilePicUrl: "/default_doctor.png",
      });
      setEditingDoctorId(null);
      setErrors({});
      setServerError("");
      setIsAddOpen(false);
    } catch (err) {
      console.error("Error creating doctor", err);
      setServerError("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="admin-doctors-page">
        <AdminNavbar />
        <p style={{ padding: "1.5rem 2rem" }}>Loading doctors...</p>
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
          placeholder="Search by name or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="filter-button" onClick={toggleFilter}>
          Filters
        </button>

        <button className="add-doctor-button" onClick={toggleAdd}>
          + Add doctor
        </button>
      </div>

      {isFilterOpen && (
        <div className="filter-modal">
          <div className="filter-card">
            <div className="filter-header">
              <h3>Filter doctors</h3>
              <button className="filter-close" onClick={toggleFilter}>
                ×
              </button>
            </div>

            <div className="filter-body">
              <div className="filter-group">
                <label>Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="">All</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Place</label>
                <select
                  value={selectedPlace}
                  onChange={(e) => setSelectedPlace(e.target.value)}
                >
                  <option value="">All</option>
                  {places.map((place) => (
                    <option key={place} value={place}>
                      {place}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-footer">
              <button
                className="filter-clear"
                onClick={() => {
                  setSelectedDepartment("");
                  setSelectedPlace("");
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
              <h2>{editingDoctorId ? "Edit Doctor" : "Add Doctor"}</h2>
              <button className="add-doctor-close" onClick={toggleAdd}>
                ×
              </button>
            </div>

            <form className="add-doctor-form" onSubmit={handleAddDoctor}>
              {serverError && (
                <p className="error-text" style={{ marginBottom: "0.75rem" }}>
                  {serverError}
                </p>
              )}

              <div className="add-doctor-body">
                <div className="add-doctor-column">
                  <div className="add-field">
                    <label>Full name *</label>
                    <input
                      type="text"
                      name="name"
                      value={newDoctor.name}
                      onChange={handleNewDoctorChange}
                    />
                    {errors.name && (
                      <p className="error-text">{errors.name}</p>
                    )}
                  </div>

                  <div className="add-field">
                    <label>ID No. (7 digits) *</label>
                    <input
                      type="text"
                      name="doctorId"
                      value={newDoctor.doctorId}
                      onChange={handleNewDoctorChange}
                    />
                    {errors.doctorId && (
                      <p className="error-text">{errors.doctorId}</p>
                    )}
                  </div>

                  <div className="add-field">
                    <label>Branch *</label>
                    <input
                      type="text"
                      name="branch"
                      value={newDoctor.branch}
                      onChange={handleNewDoctorChange}
                    />
                    {errors.branch && (
                      <p className="error-text">{errors.branch}</p>
                    )}
                  </div>

                  <div className="add-field">
                    <label>Department *</label>
                    <input
                      type="text"
                      name="department"
                      value={newDoctor.department}
                      onChange={handleNewDoctorChange}
                    />
                    {errors.department && (
                      <p className="error-text">{errors.department}</p>
                    )}
                  </div>
                </div>

                <div className="add-doctor-column">
                  <div className="add-field">
                    <label>Place *</label>
                    <input
                      type="text"
                      name="place"
                      value={newDoctor.place}
                      onChange={handleNewDoctorChange}
                    />
                    {errors.place && (
                      <p className="error-text">{errors.place}</p>
                    )}
                  </div>

                  <div className="add-field">
                    <label>Joining date *</label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={newDoctor.joiningDate}
                      onChange={handleNewDoctorChange}
                    />
                    {errors.joiningDate && (
                      <p className="error-text">{errors.joiningDate}</p>
                    )}
                  </div>

                  <div className="add-field">
                    <label>Username for login *</label>
                    <input
                      type="text"
                      name="username"
                      value={newDoctor.username}
                      onChange={handleNewDoctorChange}
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
                      value={newDoctor.password}
                      onChange={handleNewDoctorChange}
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
                  {editingDoctorId ? "Save changes" : "Add doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="doctor-grid">
        {filteredDoctors.map((doc) => (
          <div key={doc.id} className="doctor-card">
            <div className="doctor-avatar">
              <img
                src={doc.profilePicUrl || "/default_doctor.png"}
                alt={doc.fullname}
              />
            </div>
            <div className="doctor-info">
              <h4>{doc.fullname}</h4>
              <p className="doctor-dept">{doc.department}</p>
              <p className="doctor-place">
                {doc.branch} • {doc.place}
              </p>
             <br></br><br></br>
              <div className="doctor-actions">
                <button
                  type="button"
                  className="doctor-action-btn edit"
                  onClick={() => handleEditDoctor(doc)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="doctor-action-btn delete"
                  onClick={() => handleDeleteDoctor(doc)}
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

export default AdminDoctors;
