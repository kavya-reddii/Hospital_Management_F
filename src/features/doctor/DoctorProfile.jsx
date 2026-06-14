// src/features/doctor/DoctorProfile.jsx
import React, { useState, useEffect } from "react";
import DoctorNavbar from "./DoctorNavbar";
import "./DoctorProfile.css";

const DoctorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('current');
const [monthlyStats, setMonthlyStats] = useState({});

useEffect(() => {
  fetchMonthlyStats();
}, [selectedMonth]);

const fetchMonthlyStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `http://localhost:8081/api/doctor/profile/stats?month=${selectedMonth}`,
      { 
        headers: { Authorization: `Bearer ${token}` } 
      }
    );
    
    if (!response.ok) {
      console.error('HTTP error:', response.status);
      setMonthlyStats({ error: `HTTP ${response.status}` });
      return;
    }
    
    const text = await response.text();  // ✅ Get raw text first
    if (!text.trim()) {
      console.error('Empty response');
      setMonthlyStats({ error: 'Empty response' });
      return;
    }
    
    const data = JSON.parse(text);  // ✅ Safe parse
    setMonthlyStats(data);
    
  } catch (error) {
    console.error('Fetch error:', error);
    setMonthlyStats({ error: error.message });
  }
};


  useEffect(() => {
    fetch("http://localhost:8081/api/doctor/profile", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(res => res.json())
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!profile) return <div>No profile data</div>;

  return (
    <div className="dashboard-container">
      <DoctorNavbar />
      
      <div className="content-wrapper">
        

        <div className="cards-grid">
          {/* Profile Card */}
          <div className="card full-width">
            <div className="card-header">
              <h3>Profile Details</h3>
            </div>
            <div className="card-body profile-row">
              <div className="profile-pic">
                <img src={profile.profilePic || "/default-avatar.png"} alt="Profile" />
              </div>
              <div className="profile-details">
                <h2>{profile.name}</h2>
                <div className="specialty-badge">{profile.specialization}</div>
                <div className="stats-row">
                  <div className="stat-box">
                    <div className="stat-number">{profile.totalAppointments}</div>
                    <div className="stat-label">Appointments</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-number">{profile.totalPatients}</div>
                    <div className="stat-label">Patients</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-number">{profile.todayAppointments}</div>
                    <div className="stat-label">Today</div>
                  </div>
                </div>
                <div className="profile-info">
                  <div>{profile.department} • {profile.branch}</div>
                  <div>Joined on - {profile.joiningdate}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Graph Card */}
         <div className="card full-width">
  <div className="card-header">
    <h3>Appointments - Days 1-31</h3>
    <br></br>
    <select 
      value={selectedMonth} 
      onChange={(e) => setSelectedMonth(e.target.value)}
      className="month-select"
    >
      <option value="current">Current Month</option>
      <option value="2025-12">December 2025</option>
      <option value="2025-11">November 2025</option>
      <option value="2025-10">October 2025</option>
    </select>
  </div>
  <div className="card-body">
    <div className="appointments-graph">
  {Array.from({ length: monthlyStats.daysInMonth || 31 }, (_, i) => i + 1).map(day => {
    const count = monthlyStats.dailyAppointments?.[day] || 0;  // ✅ day NUMBER as key
    const maxHeight = 200;
     const barHeight = count === 0 ? 8 : Math.min(count * 25, maxHeight);
     
    return (
      <div key={day} className="bar-item">
        <div 
          className={`bar ${count > 5 ? 'high' : ''}`}
          style={{ height: `${barHeight}px` }}      // ✅ PROPORTIONAL HEIGHT
          data-count={count}                       // ✅ For CSS styling
          title={`${count} appointments on day ${day}`}
        >
          {count > 0 ? count : ''}
        </div>
        <div className="bar-date">{day}</div>
      </div>
    );
  })}
</div>

  </div>
</div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
