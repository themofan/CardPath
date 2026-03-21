import { useState } from "react";
import { TrendingUp, Shield, Sparkles } from "lucide-react";
import { useUser } from "../context/UserContext";
import { supabase } from "../api/supabase";

export default function CPLogin({ onLogin, onSignUp }) {
  const { signIn, signUp } = useUser();
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const clearError = () => setError("");

  const handleSignIn = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      onLogin();
    } catch (e) {
      setError(e.message === "Invalid login credentials"
        ? "Invalid email or password"
        : e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError("");
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!email.trim() || !password) {
      setError("Please enter email and password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      onSignUp();
    } catch (e) {
      setError(e.message.includes("already registered")
        ? "This email is already registered"
        : e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email first");
      return;
    }
    try {
      await supabase.auth.resetPasswordForEmail(email.trim());
      setToast("Password reset link sent to your email.");
      setTimeout(() => setToast(""), 2500);
    } catch (e) {
      setError("Failed to send reset email");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      mode === "signin" ? handleSignIn() : handleSignUp();
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  const inputStyle = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1.5px solid rgba(255,255,255,0.35)",
    color: "white",
    fontSize: 14,
    padding: "4px 0 6px 0",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    color: "rgba(255,255,255,0.55)",
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: 4,
  };

  const isSignUp = mode === "signup";
  const cardHeight = isSignUp ? 340 : 302;

  return (
    <div className="min-h-screen bg-[#2C2420] flex flex-col items-center justify-center relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-lg shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* Hero Text */}
      <div className="text-center mb-10">
        <h1 style={{ color: "#F0EBE3", fontSize: 36, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
          Optimize every card.<br />Maximize every reward.
        </h1>
        <p style={{ color: "#B0A898", fontSize: 15, marginTop: 12, maxWidth: 420, lineHeight: 1.5 }}>
          AI-powered guidance to choose, track, and optimize your credit cards—effortlessly.
        </p>
      </div>

      {/* Credit Card */}
      <div
        style={{
          width: 480,
          height: cardHeight,
          borderRadius: 20,
          background:
            "linear-gradient(145deg, #2563eb 0%, #1d4ed8 25%, #1e40af 55%, #1e3a8a 80%, #172554 100%)",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 0 80px 20px rgba(255,255,255,0.06), 0 0 40px 10px rgba(37, 99, 235, 0.15), 0 25px 60px rgba(30, 58, 138, 0.45), 0 8px 24px rgba(0,0,0,0.18)",
          transition: "height 0.3s ease",
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            height: 60,
            background: "rgba(0,0,0,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <div className="flex items-center gap-2.5">
            <svg width="22" height="17" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="20" height="15" rx="3" stroke="white" strokeWidth="1.5" fill="none" />
              <rect x="1" y="5" width="20" height="3" fill="rgba(255,255,255,0.35)" />
              <rect x="3" y="11" width="8" height="1.5" rx="0.75" fill="rgba(255,255,255,0.5)" />
            </svg>
            <span style={{ color: "white", fontWeight: 700, fontSize: 15, letterSpacing: "0.22em", userSelect: "none" }}>
              CARDPATH
            </span>
          </div>
          {/* DDD Logo */}
          <span style={{ color: "white", fontSize: 15, fontWeight: 700, letterSpacing: "0.22em", userSelect: "none" }}>DDD</span>
        </div>

        {isSignUp ? (
          <>
            {/* Sign Up Fields */}
            <div style={{ padding: "14px 24px 0 24px" }}>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearError(); }}
                  onKeyDown={handleKeyDown}
                  style={inputStyle}
                  placeholder="John Doe"
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  onKeyDown={handleKeyDown}
                  style={inputStyle}
                  placeholder="you@email.com"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label style={labelStyle}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError(); }}
                    onKeyDown={handleKeyDown}
                    style={inputStyle}
                    placeholder="Min 6 chars"
                  />
                </div>
                <div className="flex-1">
                  <label style={labelStyle}>Confirm</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
                    onKeyDown={handleKeyDown}
                    style={inputStyle}
                    placeholder="********"
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: "6px 24px 0", color: "#fca5a5", fontSize: 11, fontWeight: 500 }}>
                {error}
              </div>
            )}

            {/* Sign Up Button */}
            <div className="flex items-center gap-4" style={{ padding: error ? "6px 24px 0" : "12px 24px 0" }}>
              <button
                onClick={handleSignUp}
                disabled={loading}
                style={{
                  background: loading ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "white", fontSize: 13, fontWeight: 600,
                  padding: "8px 22px", borderRadius: 12,
                  cursor: loading ? "not-allowed" : "pointer",
                  backdropFilter: "blur(4px)", transition: "background 0.2s",
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "rgba(255,255,255,0.28)")}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
              >
                {loading ? "..." : "Sign Up \u2192"}
              </button>
              <button
                onClick={() => switchMode("signin")}
                disabled={loading}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 12, textDecoration: "underline", cursor: "pointer", padding: 0 }}
              >
                Back to Sign In
              </button>
            </div>
          </>
        ) : (
          <>
            {/* EMV Chip */}
            <div
              style={{
                width: 44, height: 32, borderRadius: 6,
                background: "linear-gradient(145deg, #fbbf24, #d97706, #f59e0b)",
                margin: "14px 0 0 24px", position: "relative", overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
              }}
            >
              <svg width="44" height="32" viewBox="0 0 44 32" fill="none" style={{ position: "absolute", top: 0, left: 0 }}>
                <line x1="14.5" y1="0" x2="14.5" y2="32" stroke="rgba(120,70,0,0.3)" strokeWidth="1" />
                <line x1="29.5" y1="0" x2="29.5" y2="32" stroke="rgba(120,70,0,0.3)" strokeWidth="1" />
                <line x1="0" y1="10.5" x2="44" y2="10.5" stroke="rgba(120,70,0,0.3)" strokeWidth="1" />
                <line x1="0" y1="21.5" x2="44" y2="21.5" stroke="rgba(120,70,0,0.3)" strokeWidth="1" />
              </svg>
            </div>

            {/* Sign In Fields */}
            <div className="flex gap-4" style={{ padding: "16px 24px 0 24px" }}>
              <div className="flex-1">
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  onKeyDown={handleKeyDown}
                  style={inputStyle}
                  placeholder="you@email.com"
                />
              </div>
              <div className="flex-1">
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  onKeyDown={handleKeyDown}
                  style={inputStyle}
                  placeholder="********"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: "6px 24px 0", color: "#fca5a5", fontSize: 11, fontWeight: 500 }}>
                {error}
              </div>
            )}

            {/* Sign In Button + Links */}
            <div className="flex items-center gap-4" style={{ padding: error ? "8px 24px 0" : "18px 24px 0 24px" }}>
              <button
                onClick={handleSignIn}
                disabled={loading}
                style={{
                  background: loading ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "white", fontSize: 13, fontWeight: 600,
                  padding: "8px 22px", borderRadius: 12,
                  cursor: loading ? "not-allowed" : "pointer",
                  backdropFilter: "blur(4px)", transition: "background 0.2s",
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "rgba(255,255,255,0.28)")}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
              >
                {loading ? "..." : "Sign In \u2192"}
              </button>
              <button
                onClick={() => switchMode("signup")}
                disabled={loading}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 12, textDecoration: "underline", cursor: loading ? "not-allowed" : "pointer", padding: 0 }}
              >
                Sign up
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={loading}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 12, textDecoration: "underline", cursor: loading ? "not-allowed" : "pointer", padding: 0 }}
              >
                Forgot password
              </button>
            </div>
          </>
        )}

        {/* Card Number + Valid Thru */}
        <div className="flex items-end justify-between" style={{ position: "absolute", bottom: 16, left: 24, right: 24 }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, fontFamily: "monospace", letterSpacing: "0.12em" }}>
            &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 2026
          </span>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.05em" }}>
            Valid Thru 12/26
          </span>
        </div>
      </div>

      {/* Feature Boxes (disabled/hidden) */}
      {/*
      <div className="flex gap-5 mt-10">
        {[
          { icon: <TrendingUp className="w-6 h-6 text-primary" />, title: "Reward Optimizer", desc: "Maximize points & cashback across every spend category." },
          { icon: <Shield className="w-6 h-6 text-primary" />, title: "Readiness Scoring", desc: "Know your approval odds before you apply." },
          { icon: <Sparkles className="w-6 h-6 text-primary" />, title: "AI Path Advisor", desc: "Personalized strategies to reach your credit goals." },
        ].map((f) => (
          <div key={f.title} className="flex flex-col items-center text-center bg-[#3A322C] rounded-xl px-5 py-6" style={{ width: 148 }}>
            <div className="mb-3 bg-[#1A3A2A] rounded-lg p-2.5">{f.icon}</div>
            <h3 className="text-sm font-semibold text-[#F0EBE3] mb-1">{f.title}</h3>
            <p className="text-xs text-[#B0A898] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
      */}
    </div>
  );
}
