import React, { useEffect, useState } from "react";
import PatientNavbar from "./PatientNavbar";
import "./DiscoverUs.css";

const API_URL = "http://localhost:8081/api/patient/discover";

const DiscoverUs = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadDiscover = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const response = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error("Unable to load Discover Us.");
        }

        const result = await response.json();
        setData(result);
      } catch (e) {
        setError(e.message || "Unable to load Discover Us.");
      } finally {
        setLoading(false);
      }
    };

    loadDiscover();
  }, []);

  return (
    <div className="discover-page">
      <PatientNavbar />

      <section
        className="discover-hero"
        style={{ backgroundImage: `url(${data?.heroImage || "/admin_bg.jpg"})` }}
      >
        <div className="discover-overlay" />
        <div className="discover-hero-content">
          <h1>{data?.heroTitle || "Discover World-Class Healthcare"}</h1>
          <p>
            {data?.heroSubtitle ||
              "Advanced treatment, experienced doctors, and trusted patient outcomes."}
          </p>
        </div>
      </section>

      <main className="discover-main">
        {loading && <p className="discover-status">Loading...</p>}
        {error && <p className="discover-status error">{error}</p>}

        {!loading && !error && data && (
          <>
            <section className="discover-section">
              <h2>Centers of Excellence</h2>
              <div className="discover-grid">
                {data.centersOfExcellence?.map((item, index) => (
                  <article className="discover-card" key={`${item.title}-${index}`}>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="discover-section">
              <h2>Why Patients Choose Us</h2>
              <div className="discover-grid stats">
                {data.highlights?.map((item, index) => (
                  <article className="discover-card stat" key={`${item.label}-${index}`}>
                    <h3>{item.value}</h3>
                    <p>{item.label}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="discover-section">
              <h2>Care Journey</h2>
              <div className="discover-grid">
                {data.careJourney?.map((item, index) => (
                  <article className="discover-card" key={`${item.step}-${index}`}>
                    <h3>{item.step}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default DiscoverUs;
