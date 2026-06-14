import React, { useState, useEffect } from "react";
import "../doctor/DoctorNavbar.css";
import "./PatientNavbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { healthLibraryCategories, slugify } from "./healthLibraryData";

const PatientNavbar = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHealthLibrary, setShowHealthLibrary] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [notificationsList, setNotificationsList] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleBellClick = async () => {
    const willOpen = !showNotifications;
    setShowNotifications(willOpen);

    if (willOpen && notifications > 0) {
      try {
        const token = localStorage.getItem("token");
        await fetch("http://localhost:8081/api/patient/notifications/mark-all-read", {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(0);
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
      const response = await fetch("http://localhost:8081/api/patient/notifications", {
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
      <nav className="admin-navbar">  {/* SAME CSS CLASS */}
        {/* LEFT: Hospital Navigation (Apollo-style) */}
       <div className="admin-navbar-left">
  <NavLink to="/patient/discover" className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}>
    Discover Us
  </NavLink>
  <NavLink to="/patient/find-hospital" className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}>
    Find Hospital
  </NavLink>
  <NavLink to="/patient/dashboard" className="hospital-name nav-brand-link">
    HealthCare
  </NavLink>
</div>


        {/* CENTER: Patient Navigation */}
        <div className="admin-navbar-center">
         

          <NavLink
            to="/patient/appointments"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            My Appointments
          </NavLink>

          <NavLink
            to="/patient/doctors"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Doctors
          </NavLink>

          <NavLink
            to="/patient/services"
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            Services
          </NavLink>

          <div
            className="health-library-mega"
            onMouseEnter={() => setShowHealthLibrary(true)}
            onMouseLeave={() => setShowHealthLibrary(false)}
          >
            <NavLink
              to="/patient/health-library"
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""}`
              }
            >
              Health Library
            </NavLink>
            {showHealthLibrary && (
              <div className="health-library-dropdown">
                <div className="health-library-dropdown-grid">
                  {healthLibraryCategories.map((category) => (
                    <div key={category.key} className="health-library-dropdown-col">
                      <h4>{category.label}</h4>
                      {category.items.slice(0, 10).map((item) => (
                        <NavLink
                          key={`${category.key}-${item}`}
                          to={`/patient/health-library/${category.key}/${slugify(item)}`}
                        >
                          {item}
                        </NavLink>
                      ))}
                      <NavLink className="view-all-link" to={`/patient/health-library/${category.key}`}>
                        View All
                      </NavLink>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Actions (EXACT same as DoctorNavbar) */}
        <div className="admin-navbar-right">
          {/* Bell Notification Button */}
          <button className="notification-button" onClick={handleBellClick}>
            <FaBell />
            {notifications > 0 && <span className="notification-badge">{notifications}</span>}
          </button>

          {/* Hamburger Dropdown */}
          <div className="dropdown-container">
            <button className="toggle-button" onClick={toggleDropdown}>
              ☰
            </button>

            {showDropdown && (
              <div className="dropdown-menu">
                <NavLink
                  to="/patient/profile"
                  className="dropdown-item"
                  onClick={() => setShowDropdown(false)}
                >
                  Profile
                </NavLink>
                <button
                  className="dropdown-item inbox-trigger"
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/patient/inbox");
                  }}
                >
                  Inbox
                </button>
                <NavLink
                  to="/patient/find-hospital"
                  className="dropdown-item"
                  onClick={() => setShowDropdown(false)}
                >
                  Book Appointment
                </NavLink>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Notifications Modal - EXACT same as DoctorNavbar */}
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

export default PatientNavbar;
