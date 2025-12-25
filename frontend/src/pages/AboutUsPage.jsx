import React from 'react'
import heroImage from '../assets/image1.jpg'
import industryImage from '../assets/image2.jpg'
import galleryImage1 from '../assets/image3.jpg'
import galleryImage2 from '../assets/image4.jpg'
import galleryImage3 from '../assets/image5.jpg'

const HERO_IMG = heroImage
const INDUSTRY_IMG = industryImage
const GALLERY_IMGS = [
  galleryImage1,
  galleryImage2,
  galleryImage3
]

export default function AboutUsPage() {
  const stats = [
    { label: 'Years of Industrial Experience', value: '10+' },
    { label: 'Projects Completed', value: '200+' },
    { label: 'Skilled Interns Trained', value: '150+' },
    { label: 'Operational Units', value: '5' }
  ]

  return (
    <main className="aboutus-page" id="about-us">
      {/* Section 1 */}
      <section className="aboutus-hero container">
        <div className="hero-text">
          <p className="breadcrumb">Home <span>&gt;</span> About Us</p>
          <h1>About Us</h1>
          <p className="hero-lead">
            HARI OM THALASSIC PVT. LTD. is a rapidly growing organization known for its commitment to innovation,
            quality processes, and operational excellence. Our internship program is designed to help young talents
            gain real-world industrial experience through hands-on exposure and mentorship.
          </p>
        </div>
        <div className="hero-media">
          <div className="accent-shape" />
          <img src={HERO_IMG} alt="Industrial operations" loading="lazy" />
        </div>
      </section>

      {/* Section 2 */}
      <section className="aboutus-excellence">
        <div className="container excellence-grid">
          <div className="excellence-left">
            <p className="eyebrow">Internship Focus</p>
            <h2>
              Excellence in <span>Industrial Operations</span>
            </h2>
            <p className="subtext">
              We believe in precision, discipline, and constant improvement. Interns at HARI OM THALASSIC gain
              exposure to real operational workflows, quality control processes, and modern industrial standards.
            </p>
          </div>
          <div className="excellence-right">
            <p>
              Our structured training approach allows interns to understand ground-level operations, modern machinery
              handling, and teamwork in a professional environment. We ensure every intern experiences hands-on
              learning that builds confidence and practical skills.
            </p>
            <div className="gallery-row">
              {GALLERY_IMGS.map((src, idx) => (
                <div className="gallery-card" key={src + idx}>
                  <img src={src} alt="Internship experience" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="aboutus-technology">
        <div className="container tech-grid">
          <div className="tech-media">
            <img src={INDUSTRY_IMG} alt="Modern industrial technology" loading="lazy" />
          </div>
          <div className="tech-content">
            <p className="eyebrow">Technology & Training</p>
            <h3>
              Using Modern <span>Industrial Technology</span>
            </h3>
            <p>
              At HARI OM THALASSIC, interns learn using the latest equipment, modern workflows, and updated safety
              standards. Our mentors ensure that students understand not just how to operate machines, but also the
              logic, safety protocols, and efficiency behind each process.
            </p>
            <button className="btn btn-outline">
              Apply Now
            </button>
            <div className="stats-grid">
              {stats.map((stat) => (
                <article key={stat.label} className="stat-card">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
