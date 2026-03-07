import React from "react";

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
      <label
        style={{
          display: "block",
          fontFamily: "var(--font-display)",
          fontSize: "0.58rem",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: "0.4rem",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: "#1a1a1a",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: 6,
          padding: "0.7rem 1rem",
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
  );
}

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
