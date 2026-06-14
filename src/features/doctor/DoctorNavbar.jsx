import React, { useState, useEffect } from "react";  // ✅ FIXED: Added useEffect
import "./DoctorNavbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";

const DoctorNavbar = () => {
   const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [notificationsList, setNotificationsList] = useState([]);  // ✅ FIXED: Missing state

  // ✅ FIXED: fetchNotifications function + useEffect
  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleBellClick = async () => {
  const willOpen = !showNotifications;
  setShowNotifications(willOpen);

  // If opening now → mark all as read
  if (willOpen && notifications > 0) {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:8081/api/doctor/notifications/mark-all-read", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      // ✅ Clear badge locally
      setNotifications(0);
      // Optionally update list
      setNotificationsList(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (e) {
      console.error("Mark all read failed", e);
    }
  }
};


  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8081/api/doctor/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setNotificationsList(data);
      setNotifications(data.filter(n => !n.read).length);
    } catch (error) {
      console.error("Notifications fetch error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  

  const toggleNotifications = () => setShowNotifications(prev => !prev);
  const toggleDropdown = () => setShowDropdown(prev => !prev);

  return (
    <>
      <nav className="admin-navbar">
        {/* LEFT: Logo */}
        <div className="admin-navbar-left">
          <span className="hospital-name">HealthCare</span>
        </div>

        {/* CENTER: Navigation Items */}
        <div className="admin-navbar-center">
          <NavLink
            to="/doctor/dashboard"
            end
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/doctor/appointments"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Appointments
          </NavLink>

          <NavLink
            to="/doctor/patients"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Patients
          </NavLink>

          <NavLink
            to="/doctor/surgeries"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Surgeries
          </NavLink>
        </div>

        {/* RIGHT: Action Buttons */}
        <div className="admin-navbar-right">
          {/* Bell Notification Button */}
          <button className="notification-button" onClick={handleBellClick}>
            <FaBell />
            {notifications > 0 && <span className="notification-badge">{notifications+1}</span>}
          </button>

          {/* Hamburger Dropdown */}
          <div className="dropdown-container">
            <button className="toggle-button" onClick={toggleDropdown}>
              ☰
            </button>

            {showDropdown && (
              <div className="dropdown-menu">
                <NavLink
                  to="/doctor/profile"
                  className="dropdown-item"
                  onClick={() => setShowDropdown(false)}
                >
                  Profile
                </NavLink>
                <button
    className="dropdown-item inbox-trigger"
    onClick={() => {
      setShowDropdown(false);
      navigate("/doctor/inbox");
    }}
  >
    Inbox
  </button>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="notification-dropdown">
          {notificationsList.length === 0 ? (
            <div className="no-notifications">
              No new notifications
            </div>
          ) : (
            notificationsList.map(notif => (
              <div key={notif.id} className="notification-item">
                <strong>{notif.title}</strong>
                <p>{notif.message}</p>
                <small>{new Date(notif.createdAt).toLocaleString()}</small>
                {!notif.read && <span className="unread-dot"></span>}
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
};

export default DoctorNavbar;
