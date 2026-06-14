import React from "react";
import { Link, useParams } from "react-router-dom";
import PatientNavbar from "./PatientNavbar";
import { getCategoryByKey, healthLibraryCategories, slugify } from "./healthLibraryData";
import "./HealthLibrary.css";

const HealthLibrary = () => {
  const { categoryKey } = useParams();
  const activeCategory = getCategoryByKey(categoryKey) || healthLibraryCategories[0];

  return (
    <div className="health-library-page">
      <PatientNavbar />

      <section className="health-library-hero" style={{ backgroundImage: "url('/h4.jpeg')" }}>
        <div className="health-library-overlay" />
        <div className="health-library-hero-content">
          <h1>Health Library</h1>
          <p>Patient-friendly medical knowledge, guides, and treatment insights.</p>
        </div>
      </section>

      <div className="health-library-content">
        <div className="health-library-tabs">
          {healthLibraryCategories.map((category) => (
            <Link
              key={category.key}
              to={`/patient/health-library/${category.key}`}
              className={`health-tab ${category.key === activeCategory.key ? "active" : ""}`}
            >
              {category.label}
            </Link>
          ))}
        </div>

        <div className="health-library-card">
          <div className="health-library-card-header">
            <h2>{activeCategory.label}</h2>
            <span>{activeCategory.items.length} topics</span>
          </div>
          <div className="health-library-grid">
            {activeCategory.items.map((item) => (
              <Link
                key={item}
                className="health-library-item"
                to={`/patient/health-library/${activeCategory.key}/${slugify(item)}`}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthLibrary;
