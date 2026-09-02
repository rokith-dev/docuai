"use client";

import Link from "next/link";
import { useTheme } from "../components/theme/ThemeProvider";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className={`landing-container ${theme}`}>
      {/* Subtle Animated Background Elements */}
      <div className="bg-decorations" aria-hidden="true">
        <div className="ambient-glow purple-glow"></div>
        <div className="ambient-glow blue-glow"></div>
        <div className="ambient-glow orange-glow"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Main Header */}
      <header className="landing-header">
        <Link href="/" className="logo-link">
          <span className="brand-mark">D</span>
          <span className="logo-text">DocuAI</span>
        </Link>
        <div className="nav-actions">
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
            {theme === "light" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m12.7 12.7l1.4 1.4M2 12h2m16 0h2M6.3 17.7l-1.4 1.4m15.8-15.8l-1.4 1.4"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
          </button>
          <Link href="/login" className="btn-signin">Sign In</Link>
          <Link href="/signup" className="btn-signup">Sign Up</Link>
        </div>
      </header>

      {/* Hero Section Container */}
      <section className="hero-wrapper">
        <div className="hero-left">
          <div className="eyebrow-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sparkle-svg"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>
            <span>Intelligent Document Workspace</span>
          </div>
          <h1 className="hero-title">
            Turn your ideas into <span className="grad">finished documents.</span>
          </h1>
          <p className="hero-desc">
            DocuAI brings your templates, structured content, and powerful LLMs together in one focused environment. Draft, analyze, and format in seconds.
          </p>
          <div className="hero-actions">
            <Link href="/signup" className="primary-action-btn">
              <span>Get Started</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link href="/login" className="secondary-action-btn">
              Sign In
            </Link>
          </div>
          <div className="hero-features">
            <div className="feature-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              <span>Instant DOCX analysis</span>
            </div>
            <div className="feature-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              <span>AI generation & filling</span>
            </div>
            <div className="feature-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              <span>Structured templates</span>
            </div>
          </div>
        </div>

        <div className="hero-right" aria-hidden="true">
          <div className="visual-3d-scene">
            {/* Sparkles */}
            <span className="spark-sparkle s1" style={{ animationDelay: "0s" }}>✦</span>
            <span className="spark-sparkle s2" style={{ animationDelay: "0.4s" }}>✦</span>
            <span className="spark-sparkle s3" style={{ animationDelay: "0.8s" }}>✦</span>

            {/* Base sheet: represents document builder */}
            <div className="card-layer base-sheet">
              <div className="sheet-header">
                <span className="dot rgb-r"></span>
                <span className="dot rgb-y"></span>
                <span className="dot rgb-g"></span>
                <span className="sheet-badge">DOCUAI WRITER</span>
              </div>
              <div className="sheet-content">
                <div className="sheet-line-mockup w-90 purple"></div>
                <div className="sheet-line-mockup w-60"></div>
                <div className="sheet-line-mockup w-80"></div>
                <div className="sheet-line-mockup w-40"></div>
                <div className="divider-line"></div>
                <div className="sheet-section-block">
                  <span className="num">01</span>
                  <div className="text-col">
                    <div className="sheet-line-mockup w-90"></div>
                    <div className="sheet-line-mockup w-60"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle card: represents DOCX document object */}
            <div className={`card-layer doc-detail ${theme === "light" ? "light-mode-adjust" : ""}`}>
              <div className="card-details">
                <div className="doc-icon">W</div>
                <div>
                  <div className="card-lbl">PROJECT SUMMARY</div>
                  <strong className="card-name">Research Pitch.docx</strong>
                  <div className="card-bytes">184 KB • Saved</div>
                </div>
              </div>
              <div className="card-lines">
                <div className="line-bar percent-100"></div>
                <div className="line-bar percent-60"></div>
              </div>
            </div>

            {/* Top-most element: AI prompt widget */}
            <div className="card-layer ai-status">
              <div className="ai-badge">AI</div>
              <div className="ai-meta">
                <strong className="ai-title">Generating content...</strong>
                <span className="ai-sub">Structuring research aim...</span>
              </div>
              <div className="loader-bars">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <footer className="landing-proof-banner">
        <span>Empowering researchers and creators</span>
        <div className="proof-logos">
          <strong>Research</strong>
          <strong>Experiments</strong>
          <strong>Projects</strong>
          <strong>Reports</strong>
        </div>
      </footer>

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          font-family: inherit;
          transition: background-color 0.4s ease, color 0.4s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* Default Premium Dark Mode theme */
        .landing-container.dark {
          background-color: #0a0a0e;
          color: #f1f3f9;
        }

        /* Light Mode theme */
        .landing-container.light {
          background-color: #f6f8fb;
          color: #1e293b;
        }

        /* Ambient glows behind landing details */
        .bg-decorations {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }
        .ambient-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.15;
          animation: pulseGlow 15s ease-in-out infinite alternate;
        }
        .dark .ambient-glow {
          opacity: 0.22;
        }
        .purple-glow {
          width: 450px;
          height: 450px;
          background: #7056df;
          top: -10%;
          right: 5%;
        }
        .blue-glow {
          width: 380px;
          height: 380px;
          background: #3b82f6;
          bottom: 10%;
          left: -5%;
          animation-delay: -5s;
        }
        .orange-glow {
          width: 250px;
          height: 250px;
          background: #f97316;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.04;
          animation-delay: -10s;
        }
        .grid-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.25;
        }
        .dark .grid-overlay {
          background-image: radial-gradient(rgba(154, 133, 245, 0.15) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .light .grid-overlay {
          background-image: radial-gradient(rgba(112, 86, 223, 0.08) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        @keyframes pulseGlow {
          0% { transform: scale(1) translate(0px, 0px); }
          100% { transform: scale(1.15) translate(20px, -20px); }
        }

        /* Header Layout */
        .landing-header {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          font-weight: 850;
          font-size: 20px;
          color: inherit;
          transition: transform 0.2s ease;
        }
        .logo-link:hover {
          transform: scale(1.02);
        }
        .brand-mark {
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: linear-gradient(135deg, #7056df 0%, #5a3ec8 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 900;
          box-shadow: 0 4px 10px rgba(112, 86, 223, 0.4);
        }
        .dark .brand-mark {
          background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
          box-shadow: 0 4px 10px rgba(124, 58, 237, 0.4);
        }
        .logo-text {
          letter-spacing: -0.03em;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .theme-toggle-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: inherit;
          transition: all 0.2s ease;
        }
        .light .theme-toggle-btn {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(0, 0, 0, 0.06);
        }
        .theme-toggle-btn:hover {
          background: rgba(112, 86, 223, 0.1);
          border-color: rgba(112, 86, 223, 0.2);
          transform: scale(1.05);
        }
        .btn-signin {
          font-size: 13.5px;
          font-weight: 600;
          color: inherit;
          text-decoration: none;
          transition: opacity 0.2s;
          padding: 8px 12px;
        }
        .btn-signin:hover {
          opacity: 0.85;
        }
        .btn-signup {
          font-size: 13.5px;
          font-weight: 700;
          color: #fff !important;
          text-decoration: none;
          background: #7056df;
          padding: 9px 18px;
          border-radius: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(112, 86, 223, 0.3);
        }
        .dark .btn-signup {
          background: #9a85f5;
          box-shadow: 0 4px 12px rgba(154, 133, 245, 0.25);
        }
        .btn-signup:hover {
          transform: translateY(-1.5px);
          box-shadow: 0 6px 16px rgba(112, 86, 223, 0.4);
          background: #5a3ec8;
        }
        .dark .btn-signup:hover {
          background: #8167f1;
        }

        /* Hero Wrapper */
        .hero-wrapper {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1240px;
          margin: auto;
          padding: 10px 24px 60px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 60px;
          align-items: center;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .eyebrow-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 12px;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 99px;
          background: rgba(112, 86, 223, 0.08);
          border: 1px solid rgba(112, 86, 223, 0.15);
          color: #7056df;
          margin-bottom: 24px;
        }
        .dark .eyebrow-badge {
          background: rgba(154, 133, 245, 0.08);
          border-color: rgba(154, 133, 245, 0.18);
          color: #9a85f5;
        }
        .sparkle-svg {
          color: #f97316;
          filter: drop-shadow(0 0 3px rgba(249, 115, 22, 0.4));
        }

        .hero-title {
          font-size: clamp(34px, 4.8vw, 62px);
          line-height: 1.05;
          letter-spacing: -0.04em;
          font-weight: 800;
          margin-bottom: 20px;
        }
        .hero-title span.grad {
          background: linear-gradient(135deg, #7056df 20%, #9a85f5 55%, #f97316 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-desc {
          font-size: clamp(15px, 2vw, 17px);
          line-height: 1.6;
          color: #64748b;
          margin-bottom: 36px;
          max-width: 540px;
        }
        .dark .hero-desc {
          color: #94a3b8;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;
          width: 100%;
        }
        .primary-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 750;
          color: #fff !important;
          text-decoration: none;
          background: #7056df;
          padding: 14px 28px;
          border-radius: 30px;
          box-shadow: 0 8px 20px rgba(112, 86, 223, 0.3);
          transition: all 0.3s ease;
        }
        .dark .primary-action-btn {
          background: #9a85f5;
          box-shadow: 0 8px 20px rgba(154, 133, 245, 0.3);
        }
        .primary-action-btn:hover {
          transform: translateY(-2px);
          background: #5a3ec8;
          box-shadow: 0 10px 24px rgba(112, 86, 223, 0.45);
        }
        .dark .primary-action-btn:hover {
          background: #8167f1;
        }
        .primary-action-btn svg {
          transition: transform 0.2s ease;
        }
        .primary-action-btn:hover svg {
          transform: translateX(4px);
        }

        .secondary-action-btn {
          display: inline-flex;
          align-items: center;
          font-size: 14px;
          font-weight: 650;
          color: inherit;
          text-decoration: none;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(0, 0, 0, 0.02);
          padding: 14px 28px;
          border-radius: 30px;
          transition: all 0.2s ease;
        }
        .dark .secondary-action-btn {
          border-color: rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
        }
        .secondary-action-btn:hover {
          background: rgba(112, 86, 223, 0.06);
          border-color: rgba(112, 86, 223, 0.18);
          transform: translateY(-1px);
        }

        .hero-features {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 600;
          color: #64748b;
        }
        .dark .feature-item {
          color: #94a3b8;
        }
        .feature-item svg {
          color: #3b82f6;
        }

        /* 3D Scene Viewport */
        .hero-right {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 480px;
        }
        .visual-3d-scene {
          position: relative;
          width: 100%;
          max-width: 400px;
          height: 400px;
          perspective: 1200px;
          transform-style: preserve-3d;
        }

        /* Float elements */
        .card-layer {
          position: absolute;
          border-radius: 16px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
          pointer-events: none;
          transform-style: preserve-3d;
        }
        .dark .card-layer {
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }

        /* Base Page Card */
        .card-layer.base-sheet {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          color: #0f172a;
          width: 270px;
          height: 330px;
          top: 30px;
          left: 10px;
          padding: 20px;
          transform: rotateY(-18deg) rotateX(14deg) rotateZ(-5deg) translateZ(0px);
          z-index: 10;
          animation: floatBaseCard 6s ease-in-out infinite alternate;
        }
        .dark .card-layer.base-sheet {
          background: #192130;
          border-color: rgba(255, 255, 255, 0.06);
          color: #f8fafc;
        }
        .sheet-header {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 20px;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .rgb-r { background: #ef4444; }
        .rgb-y { background: #eab308; }
        .rgb-g { background: #22c55e; }
        .sheet-badge {
          margin-left: auto;
          font-size: 8px;
          font-weight: 850;
          color: #7056df;
          letter-spacing: 0.05em;
        }
        .sheet-line-mockup {
          height: 6px;
          border-radius: 3px;
          background: rgba(0, 0, 0, 0.05);
          margin-bottom: 10px;
        }
        .dark .sheet-line-mockup {
          background: rgba(255, 255, 255, 0.05);
        }
        .sheet-line-mockup.w-90 { width: 90%; }
        .sheet-line-mockup.w-80 { width: 80%; }
        .sheet-line-mockup.w-60 { width: 60%; }
        .sheet-line-mockup.w-40 { width: 40%; }
        .sheet-line-mockup.purple {
          background: rgba(112, 86, 223, 0.15);
        }
        .dark .sheet-line-mockup.purple {
          background: rgba(154, 133, 245, 0.2);
        }
        .divider-line {
          height: 1px;
          background: rgba(0, 0, 0, 0.06);
          margin: 15px 0;
        }
        .dark .divider-line {
          background: rgba(255, 255, 255, 0.06);
        }
        .sheet-section-block {
          display: flex;
          gap: 12px;
        }
        .sheet-section-block .num {
          font-size: 11px;
          font-weight: 800;
          color: #ef4444;
        }
        .sheet-section-block .text-col {
          flex: 1;
        }

        /* Document details card */
        .card-layer.doc-detail {
          background: linear-gradient(135deg, #7056df 0%, #5a3ec8 100%);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.08);
          width: 200px;
          height: 120px;
          bottom: 60px;
          right: 20px;
          padding: 14px;
          transform: rotateY(-18deg) rotateX(14deg) rotateZ(-5deg) translateZ(60px);
          z-index: 20;
          animation: floatDocCard 5s ease-in-out infinite alternate;
        }
        .card-layer.doc-detail.light-mode-adjust {
          background: linear-gradient(135deg, #9a85f5 0%, #7056df 100%);
        }
        .card-details {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 14px;
        }
        .doc-icon {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.15);
          font-weight: 800;
          font-size: 14px;
        }
        .card-lbl {
          font-size: 7.5px;
          font-weight: 800;
          opacity: 0.8;
          letter-spacing: 0.05em;
        }
        .card-name {
          display: block;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-bytes {
          font-size: 8px;
          opacity: 0.75;
        }
        .card-lines {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .line-bar {
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.25);
        }
        .line-bar.percent-100 { width: 100%; }
        .line-bar.percent-60 { width: 60%; }

        /* AI Prompt badge */
        .card-layer.ai-status {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #fff;
          width: 210px;
          height: 70px;
          top: 50px;
          right: 10px;
          padding: 12px;
          transform: rotateY(-18deg) rotateX(14deg) rotateZ(-5deg) translateZ(110px);
          z-index: 30;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: floatAiCard 7s ease-in-out infinite alternate;
        }
        .light .card-layer.ai-status {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(112, 86, 223, 0.12);
          color: #1e293b;
          box-shadow: 0 15px 30px rgba(112, 86, 223, 0.12);
        }
        .ai-badge {
          display: grid;
          place-items: center;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: #f97316;
          color: #fff;
          font-size: 10px;
          font-weight: 850;
        }
        .ai-meta {
          flex: 1;
        }
        .ai-title {
          display: block;
          font-size: 11px;
          font-weight: 750;
        }
        .ai-sub {
          display: block;
          font-size: 8px;
          color: #94a3b8;
        }
        .light .ai-sub {
          color: #64748b;
        }
        .loader-bars {
          display: flex;
          align-items: flex-end;
          gap: 2.5px;
          height: 12px;
        }
        .loader-bars span {
          width: 2.5px;
          height: 100%;
          background: #7056df;
          border-radius: 1px;
          animation: barGrow 1s ease-in-out infinite alternate;
        }
        .dark .loader-bars span {
          background: #9a85f5;
        }
        .loader-bars span:nth-child(2) {
          animation-delay: 0.3s;
        }
        .loader-bars span:nth-child(3) {
          animation-delay: 0.6s;
        }

        /* Star sparkles */
        .spark-sparkle {
          position: absolute;
          color: #f97316;
          font-size: 18px;
          filter: drop-shadow(0 0 4px rgba(249, 115, 22, 0.6));
          animation: sparkleAnimation 3s ease-in-out infinite alternate;
        }
        .spark-sparkle.s1 { top: 25%; right: 45%; transform: translateZ(90px); }
        .spark-sparkle.s2 { bottom: 35%; left: 5%; transform: translateZ(60px); animation-delay: 0.7s; }
        .spark-sparkle.s3 { top: 75%; right: 28%; transform: translateZ(40px); animation-delay: 1.4s; }

        @keyframes sparkleAnimation {
          0% { opacity: 0.3; transform: scale(0.8) translateZ(80px); }
          100% { opacity: 1; transform: scale(1.3) translateZ(80px); }
        }

        @keyframes barGrow {
          0% { height: 3px; }
          100% { height: 12px; }
        }

        /* 3D Animations */
        @keyframes floatBaseCard {
          0% { transform: rotateY(-18deg) rotateX(14deg) rotateZ(-5deg) translateY(0px) translateZ(0px); }
          100% { transform: rotateY(-18deg) rotateX(14deg) rotateZ(-5deg) translateY(-10px) translateZ(0px); }
        }
        @keyframes floatDocCard {
          0% { transform: rotateY(-18deg) rotateX(14deg) rotateZ(-5deg) translateY(0px) translateZ(60px); }
          100% { transform: rotateY(-18deg) rotateX(14deg) rotateZ(-5deg) translateY(-15px) translateZ(60px); }
        }
        @keyframes floatAiCard {
          0% { transform: rotateY(-18deg) rotateX(14deg) rotateZ(-5deg) translateY(0px) translateZ(110px); }
          100% { transform: rotateY(-18deg) rotateX(14deg) rotateZ(-5deg) translateY(-8px) translateZ(110px); }
        }

        /* Social Proof Banner */
        .landing-proof-banner {
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
          padding: 30px 24px;
          text-align: center;
          position: relative;
          z-index: 3;
        }
        .dark .landing-proof-banner {
          border-top-color: rgba(255, 255, 255, 0.05);
        }
        .landing-proof-banner span {
          display: block;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 0.12em;
          margin-bottom: 16px;
        }
        .light .landing-proof-banner span {
          color: #64748b;
        }
        .proof-logos {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 30px 48px;
        }
        .proof-logos strong {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #64748b;
        }
        .dark .proof-logos strong {
          color: #475569;
        }

        /* Responsive Layouts */
        @media (max-width: 1024px) {
          .hero-wrapper {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
            padding-bottom: 40px;
            margin-top: 20px;
          }
          .hero-left {
            align-items: center;
            max-width: 600px;
            margin: 0 auto;
          }
          .hero-actions {
            justify-content: center;
          }
          .hero-features {
            justify-content: center;
          }
          .hero-right {
            height: 380px;
          }
          .visual-3d-scene {
            max-width: 320px;
            height: 320px;
          }
          .card-layer.base-sheet {
            width: 220px;
            height: 270px;
            left: 10px;
            padding: 16px;
          }
          .card-layer.doc-detail {
            width: 170px;
            height: 100px;
            bottom: 50px;
            right: 15px;
          }
          .card-layer.ai-status {
            width: 170px;
            height: 60px;
            top: 40px;
            right: 5px;
          }
        }

        @media (max-width: 640px) {
          .landing-header {
            padding: 16px;
          }
          .nav-actions {
            gap: 12px;
          }
          .btn-signup {
            padding: 8px 14px;
            font-size: 12.5px;
          }
          .hero-wrapper {
            padding: 0 16px 30px;
          }
          .hero-title {
            margin-bottom: 12px;
          }
          .hero-actions {
            flex-direction: column;
            width: 100%;
            gap: 12px;
          }
          .primary-action-btn, .secondary-action-btn {
            width: 100%;
            justify-content: center;
            padding: 12px 24px;
          }
          .visual-3d-scene {
            transform: scale(0.8);
          }
          .proof-logos {
            gap: 20px 30px;
          }
        }
      `}</style>
    </main>
  );
}
