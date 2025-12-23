import React from 'react';
import HowItWorks from './HowItWorks';
import About from './About';
import ContactUs from './ContactUs';

const WhyChooseUs = () => {
  const features = [
    {
      icon: '⚙️',
      title: 'Real Industrial Experience',
      description:
        'Interns gain hands-on exposure to real manufacturing systems, safety processes, and operational workflows.'
    },
    {
      icon: '🧭',
      title: 'Mentorship from Experts',
      description:
        'Students are trained directly by skilled supervisors and industrial professionals.'
    },
    {
      icon: '🌱',
      title: 'Sustainable & Safe Practices',
      description:
        'We follow responsible manufacturing standards so interns learn industry-level safety and sustainability.'
    },
    {
      icon: '🔍',
      title: 'Transparent Learning Environment',
      description:
        'We keep workflows open so interns clearly understand machinery, logic, and execution.'
    }
  ];

  const visualImage =
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80';

  return (
    <section id="why" className="why-section">
      <div className="why-shell">
        <p className="why-eyebrow">Why Choose Us</p>
        <h2>
          <span className="why-heading-primary">Internships Tailored</span>{' '}
          <span className="why-heading-connector">for</span>{' '}
          <span className="why-heading-secondary">Industrial Mastery</span>
        </h2>
        <p className="why-intro">
          At HARI OM THALASSIC PVT. LTD., every internship is designed to feel like day one on the shop floor—modern
          tools, experienced mentors, and transparent processes that build confidence.
        </p>

        <div className="why-grid">
          <div className="why-column">
            {features.slice(0, 2).map((feature) => (
              <article key={feature.title} className="why-feature">
                <div className="why-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>

          <div className="why-center-visual">
            <div className="why-visual-card">
              <img src={visualImage} alt="Industrial mentorship" loading="lazy" />
              <div className="why-visual-badge">
                <span>HARI OM THALASSIC</span>
                <strong>Intern Cohort 2025</strong>
              </div>
            </div>
          </div>

          <div className="why-column">
            {features.slice(2).map((feature) => (
              <article key={feature.title} className="why-feature">
                <div className="why-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default function Sections({ onExploreMore }) {
  return (
    <>
      <WhyChooseUs />
      <section className="how-about-wrapper">
        <HowItWorks />
        <About onExploreMore={onExploreMore} />
      </section>
      <ContactUs />
    </>
  );
}
