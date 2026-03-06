import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useWishlistStore } from "../store/wishlistStore";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/shop";

  const { login, isLoading } = useAuthStore();
  const { syncToSupabase, hydrate } = useWishlistStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error: loginError } = await login(email, password);
    if (loginError) {
      setError(loginError);
      return;
    }
    // Get the current user after login
    const {
      data: { user },
    } = await import("../lib/supabase").then((m) => m.supabase.auth.getUser());
    if (user) {
      await syncToSupabase(user.id);
      await hydrate(user.id);
    }
    navigate(from, { replace: true });
  };

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
              Sign In to Your Account
            </h1>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={{
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
                }}
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
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-display)",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    background: "#1a1a1a",
                    border: "1px solid rgba(212,175,55,0.2)",
                    borderRadius: 6,
                    padding: "0.75rem 3rem 0.75rem 1rem",
                    color: "var(--color-text)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9rem",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
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
                  style={{
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
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p
                style={{
                  color: "#f87171",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.8rem",
                  margin: 0,
                  padding: "0.75rem 1rem",
                  background: "rgba(248,113,113,0.08)",
                  borderRadius: 6,
                  border: "1px solid rgba(248,113,113,0.2)",
                }}
              >
                {error}
              </p>
            )}

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
              <LogIn size={14} />
              {isLoading ? "Signing In…" : "Sign In"}
            </button>
          </form>

          {/* Footer links */}
          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid rgba(212,175,55,0.1)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
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
              Don't have an account?{" "}
              <Link
                to="/signup"
                style={{ color: "var(--color-gold)", textDecoration: "none" }}
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
