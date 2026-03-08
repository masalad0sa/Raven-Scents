import React from "react";
import s from "./AccountStyles.module.css";

export function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={s.formLabel}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={s.formInput}
      />
    </div>
  );
}

export const sectionHeadingClass = s.sectionHeading;
export const iconBtnClass = s.iconBtn;
export const primaryBtnClass = (disabled: boolean) =>
  `${s.primaryBtn}${disabled ? ` ${s.primaryBtnDisabled}` : ""}`;
export const ghostBtnClass = s.ghostBtn;

/* Keep legacy exports for backward compat during migration */
export const sectionHeading: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "var(--color-text)",
  margin: 0,
};

export const iconBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  background: "none",
  border: "1px solid rgba(212,175,55,0.2)",
  borderRadius: 6,
  padding: "0.4rem 0.8rem",
  color: "var(--color-text-muted)",
  cursor: "pointer",
  fontFamily: "var(--font-display)",
  fontSize: "0.62rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  transition: "all 0.2s",
};

export const primaryBtnStyle = (disabled: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  background: disabled ? "rgba(212,175,55,0.5)" : "var(--color-gold)",
  color: "#0d0d0d",
  border: "none",
  borderRadius: 6,
  padding: "0.6rem 1.2rem",
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "var(--font-display)",
  fontSize: "0.65rem",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  transition: "opacity 0.2s",
});

export const ghostBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  background: "none",
  border: "1px solid rgba(212,175,55,0.2)",
  borderRadius: 6,
  padding: "0.6rem 1rem",
  color: "var(--color-text-muted)",
  cursor: "pointer",
  fontFamily: "var(--font-display)",
  fontSize: "0.65rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  transition: "all 0.2s",
};
