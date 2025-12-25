import React from 'react'

const IMG_A = new URL('../assets/logo2.jpg', import.meta.url).href
const IMG_B = new URL('../assets/logo3.jpg', import.meta.url).href

export default function About({ onExploreMore }) {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-grid">
          <div className="about-images">
            <div className="about-img about-img-primary">
              <img src={IMG_A} alt="Team collaboration" loading="lazy" />
            </div>
            <div className="about-img about-img-secondary">
              <img src={IMG_B} alt="Project building" loading="lazy" />
            </div>
          </div>

          <div className="about-content">
            <h2>About Us</h2>
            <p className="about-subtext">
              We are an independent organization committed to shaping industry-ready talent through structured internship experiences. We personally guide each intern with real work, professional standards, and mentorship — ensuring they develop the practical abilities companies actually hire for.

            </p>
            <ul className="about-points">
              <li>Direct mentorship — personalized support, guidance & feedback  </li>
              <li>Real industry-style tasks — not dummy assignments or theory</li>
              <li>Practical skill-building — so your portfolio and confidence grow together  </li>
            </ul>
          <div className="about-cta">
            <button
              className="btn btn-primary"
              onClick={() => onExploreMore ? onExploreMore() : window.open('/about-us', '_self')}
            >
              Explore More
            </button>
          </div>

          </div>
        </div>
      </div>
    </section>
  )
}
