import React, { useMemo, useState } from "react";
import PatientNavbar from "./PatientNavbar";
import { NavLink, useNavigate } from "react-router-dom";
import "./PatientHome.css";

const PatientHome = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);

  const heroSlides = [
    { image: "/h1.jpg", title: "The Future of Healthcare, Today", subtitle: "Book world-class treatment across specialties with expert doctors." },
    { image: "/h2.jpg", title: "Advanced Diagnostics and Personalized Care", subtitle: "Fast appointments, digital records, and seamless follow-up support." },
    { image: "/h3.jpg", title: "Compassion First. Clinical Excellence Always.", subtitle: "Patient-first services from consultation to recovery." }
  ];

  const specialties = [
    { name: "Cardiology", route: "/patient/services", description: "Heart care from preventive checkups to complex procedures." },
    { name: "Neurology", route: "/patient/services", description: "Comprehensive treatment for brain and spine conditions." },
    { name: "Orthopedics", route: "/patient/services", description: "Joint, bone, and sports injury management programs." },
    { name: "Oncology", route: "/patient/services", description: "Integrated cancer screening, diagnosis, and treatment care." },
    { name: "Pediatrics", route: "/patient/services", description: "Child-focused care plans from newborn to adolescence." },
    { name: "Gastroenterology", route: "/patient/services", description: "Digestive health with minimally invasive procedures." }
  ];

  const hospitalLocations = [
    { city: "Chennai", branch: "HealthCare Main Campus", eta: "15 min" },
    { city: "Hyderabad", branch: "HealthCare Jubilee Hills", eta: "18 min" },
    { city: "Bengaluru", branch: "HealthCare Whitefield", eta: "12 min" },
    { city: "Mumbai", branch: "HealthCare Navi Mumbai", eta: "20 min" },
    { city: "Delhi", branch: "HealthCare Dwarka", eta: "17 min" }
  ];

  const healthArticles = [
    { title: "Parkinson's Disease - Symptoms, Causes, and Treatment", route: "/patient/health-library/diseases-and-conditions/parkinsons-disease" },
    { title: "Hypertension (High Blood Pressure) - Patient Guide", route: "/patient/health-library/diseases-and-conditions/hypertension-high-blood-pressure" },
    { title: "MRI (Magnetic Resonance Imaging) - When and Why", route: "/patient/health-library/diagnostics-and-tests/mri-magnetic-resonance-imaging" }
  ];

  const faqs = [
    { q: "How can I book an appointment?", a: "Use Find Hospital, select your location, and continue with Book Appointment." },
    { q: "Can I view all my previous consultations?", a: "Yes. Go to My Appointments to review upcoming and completed visits." },
    { q: "Where can I message my care team?", a: "Open Inbox from the top-right menu to continue your conversations." }
  ];

  const filteredLocations = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();
    if (!value) return hospitalLocations;
    return hospitalLocations.filter((item) =>
      item.city.toLowerCase().includes(value) || item.branch.toLowerCase().includes(value)
    );
  }, [searchTerm]);

  return (
    <div className="patient-home-page">
      <PatientNavbar />

      <section className="patient-home-carousel">
        <div className="patient-carousel-track">
          {heroSlides.map((slide, index) => (
            <div
              key={`${slide.title}-${index}`}
              className="patient-carousel-slide"
              style={{ backgroundImage: `url('${slide.image}')` }}
            >
              <div className="patient-slide-overlay" />
              <div className="patient-slide-content">
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <div className="patient-slide-actions">
                  <button onClick={() => navigate("/patient/find-hospital")}>Book Appointment</button>
                  <button className="secondary" onClick={() => navigate("/patient/doctors")}>Find Doctors</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="patient-video-strip">
        <div className="patient-content">
          <div className="patient-video-card">
            <div>
              <h2>A New Era of Patient Care</h2>
              <p>
                Explore modern treatment facilities, specialized departments, and
                compassionate care designed for faster recovery and better outcomes.
              </p>
            </div>
            <div className="patient-video-wrap">
              <iframe
                title="Patient care video"
                src="https://www.youtube.com/embed/hTWKbfoikeg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <section className="patient-content">
        <div className="patient-section-heading">
          <h2>Centers of Excellence</h2>
          <p>Choose from specialized care units based on your needs.</p>
        </div>
        <div className="patient-grid">
          {specialties.map((item) => (
            <button key={item.name} className="patient-card specialty-card" onClick={() => navigate(item.route)}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="patient-content patient-section-gap">
        <div className="patient-grid two-col">
          <div className="patient-card">
            <h3>Find a Hospital Near You</h3>
            <input
              className="patient-search-input"
              placeholder="Search city or branch"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="patient-location-list">
              {filteredLocations.length === 0 && <p className="muted">No locations found.</p>}
              {filteredLocations.map((item) => (
                <div className="patient-row" key={`${item.city}-${item.branch}`}>
                  <strong>{item.branch}</strong>
                  <span>{item.city} - Avg wait time {item.eta}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/patient/find-hospital")}>Go to Find Hospital</button>
          </div>

          <div className="patient-card">
            <h3>Quick Actions</h3>
            <NavLink to="/patient/appointments" className="patient-row quick-link">
              <strong>My Appointments</strong>
              <span>View upcoming and completed appointments.</span>
            </NavLink>
            <NavLink to="/patient/doctors" className="patient-row quick-link">
              <strong>Find Doctors</strong>
              <span>Browse specialists and choose your consultant.</span>
            </NavLink>
            <NavLink to="/patient/profile" className="patient-row quick-link">
              <strong>My Profile</strong>
              <span>Manage your patient details and preferences.</span>
            </NavLink>
            <NavLink to="/patient/inbox" className="patient-row quick-link">
              <strong>Inbox</strong>
              <span>Talk to your care team and receive updates.</span>
            </NavLink>
          </div>
        </div>
      </section>

      <section className="patient-content patient-section-gap">
        <div className="patient-section-heading">
          <h2>Health Library</h2>
          <p>Read practical guidance from trusted clinical teams.</p>
        </div>
        <div className="patient-grid">
          {healthArticles.map((article) => (
            <button key={article.title} className="patient-card article-card" onClick={() => navigate(article.route)}>
              <h3>{article.title}</h3>
              <p>Read article</p>
            </button>
          ))}
        </div>
      </section>

      <section className="patient-content patient-section-gap">
        <div className="patient-grid two-col">
          <div className="patient-card emergency-card">
            <h3>24/7 Emergency and Ambulance</h3>
            <p>Immediate response for critical care and emergency transport support.</p>
            <div className="emergency-actions">
              <a href="tel:+911234567890">Call Emergency</a>
              <button onClick={() => navigate("/patient/find-hospital")}>Nearest Emergency Unit</button>
            </div>
          </div>

          <div className="patient-card">
            <h3>Frequently Asked Questions</h3>
            {faqs.map((item, index) => (
              <button
                key={item.q}
                className="faq-item"
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
              >
                <div className="faq-question">{item.q}</div>
                {activeFaq === index && <p>{item.a}</p>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="patient-home-footer">
        <div className="patient-content">
          <p>HealthCare - Compassion, Innovation, and Trusted Outcomes.</p>
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
