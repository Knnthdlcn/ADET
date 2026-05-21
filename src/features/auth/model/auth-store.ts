import { create } from "zustand";

type AuthState = {
  isSignedIn: boolean;
  user: {
    name: string;
    email: string;
    membershipStatus: string;
    accessibilitySummary: string;
  };
  updateUser: (payload: Partial<AuthState["user"]>) => void;
  signIn: () => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isSignedIn: false,
  user: {
    name: "Kenneth User",
    email: "kenneth@example.com",
    membershipStatus: "Assistive Vision demo member",
    accessibilitySummary: "Voice feedback and auto-read results are enabled.",
  },
  updateUser: (payload) =>
    set((state) => ({
      user: {
        ...state.user,
        ...payload,
      },
    })),
  signIn: () => set({ isSignedIn: true }),
  signOut: () => set({ isSignedIn: false }),
}));
