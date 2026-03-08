import { useState, useEffect } from "react";
import { Edit2, Check, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useIsMobile } from "../../hooks/useIsMobile";
import {
  FormField,
  sectionHeadingClass,
  iconBtnClass,
  primaryBtnClass,
  ghostBtnClass,
} from "./AccountStyles";
import s from "./ProfileTab.module.css";

interface Profile {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

export function ProfileTab({ user }: { user: { id: string; email: string } }) {
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<Profile>({
    full_name: null,
    phone: null,
    avatar_url: null,
  });
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileDraft, setProfileDraft] = useState<Profile>({
    full_name: null,
    phone: null,
    avatar_url: null,
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
      setPasswordMsg({
        type: "error",
        text: "Password must be at least 6 characters",
      });
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
      setPasswordMsg({
        type: "success",
        text: "Password updated successfully",
      });
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordSaving(false);
  };

  return (
    <>
      <div className={s.card}>
        <div className={s.cardHeader}>
          <h2 className={sectionHeadingClass}>Personal Info</h2>
          {!profileEditing && (
            <button
              onClick={() => {
                setProfileDraft(profile);
                setProfileEditing(true);
              }}
              className={iconBtnClass}
            >
              <Edit2 size={14} />
              Edit
            </button>
          )}
        </div>

        {profileEditing ? (
          <div className={s.editForm}>
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
            <div className={s.editActions}>
              <button
                onClick={saveProfile}
                disabled={profileSaving}
                className={primaryBtnClass(profileSaving)}
              >
                <Check size={13} />
                {profileSaving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setProfileEditing(false)}
                className={ghostBtnClass}
              >
                <X size={13} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <dl
            className={s.infoGrid}
            style={{ gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}
          >
            {[
              { label: "Full Name", value: profile.full_name ?? "—" },
              { label: "Email", value: user.email },
              { label: "Phone", value: profile.phone ?? "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className={s.infoLabel}>{label}</dt>
                <dd className={s.infoValue}>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {/* Password Change */}
      <div
        className={s.passwordCard}
        style={{ padding: isMobile ? "1.5rem" : "2rem" }}
      >
        <h3 className={sectionHeadingClass}>Change Password</h3>
        <div className={s.passwordForm}>
          <FormField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Min 6 characters"
          />
          <FormField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Re-enter password"
          />
          {passwordMsg && (
            <p
              className={s.passwordMsg}
              style={{
                color:
                  passwordMsg.type === "success"
                    ? "var(--color-success)"
                    : "var(--color-error)",
              }}
            >
              {passwordMsg.text}
            </p>
          )}
          <button
            onClick={changePassword}
            disabled={passwordSaving}
            className={primaryBtnClass(passwordSaving)}
          >
            {passwordSaving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </>
  );
}
