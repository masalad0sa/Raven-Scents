import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useWishlistStore } from "../store/wishlistStore";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();
  const { syncToSupabase, hydrate } = useWishlistStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { error: signupError } = await signup(email, password, fullName);
    if (signupError) {
      setError(signupError);
      return;
    }

    // Try to get the user right away (may work if email confirmation is disabled)
    const { supabase } = await import("../lib/supabase");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await syncToSupabase(user.id);
      await hydrate(user.id);
      navigate("/shop", { replace: true });
    } else {
      // Email confirmation flow
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <>
        <Header />
        <main
          style={{
            minHeight: "100vh",
            background: "var(--color-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6rem 1rem 4rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              background: "#111",
              border: "1px solid rgba(212,175,55,0.15)",
              borderRadius: 12,
              padding: "3rem 2.5rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(212,175,55,0.1)",
                border: "1px solid rgba(212,175,55,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "1.5rem",
              }}
            >
              ✉
            </div>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.5rem",
                color: "var(--color-gold)",
                margin: "0 0 1rem",
              }}
            >
              Check Your Email
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-muted)",
                lineHeight: 1.7,
                margin: "0 0 2rem",
              }}
            >
              We sent a confirmation link to{" "}
              <strong style={{ color: "var(--color-text)" }}>{email}</strong>.
              Click it to activate your account and start shopping.
            </p>
            <Link
              to="/login"
              style={{
                display: "inline-block",
                background: "var(--color-gold)",
                color: "#0d0d0d",
                textDecoration: "none",
                borderRadius: 6,
                padding: "0.75rem 2rem",
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Back to Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6rem 1rem 4rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: "#111",
            border: "1px solid rgba(212,175,55,0.15)",
            borderRadius: 12,
            padding: "3rem 2.5rem",
          }}
        >
          {/* Heading */}
          <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
            <Link
              to="/"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.8rem",
                fontWeight: 500,
                color: "var(--color-gold)",
                letterSpacing: "0.08em",
                textDecoration: "none",
                display: "block",
                marginBottom: "0.75rem",
              }}
            >
              RAVEN
            </Link>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--color-text)",
                margin: 0,
              }}
            >
              Create Your Account
            </h1>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {/* Full Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Jane Doe"
                style={inputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-gold)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)")
                }
              />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={inputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-gold)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)")
                }
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 8 characters"
                  style={{ ...inputStyle, paddingRight: "3rem" }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-gold)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeButtonStyle}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat password"
                style={inputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--color-gold)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)")
                }
              />
            </div>

            {/* Error */}
            {error && <p style={errorStyle}>{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: isLoading
                  ? "rgba(212,175,55,0.5)"
                  : "var(--color-gold)",
                color: "#0d0d0d",
                border: "none",
                borderRadius: 6,
                padding: "0.9rem 1.5rem",
                fontFamily: "var(--font-display)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "opacity 0.2s",
                width: "100%",
                marginTop: "0.25rem",
              }}
            >
              <UserPlus size={14} />
              {isLoading ? "Creating Account…" : "Create Account"}
            </button>
          </form>

          {/* Footer links */}
          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(212,175,55,0.1)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{ color: "var(--color-gold)", textDecoration: "none" }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-display)",
  fontSize: "0.6rem",
  fontWeight: 600,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
  marginBottom: "0.5rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#1a1a1a",
  border: "1px solid rgba(212,175,55,0.2)",
  borderRadius: 6,
  padding: "0.75rem 1rem",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const eyeButtonStyle: React.CSSProperties = {
  position: "absolute",
  right: "0.75rem",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  color: "var(--color-text-muted)",
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
};

const errorStyle: React.CSSProperties = {
  color: "#f87171",
  fontFamily: "var(--font-body)",
  fontSize: "0.8rem",
  margin: 0,
  padding: "0.75rem 1rem",
  background: "rgba(248,113,113,0.08)",
  borderRadius: 6,
  border: "1px solid rgba(248,113,113,0.2)",
};
