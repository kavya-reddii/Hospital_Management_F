import React, { useState } from "react";
import "./AdminNavbar.css";
import { NavLink, useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showInbox, setShowInbox] = useState(false);
  const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");  // if you store role
  window.location.href = "/login";  // or use navigate if using React Router
};


  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // later: navigate or change content based on tab
  };

   const openInbox = () => {
    navigate("/admin/inbox");
  };

  const toggleInbox = () => setShowInbox(prev => !prev);

  return (
    <>
      <nav className="admin-navbar">
        <div className="admin-navbar-left">
          <span className="hospital-name">HealthCare</span>

    <NavLink
  to="/admin/dashboard"
  end
  className={({ isActive }) =>
    `nav-link ${isActive ? "nav-link-active" : ""}`
  }
>
  Home
</NavLink>


         <NavLink
  to="/admin/doctors"
  className={({ isActive }) =>
    `nav-link ${isActive ? "nav-link-active" : ""}`
  }
>
  Doctors
</NavLink>


         <NavLink
  to="/admin/patients"
  className={({ isActive }) =>
    `nav-link ${isActive ? "nav-link-active" : ""}`
  }
>
  Patients
</NavLink>

 <NavLink
  to="/admin/appointments"
  className={({ isActive }) =>
    `nav-link ${isActive ? "nav-link-active" : ""}`
  }
>
  Appointments
</NavLink>
         
          
         
           <NavLink
  to="/admin/ambulances"
  className={({ isActive }) =>
    `nav-link ${isActive ? "nav-link-active" : ""}`
  }
>
  Ambulance Services
</NavLink>
          
           <NavLink
  to="/admin/pharmacy"
  className={({ isActive }) =>
    `nav-link ${isActive ? "nav-link-active" : ""}`
  }
>
  Pharmacy Services
</NavLink>

 <NavLink
  to="/admin/surgeries"
  className={({ isActive }) =>
    `nav-link ${isActive ? "nav-link-active" : ""}`
  }
>
  Surgeries
</NavLink>
                 <NavLink
  to="/admin/reports"
  className={({ isActive }) =>
    `nav-link ${isActive ? "nav-link-active" : ""}`
  }
>
  Reports
</NavLink>
          
        </div>

        <div className="admin-navbar-right">
          <button className="inbox-button" onClick={openInbox}>
            Inbox
          </button>
<div className="admin-nav-right">
  <button 
    className="logout-btn"
    onClick={handleLogout}
  >
    Logout
  </button>
</div>

        </div>
      </nav>

      {showInbox && (
        <div className="inbox-modal">
          <div className="inbox-header">
            <h3>Inbox / Complaints</h3>
            <button className="inbox-close" onClick={toggleInbox}>×</button>
          </div>
          <div className="inbox-body">
            <p>No complaints loaded yet.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNavbar;
