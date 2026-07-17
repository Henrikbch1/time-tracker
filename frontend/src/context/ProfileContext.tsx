import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { readProfile, writeProfile, type UserProfile } from "../lib/cookies";

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  color: "#4f46e5",
};

interface ProfileContextValue {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  initials: string;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

function deriveInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

export function ProfileProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [profile, setProfileState] = useState<UserProfile>(
    () => readProfile() ?? DEFAULT_PROFILE,
  );

  const setProfile = (next: UserProfile) => setProfileState(next);

  useEffect(() => {
    writeProfile(profile);
  }, [profile]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      setProfile,
      initials: deriveInitials(profile.name),
    }),
    [profile],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
