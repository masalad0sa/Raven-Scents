import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useWishlistStore } from "../store/wishlistStore";
import { Header, Footer } from "../components/layout";
import s from "./styles/Login.module.css";

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
      <main className={s.main}>
        <div className={s.card}>
          {/* Heading */}
          <div className={s.heading}>
            <Link to="/" className={s.brand}>
              RAVEN
            </Link>
            <h1 className={s.subtitle}>Sign In to Your Account</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={s.form}>
            {/* Email */}
            <div>
              <label className={s.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className={s.input}
              />
            </div>

            {/* Password */}
            <div>
              <label className={s.label}>Password</label>
              <div className={s.passwordWrap}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={s.inputWithIcon}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={s.eyeBtn}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && <p className={s.error}>{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={s.submitBtn}
            >
              <LogIn size={14} />
              {isLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Footer links */}
          <div className={s.footer}>
            <p className={s.footerText}>
              Don't have an account?{" "}
              <Link to="/signup" className={s.footerLink}>
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
