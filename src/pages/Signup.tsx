import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useWishlistStore } from "../store/wishlistStore";
import { Header, Footer } from "../components/layout";
import s from "./styles/Signup.module.css";

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
        <main className={s.main}>
          <div className={s.cardCenter}>
            <div className={s.emailIcon}>✉</div>
            <h2 className={s.emailTitle}>Check Your Email</h2>
            <p className={s.emailText}>
              We sent a confirmation link to{" "}
              <strong className={s.emailHighlight}>{email}</strong>. Click it to
              activate your account and start shopping.
            </p>
            <Link to="/login" className={s.backBtn}>
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
      <main className={s.main}>
        <div className={s.card}>
          {/* Heading */}
          <div className={s.heading}>
            <Link to="/" className={s.brand}>
              RAVEN
            </Link>
            <h1 className={s.subtitle}>Create Your Account</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={s.form}>
            {/* Full Name */}
            <div>
              <label className={s.label}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Jane Doe"
                className={s.input}
              />
            </div>

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
                  placeholder="Min. 8 characters"
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

            {/* Confirm Password */}
            <div>
              <label className={s.label}>Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat password"
                className={s.input}
              />
            </div>

            {/* Error */}
            {error && <p className={s.error}>{error}</p>}

            {/* Submit */}
            <button type="submit" disabled={isLoading} className={s.submitBtn}>
              <UserPlus size={14} />
              {isLoading ? "Creating Account…" : "Create Account"}
            </button>
          </form>

          {/* Footer links */}
          <div className={s.footer}>
            <p className={s.footerText}>
              Already have an account?{" "}
              <Link to="/login" className={s.footerLink}>
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
