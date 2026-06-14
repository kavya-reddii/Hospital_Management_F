import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="dashboard">
      <div className="header">
        <h1>Admin Dashboard</h1>
        <div className="stats">
          <div className="stat">
            <h3>Total Doctors</h3>
            <p>24 Active</p>
          </div>
          <div className="stat">
            <h3>Total Patients</h3>
            <p>1,247</p>
          </div>
          <div className="stat">
            <h3>Today's Appointments</h3>
            <p>89 Booked</p>
          </div>
        </div>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Manage Doctors</h3>
          <p>Add/delete doctors, attendance, leaves</p>
          <button>Doctor Management</button>
        </div>
        <div className="card">
          <h3>Patient Management</h3>
          <p>View all patients data</p>
          <button>View Patients</button>
        </div>
        <div className="card">
          <h3>All Appointments</h3>
          <p>Overview and analytics</p>
          <button>Appointments</button>
        </div>
        <div className="card">
          <h3>Analytics & Reports</h3>
          <p>Hospital performance metrics</p>
          <button>View Reports</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
