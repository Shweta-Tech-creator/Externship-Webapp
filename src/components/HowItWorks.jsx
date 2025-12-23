import React from "react";

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Application & Screening",
      description: "Interns submit their application and undergo a quick eligibility check",
    },
    {
      number: 2,
      title: "Interview & Skill Evaluation",
      description: "Students interact with supervisors to assess practical understanding",
    },
    {
      number: 3,
      title: "Onboarding & Training",
      description: "Selected interns are guided through machinery safety, workflows, and tools",
    },
  ];

  return (
    <section className="how-section">
      <div className="how-container">
        <div className="how-header">
          <h2 className="how-title">How It Works</h2>
          <p className="how-subtext">
            The internship process at HARI OM THALASSIC PVT. LTD. — from application to becoming part of our team
          </p>
        </div>

        <div className="how-timeline">
          <div className="timeline-line"></div>
          
          {steps.map((step, index) => (
            <div className="timeline-step" key={index}>
              <div className="step-number-wrapper">
                <div className="step-number-bg">{step.number}</div>
                <div className="step-circle"></div>
              </div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
