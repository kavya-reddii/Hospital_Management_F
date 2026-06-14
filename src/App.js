import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import PatientHome from './features/patient/PatientHome';
import DiscoverUs from './features/patient/DiscoverUs';
import HealthLibrary from './features/patient/HealthLibrary';
import HealthArticleDetail from './features/patient/HealthArticleDetail';
import DoctorHome from './features/doctor/DoctorHome';
import AdminHome from './features/admin/AdminHome';
import AdminDoctors from './features/admin/AdminDoctors';
import AdminPatients from './features/admin/AdminPatients';
import AdminAppointments from './features/admin/AdminAppointments';
import AdminAmbulances from './features/admin/AdminAmbulances';
import AdminPharmacy from './features/admin/AdminPharmacy';
import AdminReports from './features/admin/AdminReports';
import AdminSurgeries from './features/admin/AdminSurgeries';
import AdminInbox from './features/admin/AdminInbox';
import DoctorAppointments from './features/doctor/DoctorAppointments';
import DoctorPatients from './features/doctor/DoctorPatients';
import DoctorSurgeries from './features/doctor/DoctorSurgeries';
import DoctorProfile from './features/doctor/DoctorProfile';
import DoctorInbox from './features/doctor/DoctorInbox';
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/patient/dashboard" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientHome />
            </ProtectedRoute>
          } />
          <Route path="/patient/discover" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <DiscoverUs />
            </ProtectedRoute>
          } />
          <Route path="/patient/find-hospital" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientHome />
            </ProtectedRoute>
          } />
          <Route path="/patient/appointments" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientHome />
            </ProtectedRoute>
          } />
          <Route path="/patient/doctors" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientHome />
            </ProtectedRoute>
          } />
          <Route path="/patient/services" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientHome />
            </ProtectedRoute>
          } />
          <Route path="/patient/health-library" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <HealthLibrary />
            </ProtectedRoute>
          } />
          <Route path="/patient/health-library/:categoryKey" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <HealthLibrary />
            </ProtectedRoute>
          } />
          <Route path="/patient/health-library/:categoryKey/:articleSlug" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <HealthArticleDetail />
            </ProtectedRoute>
          } />
          <Route path="/patient/profile" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientHome />
            </ProtectedRoute>
          } />
          <Route path="/patient/inbox" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientHome />
            </ProtectedRoute>
          } />
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DoctorHome />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminHome />
            </ProtectedRoute>
          } />
        
<Route path="/admin/doctors" element={<AdminDoctors />} />
<Route path="/admin/patients" element={<AdminPatients />} />
<Route path="/admin/appointments" element={<AdminAppointments />} />
<Route path="/admin/ambulances" element={<AdminAmbulances />} />
<Route path="/admin/pharmacy" element={<AdminPharmacy />} />
<Route path="/admin/reports" element={<AdminReports />} />
<Route path="/admin/surgeries" element={<AdminSurgeries />} />
<Route path="/admin/inbox" element={<AdminInbox />} />
<Route path="/admin/inbox/:doctorUsername" element={<AdminInbox />} />


{/* <Route path="/patient/*" element={<PatientRoutes />}>
  <Route path="dashboard" element={<PatientDashboard />} />
  <Route path="discover" element={<DiscoverUs />} />
  <Route path="find-hospital" element={<FindHospital />} />
  <Route path="services" element={<MedicalServices />} />
  <Route path="health-library" element={<HealthLibrary />} />
  <Route path="profile" element={<PatientProfile />} />
  <Route path="inbox" element={<PatientInbox />} />
  <Route path="notifications" element={<Notifications />} />
</Route> */}


<Route path="/doctor/appointments" element={<DoctorAppointments />} />
<Route path="/doctor/patients" element={<DoctorPatients/>} />
<Route path="/doctor/surgeries" element={<DoctorSurgeries/>} />
<Route path="/doctor/profile" element={<DoctorProfile/>} />
<Route path="/doctor/inbox" element={<DoctorInbox />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/signup" element={<Signup />} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;
