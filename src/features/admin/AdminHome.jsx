import React from "react";
import AdminNavbar from "./AdminNavbar";
import "./AdminHome.css";
import { useTypewriter } from "../../hooks/useTypewriter";

const AdminHome = () => {
  const description = useTypewriter("  What do you like to do today !!!", 70);

  return (
    <div className="admin-home-page">
      <AdminNavbar />
      <div
        className="admin-hero"
        style={{ backgroundImage: "url('/admin_bg.jpg')" }}
      >
        <div className="admin-hero-content">
          <h1 className="admin-hero-title">Hello Admin</h1>
          <h3 className="admin-hero-subtitle">{description}</h3>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
