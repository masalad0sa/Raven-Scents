import { useState, useEffect } from "react";
import { Edit2, Check, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useIsMobile } from "../../hooks/useIsMobile";
import {
  FormField,
  sectionHeading,
  iconBtnStyle,
  primaryBtnStyle,
  ghostBtnStyle,
} from "./AccountStyles";

interface Profile {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

export function ProfileTab({ user }: { user: { id: string; email: string } }) {
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<Profile>({ full_name: null, phone: null, avatar_url: null });
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileDraft, setProfileDraft] = useState<Profile>({ full_name: null, phone: null, avatar_url: null });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, [user.id]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) {
      setProfile(data);
      setProfileDraft(data);
    }
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    await supabase.from("profiles").upsert({
      id: user.id,
      ...profileDraft,
      updated_at: new Date().toISOString(),
    });
    setProfile(profileDraft);
    setProfileEditing(false);
    setProfileSaving(false);
  };

  const changePassword = async () => {
    setPasswordMsg(null);
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match" });
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordMsg({ type: "error", text: error.message });
    } else {
      setPasswordMsg({ type: "success", text: "Password updated successfully" });
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordSaving(false);
  };

  return (
    <>
      <div
        style={{
          background: "#111",
          border: "1px solid rgba(212,175,55,0.1)",
          borderRadius: 10,
          padding: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.75rem",
          }}
        >
          <h2 style={sectionHeading}>Personal Info</h2>
          {!profileEditing && (
            <button
              onClick={() => {
                setProfileDraft(profile);
                setProfileEditing(true);
              }}
              style={iconBtnStyle}
            >
              <Edit2 size={14} />
              Edit
            </button>
          )}
        </div>

        {profileEditing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: 480 }}>
            <FormField
              label="Full Name"
              value={profileDraft.full_name ?? ""}
              onChange={(v) => setProfileDraft((d) => ({ ...d, full_name: v }))}
            />
            <FormField
              label="Phone"
              value={profileDraft.phone ?? ""}
              onChange={(v) => setProfileDraft((d) => ({ ...d, phone: v }))}
              type="tel"
              placeholder="+91 98765 43210"
            />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={saveProfile} disabled={profileSaving} style={primaryBtnStyle(profileSaving)}>
                <Check size={13} />
                {profileSaving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => setProfileEditing(false)} style={ghostBtnStyle}>
                <X size={13} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: "1.5rem 2rem",
            }}
          >
            {[
              { label: "Full Name", value: profile.full_name ?? "—" },
              { label: "Email", value: user.email },
              { label: "Phone", value: profile.phone ?? "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.3rem",
                  }}
                >
                  {label}
                </dt>
                <dd
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.95rem",
                    color: "var(--color-text)",
                    margin: 0,
                  }}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {/* Password Change */}
      <div
        style={{
          background: "#111",
          border: "1px solid rgba(212,175,55,0.1)",
          borderRadius: 10,
          padding: isMobile ? "1.5rem" : "2rem",
          marginTop: "1.5rem",
        }}
      >
        <h3 style={sectionHeading}>Change Password</h3>
        <div style={{ display: "grid", gap: "1rem", marginTop: "1.25rem", maxWidth: 400 }}>
          <FormField label="New Password" type="password" value={newPassword} onChange={setNewPassword} placeholder="Min 6 characters" />
          <FormField label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" />
          {passwordMsg && (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.8rem",
                color: passwordMsg.type === "success" ? "var(--color-success)" : "var(--color-error)",
                margin: 0,
              }}
            >
              {passwordMsg.text}
            </p>
          )}
          <button onClick={changePassword} disabled={passwordSaving} style={primaryBtnStyle(passwordSaving)}>
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </>
  );
}
