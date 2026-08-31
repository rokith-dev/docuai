"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../components/theme/ThemeProvider";
import { useAuth } from "../../components/auth/AuthProvider";

export default function SignupPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || password.length < 8 || password !== confirm || !accepted) {
      setError(
        password !== confirm
          ? "Passwords do not match."
          : !accepted
            ? "Please accept the Terms and Privacy Policy."
            : "Please complete all fields correctly."
      );
      return;
    }
    if (!supabase) {
      setError("Authentication is not configured.");
      return;
    }
    setLoading(true);
    setError("");
    const { data, error: result } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
    });
    if (result) {
      setError(
        result.message.includes("already")
          ? "Email already registered."
          : "Unable to create account. Please try again."
      );
    } else if (data.session) {
      router.replace("/dashboard");
    } else {
      setError("Check your email to confirm your account.");
    }
    setLoading(false);
  }

  return (
    <main className={`auth-container ${theme}`}>
      {/* Background visual artifacts */}
      <div className="auth-background" aria-hidden="true">
        <div className="bg-glow purple-glow"></div>
        <div className="bg-glow blue-glow"></div>
        <div className="grid-overlay"></div>

        {/* Floating document badges behind card */}
        <div className="floating-card shape-1">
          <div className="badge-logo">W</div>
          <div>
            <div className="badge-title">Structure</div>
            <div className="badge-progress"></div>
          </div>
        </div>
        <div className="floating-card shape-2">
          <div className="badge-logo ai">AI</div>
          <div>
            <div className="badge-title">Drafting</div>
            <div className="badge-progress p-70"></div>
          </div>
        </div>
      </div>

      {/* Top Navbar */}
      <header className="auth-navbar">
        <Link href="/" className="logo-link">
          <span className="brand-mark">D</span>
          <span className="logo-text">DocuAI</span>
        </Link>
        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
          {theme === "light" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m12.7 12.7l1.4 1.4M2 12h2m16 0h2M6.3 17.7l-1.4 1.4m15.8-15.8l-1.4 1.4" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
          )}
        </button>
      </header>

      {/* Signup Block */}
      <section className="auth-card-wrapper">
        <div className="auth-card">
          <div className="auth-card-header">
            <span className="brand-mark card-logo">D</span>
            <h1>Create your DocuAI account</h1>
            <p>Start creating intelligent documents with AI.</p>
          </div>

          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="full-name">Full Name</label>
              <div className="input-field-container">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </span>
                <input
                  id="full-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  required
                  placeholder="Enter your name"
                  className="auth-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email-address">Email Address</label>
              <div className="input-field-container">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                </span>
                <input
                  id="email-address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="auth-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-field-container">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </span>
                <input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="auth-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="show-hide-btn"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <span className="input-hint">Use at least 8 characters.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-pass">Confirm Password</label>
              <div className="input-field-container">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </span>
                <input
                  id="confirm-pass"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  type={showConfirm ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="auth-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="show-hide-btn"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="terms-checkbox-container">
              <label className="checkbox-lbl">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="terms-checkbox"
                />
                <span>I agree to the Terms and Privacy Policy.</span>
              </label>
            </div>

            {error && <div className="form-error-msg">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="primary-submit-btn"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="oauth-separator">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="google-oauth-btn"
            onClick={() =>
              supabase?.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: `${window.location.origin}/dashboard` },
              })
            }
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="google-icon">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.49 3.77v3.12h4.02c2.37-2.17 3.73-5.39 3.73-8.74z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.02-3.12c-1.12.75-2.54 1.19-3.91 1.19-2.99 0-5.52-2.01-6.42-4.73H1.4v3.17A11.96 11.96 0 0 0 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.58 14.43A7.12 7.12 0 0 1 5.2 12c0-.85.15-1.68.4-2.43V6.4H1.4a11.96 11.96 0 0 0 0 11.2l4.18-3.17z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.68 1.4 6.4l4.18 3.17c.9-2.72 3.43-4.82 6.42-4.82z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="auth-card-footer">
            Already have an account? <Link href="/login">Sign In</Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: inherit;
          overflow-x: hidden;
          transition: background-color 0.4s ease, color 0.4s ease;
        }

        .auth-container.dark {
          background-color: #0b0e14;
          color: #f1f3f9;
        }

        .auth-container.light {
          background-color: #f6f8fb;
          color: #1e293b;
        }

        /* Ambient effects */
        .auth-background {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }
        .bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.15;
          animation: floatAura 20s infinite alternate ease-in-out;
        }
        .dark .bg-glow {
          opacity: 0.22;
        }
        .purple-glow {
          width: 500px;
          height: 500px;
          background: #7056df;
          top: -20%;
          left: 10%;
        }
        .blue-glow {
          width: 440px;
          height: 440px;
          background: #3b82f6;
          bottom: -15%;
          right: 5%;
          animation-delay: -7s;
        }
        .grid-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.25;
        }
        .dark .grid-overlay {
          background-image: radial-gradient(rgba(154, 133, 245, 0.12) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .light .grid-overlay {
          background-image: radial-gradient(rgba(112, 86, 223, 0.06) 1px, transparent 1px);
          background-size: 24px 24px;
        }

        /* Floating badges in perspective */
        .floating-card {
          position: absolute;
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          transform-style: preserve-3d;
          animation: floatObject 8s ease-in-out infinite alternate;
          z-index: 2;
        }
        .dark .floating-card {
          background: rgba(25, 33, 48, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
        }
        .light .floating-card {
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(112, 86, 223, 0.08);
          box-shadow: 0 15px 30px rgba(112, 86, 223, 0.08);
        }
        .badge-logo {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: #7056df;
          color: #fff;
          font-weight: 800;
          font-size: 13px;
        }
        .badge-logo.ai {
          background: #ef4444;
        }
        .badge-title {
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .badge-progress {
          width: 80px;
          height: 4px;
          border-radius: 2px;
          background: rgba(112, 86, 223, 0.2);
          position: relative;
        }
        .badge-progress::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 50%;
          background: #7056df;
          border-radius: 2px;
        }
        .badge-progress.p-70::after {
          width: 70%;
          background: #ef4444;
        }

        .shape-1 {
          top: 25%;
          left: 10%;
          transform: perspective(600px) rotateY(15deg) rotateX(10deg);
        }
        .shape-2 {
          bottom: 20%;
          right: 12%;
          transform: perspective(600px) rotateY(-15deg) rotateX(8deg);
          animation-delay: -3s;
        }

        @keyframes floatAura {
          0% { transform: scale(1) translate(0px, 0px); }
          100% { transform: scale(1.1) translate(30px, -30px); }
        }
        @keyframes floatObject {
          0% { transform: translateY(0); }
          100% { transform: translateY(-15px); }
        }

        /* Navbar */
        .auth-navbar {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1240px;
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
          font-size: 19px;
          color: inherit;
          transition: transform 0.2s ease;
        }
        .logo-link:hover {
          transform: scale(1.02);
        }
        .brand-mark {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, #7056df 0%, #5a3ec8 100%);
          color: #fff;
          font-size: 13px;
          font-weight: 900;
          box-shadow: 0 4px 10px rgba(112, 86, 223, 0.35);
        }
        .dark .brand-mark {
          background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
          box-shadow: 0 4px 10px rgba(124, 58, 237, 0.4);
        }
        .logo-text {
          letter-spacing: -0.03em;
        }
        .theme-toggle-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          width: 36px;
          height: 36px;
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

        /* Card Wrapper & Grid layout */
        .auth-card-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          margin: auto;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px 24px 80px;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 36px;
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .dark .auth-card {
          background: rgba(17, 24, 39, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 80px rgba(112, 86, 223, 0.08);
        }

        .light .auth-card {
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(112, 86, 223, 0.1);
          backdrop-filter: blur(20px);
          box-shadow: 0 30px 60px rgba(112, 86, 223, 0.06);
        }

        .auth-card-header {
          text-align: center;
          margin-bottom: 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .card-logo {
          margin-bottom: 16px;
        }
        .auth-card-header h1 {
          font-size: 23px;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
        }
        .auth-card-header p {
          font-size: 13px;
          color: #64748b;
        }
        .dark .auth-card-header p {
          color: #94a3b8;
        }

        /* Form groups */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-label {
          display: block;
          font-size: 12.5px;
          font-weight: 650;
          margin-bottom: 6px;
        }
        .input-field-container {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          color: #94a3b8;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auth-input {
          width: 100%;
          padding: 11px 12px 11px 36px;
          border-radius: 8px;
          font-size: 13.5px;
          outline: none;
          background: transparent;
          font-family: inherit;
          transition: all 0.2s ease;
        }
        .dark .auth-input {
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f1f5f9;
        }
        .dark .auth-input:focus {
          border-color: #9a85f5;
          box-shadow: 0 0 0 3px rgba(154, 133, 245, 0.15);
          background: rgba(255, 255, 255, 0.01);
        }
        .light .auth-input {
          border: 1px solid rgba(0, 0, 0, 0.12);
          color: #0f172a;
        }
        .light .auth-input:focus {
          border-color: #7056df;
          box-shadow: 0 0 0 3px rgba(112, 86, 223, 0.1);
          background: rgba(0, 0, 0, 0.005);
        }

        .show-hide-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
          padding: 4px;
          text-transform: uppercase;
        }
        .show-hide-btn:hover {
          color: #7056df;
        }
        .dark .show-hide-btn:hover {
          color: #9a85f5;
        }
        .input-hint {
          display: block;
          font-size: 10.5px;
          color: #64748b;
          margin-top: 4px;
        }
        .dark .input-hint {
          color: #94a3b8;
        }

        .terms-checkbox-container {
          margin-top: 4px;
          display: flex;
          align-items: center;
        }
        .checkbox-lbl {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          user-select: none;
        }
        .dark .checkbox-lbl {
          color: #94a3b8;
        }
        .terms-checkbox {
          width: 15px;
          height: 15px;
          border-radius: 4px;
          accent-color: #7056df;
          cursor: pointer;
        }
        .dark .terms-checkbox {
          accent-color: #9a85f5;
        }

        .form-error-msg {
          font-size: 11px;
          color: #ef4444;
          text-align: left;
        }

        .primary-submit-btn {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: none;
          font-size: 13.5px;
          font-weight: 750;
          color: #fff;
          cursor: pointer;
          background: #7056df;
          transition: all 0.3s ease;
          box-shadow: 0 4px 10px rgba(112, 86, 223, 0.3);
          margin-top: 8px;
        }
        .dark .primary-submit-btn {
          background: #9a85f5;
          box-shadow: 0 4px 10px rgba(154, 133, 245, 0.25);
        }
        .primary-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(112, 86, 223, 0.4);
          background: #5a3ec8;
        }
        .dark .primary-submit-btn:hover:not(:disabled) {
          background: #8167f1;
        }
        .primary-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* OAuth Divider */
        .oauth-separator {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 18px 0;
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
        }
        .oauth-separator::before,
        .oauth-separator::after {
          content: "";
          flex: 1;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        .dark .oauth-separator::before,
        .dark .oauth-separator::after {
          border-bottom-color: rgba(255, 255, 255, 0.06);
        }
        .oauth-separator:not(:empty)::before {
          margin-right: 12px;
        }
        .oauth-separator:not(:empty)::after {
          margin-left: 12px;
        }

        .google-oauth-btn {
          width: 100%;
          padding: 11px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 650;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: inherit;
          font-family: inherit;
        }
        .dark .google-oauth-btn {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
        }
        .dark .google-oauth-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
        }
        .light .google-oauth-btn {
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: #ffffff;
        }
        .light .google-oauth-btn:hover {
          background: #f8fafc;
          border-color: rgba(0, 0, 0, 0.15);
        }
        .google-icon {
          flex-shrink: 0;
        }

        .auth-card-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
        }
        .dark .auth-card-footer {
          color: #94a3b8;
        }
        .auth-card-footer a {
          text-decoration: none;
          font-weight: 700;
          color: #7056df;
        }
        .dark .auth-card-footer a {
          color: #9a85f5;
        }
        .auth-card-footer a:hover {
          text-decoration: underline;
        }

        /* Responsiveness */
        @media (max-width: 1024px) {
          .floating-card {
            display: none; /* Hide floating shapes on smaller screens to optimize performance & viewport */
          }
        }
        @media (max-width: 640px) {
          .auth-navbar {
            padding: 16px;
          }
          .auth-card-wrapper {
            padding: 10px 16px 60px;
          }
          .auth-card {
            padding: 24px;
          }
          .auth-card-header h1 {
            font-size: 20px;
          }
        }
      `}</style>
    </main>
  );
}
