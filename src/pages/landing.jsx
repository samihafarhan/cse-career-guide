import React from 'react';
import './landing.css';
import { Button } from '../components/ui/button.jsx';
import bannerImage from '../assets/banner.jpg';

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Header Section */}
      <header className="header">
        <div className="container">
          <div className="logo">
            <h1>Guide Station.</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-left">
              <div className="hero-text">
                <div className="intro-line"></div>
                <h1 className="hero-title">
                  Comp. Sci.<br />
                  Career Assistance.
                </h1>
                <p className="hero-description">
                  Trying to connect people.
                </p>
                <div className="hero-actions">
                  <Button className="cta-button-custom" size="lg">GET IN</Button>
                </div>
              </div>
            </div>
            <div className="hero-right">
              <div className="hero-image">
                <img src={bannerImage} alt="Career Guide Banner" className="banner-image" />
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="scroll-text">SCROLL</div>
          <div className="scroll-arrow">↓</div>
        </div>
      </section>

      {/* Second Section */}
      <section className="second-section">
        <div className="container">
          <div className="section-content">
            <h2 className="section-title">
              Why Do We Exist?<br />
            </h2>
            <p className="section-description">
              We aim to connect students with the resources and the people they need to excel in their computer science careers.
                  Our platform offers a range of tools and support from actual humans to help you navigate your career path effectively.
            </p>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="scroll-arrow">↑</div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
