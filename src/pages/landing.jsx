import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button.jsx';
import bannerImage from '../assets/banner.jpg';

const Landing = () => {
  const navigate = useNavigate();

  console.log('Landing page is rendering')

  const handleGetInClick = () => {
    navigate('/auth');
  };

  const styles = {
    landingPage: {
      overflowX: 'hidden',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif`,
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px'
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '20px 0'
    },
    logo: {
      color: 'white',
      fontSize: '1.8rem',
      fontWeight: 'bold',
      letterSpacing: '2px',
      margin: 0
    },
    heroSection: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: 'white',
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    heroContent: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '60px',
      alignItems: 'center',
      paddingTop: '80px'
    },
    heroLeft: {
      paddingRight: '40px'
    },
    introLine: {
      width: '60px',
      height: '3px',
      background: '#00D084',
      marginBottom: '30px'
    },
    heroTitle: {
      fontSize: '4rem',
      fontWeight: 'bold',
      lineHeight: 1.1,
      marginBottom: '30px',
      color: 'white'
    },
    heroDescription: {
      fontSize: '1.1rem',
      lineHeight: 1.6,
      color: '#888',
      marginBottom: '40px',
      maxWidth: '500px'
    },
    heroActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '30px'
    },
    ctaButtonCustom: {
      background: '#00D084 !important',
      color: 'white !important',
      border: 'none !important',
      padding: '18px 36px !important',
      fontSize: '1rem !important',
      fontWeight: '600 !important',
      letterSpacing: '1px !important',
      textTransform: 'uppercase !important',
      borderRadius: '8px !important',
      height: 'auto !important',
      transition: 'all 0.3s ease !important',
      boxShadow: 'none !important'
    },
    heroRight: {
      height: '100%',
      position: 'relative'
    },
    heroImage: {
      width: '100%',
      height: '600px',
      borderRadius: '10px',
      overflow: 'hidden',
      position: 'relative'
    },
    bannerImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '10px'
    },
    scrollIndicator: {
      position: 'absolute',
      right: '40px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    },
    scrollText: {
      writingMode: 'vertical-rl',
      textOrientation: 'mixed',
      fontSize: '0.9rem',
      letterSpacing: '3px',
      color: '#888'
    },
    scrollArrow: {
      fontSize: '1.5rem',
      color: '#888',
      animation: 'bounce 2s infinite'
    },
    secondSection: {
      minHeight: '60vh',
      background: '#00D084',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      position: 'relative'
    },
    sectionContent: {
      textAlign: 'center',
      maxWidth: '800px',
      margin: '0 auto'
    },
    sectionTitle: {
      fontSize: '3.5rem',
      fontWeight: 'bold',
      lineHeight: 1.2,
      marginBottom: '30px'
    },
    sectionDescription: {
      fontSize: '1.1rem',
      lineHeight: 1.6,
      color: 'rgba(255, 255, 255, 0.8)',
      maxWidth: '600px',
      margin: '0 auto'
    },
    scrollIndicatorSecond: {
      position: 'absolute',
      right: '40px',
      bottom: '40px',
      top: 'auto',
      transform: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }
  };

  return (
    <div style={styles.landingPage}>
      {/* Header Section */}
      <header style={styles.header}>
        <div style={styles.container}>
          <div className="logo">
            <h1 style={styles.logo}>Guide Station.</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.container}>
          <div style={styles.heroContent} className="landing-hero-content">
            <div style={styles.heroLeft} className="landing-hero-left">
              <div className="hero-text">
                <div style={styles.introLine}></div>
                <h1 style={styles.heroTitle} className="landing-hero-title">
                  Comp. Sci.<br />
                  Career Assistance.
                </h1>
                <p style={styles.heroDescription} className="landing-hero-description">
                  Trying to connect people.
                </p>
                <div style={styles.heroActions}>
                  <Button 
                    className="cta-button-custom" 
                    size="lg" 
                    onClick={handleGetInClick}
                    style={{
                      background: '#00D084',
                      color: 'white',
                      border: 'none',
                      padding: '18px 36px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      borderRadius: '8px',
                      height: 'auto',
                      transition: 'all 0.3s ease',
                      boxShadow: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#00b86f';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#00D084';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    GET IN
                  </Button>
                </div>
              </div>
            </div>
            <div style={styles.heroRight}>
              <div style={styles.heroImage} className="landing-hero-image">
                <img src={bannerImage} alt="Career Guide Banner" style={styles.bannerImage} />
              </div>
            </div>
          </div>
        </div>
        <div style={styles.scrollIndicator} className="landing-scroll-indicator">
          <div style={styles.scrollText}>SCROLL</div>
          <div style={styles.scrollArrow}>↓</div>
        </div>
      </section>

      {/* Second Section */}
      <section style={styles.secondSection}>
        <div style={styles.container}>
          <div style={styles.sectionContent}>
            <h2 style={styles.sectionTitle} className="landing-section-title">
              Why Do We Exist?<br />
            </h2>
            <p style={styles.sectionDescription} className="landing-section-description">
              We aim to connect students with the resources and the people they need to excel in their computer science careers.
                  Our platform offers a range of tools and support from actual humans to help you navigate your career path effectively.
            </p>
          </div>
        </div>
        <div style={styles.scrollIndicatorSecond}>
          <div style={styles.scrollArrow}>↑</div>
        </div>
      </section>

      {/* Add keyframe animation styles */}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @media (max-width: 768px) {
          .landing-hero-content {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            text-align: center !important;
          }
          .landing-hero-left {
            padding-right: 0 !important;
          }
          .landing-hero-title {
            font-size: 2.5rem !important;
          }
          .landing-section-title {
            font-size: 2.5rem !important;
          }
          .landing-scroll-indicator {
            display: none !important;
          }
          .landing-hero-image {
            height: 400px !important;
          }
        }
        
        @media (max-width: 480px) {
          .landing-hero-title {
            font-size: 2rem !important;
          }
          .landing-section-title {
            font-size: 2rem !important;
          }
          .landing-hero-description,
          .landing-section-description {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;
