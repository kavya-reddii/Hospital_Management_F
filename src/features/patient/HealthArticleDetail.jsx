import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import PatientNavbar from "./PatientNavbar";
import { getArticleBySlug } from "./healthLibraryData";
import "./HealthLibrary.css";

const doctorProfiles = [
  { name: "Dr. Arjun Reddy", dept: "Neurology", exp: "14 years" },
  { name: "Dr. Priya Menon", dept: "Internal Medicine", exp: "12 years" },
  { name: "Dr. Kavitha Sharma", dept: "Cardiology", exp: "16 years" }
];

const buildArticleSections = (title, categoryLabel) => ({
  overview: `${title} is a significant ${categoryLabel.toLowerCase()} topic. Early medical guidance, lifestyle management, and consistent follow-up improve patient outcomes.`,
  symptoms: [
    "Persistent or recurring discomfort in daily activities",
    "Fatigue, reduced tolerance, or unexplained changes",
    "Symptoms that affect sleep, appetite, or mobility",
    "Sudden worsening requiring immediate consultation"
  ],
  remedies: [
    "Follow clinician-approved diet and hydration plans",
    "Maintain regular physical activity based on tolerance",
    "Take medicines only as prescribed",
    "Track symptom progression and share during review visits"
  ],
  procedures: [
    "Initial specialist assessment and risk stratification",
    "Advanced diagnostics based on symptom profile",
    "Personalized treatment pathway and monitoring",
    "Long-term rehabilitation and preventive planning"
  ]
});

const HealthArticleDetail = () => {
  const { categoryKey, articleSlug } = useParams();
  const articleData = getArticleBySlug(categoryKey, articleSlug);
  if (!articleData) return <Navigate to="/patient/health-library" replace />;

  const { category, item } = articleData;
  const sections = buildArticleSections(item, category.label);

  return (
    <div className="health-library-page">
      <PatientNavbar />

      <section className="health-article-hero" style={{ backgroundImage: "url('/h5.jpeg')" }}>
        <div className="health-library-overlay" />
        <div className="health-library-hero-content">
          <p className="crumb">
            <Link to="/patient/health-library">Health Library</Link> /{" "}
            <Link to={`/patient/health-library/${category.key}`}>{category.label}</Link>
          </p>
          <h1>{item}</h1>
          <p>Symptoms, causes, treatments, procedures, and specialist support at HealthCare.</p>
        </div>
      </section>

      <div className="health-library-content article-layout">
        <div className="health-article-main">
          <div className="health-article-card">
            <h2>About {item}</h2>
            <p>{sections.overview}</p>
          </div>

          <div className="health-article-card">
            <h2>Common Symptoms</h2>
            <ul>
              {sections.symptoms.map((symptom) => (
                <li key={symptom}>{symptom}</li>
              ))}
            </ul>
          </div>

          <div className="health-article-card">
            <h2>Home Care & Remedies</h2>
            <ul>
              {sections.remedies.map((remedy) => (
                <li key={remedy}>{remedy}</li>
              ))}
            </ul>
          </div>

          <div className="health-article-card">
            <h2>Treatment Procedures</h2>
            <ul>
              {sections.procedures.map((procedure) => (
                <li key={procedure}>{procedure}</li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="health-article-side">
          <div className="health-article-card sticky">
            <h3>Doctors Available</h3>
            {doctorProfiles.map((doc) => (
              <div key={doc.name} className="doctor-item">
                <strong>{doc.name}</strong>
                <span>{doc.dept}</span>
                <small>{doc.exp}</small>
              </div>
            ))}
            <button className="primary-btn" onClick={() => (window.location.href = "/patient/doctors")}>
              View All Doctors
            </button>
          </div>

          <div className="health-article-card emergency">
            <h3>Need Immediate Help?</h3>
            <p>Talk to our emergency response and specialist desk.</p>
            <a href="tel:+911234567890">Call Us Now</a>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HealthArticleDetail;
