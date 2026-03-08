import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import s from "./ProtectedRoute.module.css";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized) {
    return (
      <div className={s.loadingWrap}>
        <p className={s.loadingText}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
