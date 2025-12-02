// stores/useAuthStore.ts
import { create } from "zustand";
import { authRepository } from "../Repository/authRepository";
import { Session } from "@supabase/supabase-js";
import { User } from "@supabase/supabase-js";
import { LocationBO, SessionBO, UserBO } from "../BOs/AuthBO";
import { TeamMemberBO, teamRepository } from "../Repository/teamRepository";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  email: string;
  password: string;
  loading: boolean;
  user: any | null | UserBO;
  session: Session | null | SessionBO;
  error: string | null;
  currentLocation: string | "";
  allLocations: LocationBO[];
  allTeamMembers: TeamMemberBO[];
  isFromLogin: boolean; // Track if user just logged in
  // Actions
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setCurrentLocation: (location: string) => void;
  setUser: (user: UserBO) => void;
  setSession: (session: SessionBO) => void;
  setIsFromLogin: (isFromLogin: boolean) => void;
  setAllLocations: (locations: LocationBO[]) => void;
  fetchAllLocations: () => Promise<void>;
  setAllTeamMembers: (teamMembers: TeamMemberBO[]) => void;
  fetchAllTeamMembers: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(
  (
    set: (arg0: {
      email?: string;
      password?: string;
      loading?: boolean;
      error?: any;
      user?: UserBO | null;
      session?: SessionBO | Session;
      currentLocation?: string | "";
      allLocations?: LocationBO[];
      allTeamMembers?: TeamMemberBO[];
      isFromLogin?: boolean;
    }) => void,
    get: () => { email: any; password: any }
  ) => ({
    email: "",
    password: "",
    loading: false,
    user: null,
    session: null,
    error: null,
    currentLocation: "",
    allLocations: [],
    allTeamMembers: [],
    isFromLogin: false,
    setEmail: (email: string) => set({ email }),
    setPassword: (password: string) => set({ password }),
    setCurrentLocation: (location: string) =>
      set({ currentLocation: location }),
    setUser: (user: UserBO) => set({ user }),
    setSession: (session: SessionBO | Session) => set({ session }),
    setIsFromLogin: (isFromLogin: boolean) => set({ isFromLogin }),
    setAllLocations: (allLocations: LocationBO[]) => set({ allLocations }),
    fetchAllLocations: async () => {
      try {
        console.log("[AuthStore] Fetching all locations...");
        const locations = await authRepository.getLocationsByIds();
        set({ allLocations: locations });
        console.log(
          "[AuthStore] All locations fetched successfully:",
          locations
        );
      } catch (error: any) {
        console.error("[AuthStore] Error fetching locations:", error.message);
        set({ allLocations: [] });
      }
    },
    setAllTeamMembers: (allTeamMembers: TeamMemberBO[]) =>
      set({ allTeamMembers }),
    fetchAllTeamMembers: async () => {
      try {
        console.log("[AuthStore] Fetching all team members...");
        // Call getTeamMembersByLocation without parameters to get all team members
        const teamMembers = await teamRepository.getTeamMembersByLocation();
        set({ allTeamMembers: teamMembers });
        console.log(
          "[AuthStore] All team members fetched successfully:",
          teamMembers.length
        );
      } catch (error: any) {
        console.error(
          "[AuthStore] Error fetching team members:",
          error.message
        );
        set({ allTeamMembers: [] });
      }
    },
    login: async () => {
      const { email, password } = get();
      set({ loading: true, error: null });

      try {
        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        console.log("[AuthStore] Calling authRepository.login...");
        const response = await authRepository.login(email, password);

        if (response.success) {
          set({
            user: response.user,
            session: response.session,
            currentLocation: response.user.user_metadata.location_id,
            loading: false,
            error: null,
            isFromLogin: true, // Mark that user just logged in
          });

          // Fetch all locations and team members after successful login
          try {
            const [locations, teamMembers] = await Promise.all([
              authRepository.getLocationsByIds(),
              teamRepository.getTeamMembersByLocation(),
            ]);
            set({
              allLocations: locations,
              allTeamMembers: teamMembers,
            });
            console.log(
              "[AuthStore] All locations loaded on login:",
              locations.length
            );
            console.log(
              "[AuthStore] All team members loaded on login:",
              teamMembers.length
            );
          } catch (dataError: any) {
            console.error(
              "[AuthStore] Error loading data on login:",
              dataError.message
            );
          }
        } else {
          const errorMessage = 'error' in response ? response.error : 'Login failed';
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      } catch (err: any) {
        set({ error: err.message || "Unexpected error", loading: false });
        throw err;
      }
    },

    logout: async () => {
      console.log("[AuthStore] Logout called");

      set({ loading: true, error: null });

      try {
        console.log("[AuthStore] Calling authRepository.logout...");
        const response = await authRepository.logout();

        console.log(
          "[AuthStore] Logout response received:",
          JSON.stringify(response, null, 2)
        );

        if (response.success) {
          console.log("[AuthStore] Logout successful, clearing state...");
          // Clear AsyncStorage
          await AsyncStorage.multiRemove([
            "@auth_user",
            "@auth_session",
            "@auth_location",
          ]);
          set({
            user: null,
            session: undefined,
            email: "",
            password: "",
            loading: false,
            error: null,
            isFromLogin: false,
            currentLocation: "",
          });
          console.log("[AuthStore] State cleared successfully");
        } else {
          console.log("[AuthStore] Logout failed:", response.error);
          set({ error: response.error, loading: false });
          throw new Error(response.error);
        }
      } catch (err: any) {
        console.error("[AuthStore] Logout error caught:", err);
        console.error("[AuthStore] Error message:", err.message);
        set({ error: err.message || "Logout failed", loading: false });
        throw err;
      }
    },

    restoreSession: async () => {
      try {
        console.log("[AuthStore] Attempting to restore session...");

        // Try to get stored session from AsyncStorage
        const [storedUser, storedSession, storedLocation] =
          await AsyncStorage.multiGet([
            "@auth_user",
            "@auth_session",
            "@auth_location",
          ]);

        const user = storedUser[1] ? JSON.parse(storedUser[1]) : null;
        const session = storedSession[1] ? JSON.parse(storedSession[1]) : null;
        const location = storedLocation[1] || "";

        if (user && session) {
          console.log("[AuthStore] Session found in storage, restoring...");

          // Verify session is still valid with Supabase
          const {
            data: { session: currentSession },
          } = await authRepository.getSession();

          if (currentSession) {
            console.log("[AuthStore] Session is valid, restoring user state");
            set({
              user,
              session: currentSession,
              currentLocation: location,
              isFromLogin: false,
            });

            // Fetch locations and team members
            try {
              const [locations, teamMembers] = await Promise.all([
                authRepository.getLocationsByIds(),
                teamRepository.getTeamMembersByLocation(),
              ]);
              set({
                allLocations: locations,
                allTeamMembers: teamMembers,
              });
              console.log("[AuthStore] Data loaded after session restore");
            } catch (dataError) {
              console.error("[AuthStore] Error loading data:", dataError);
            }

            return true;
          } else {
            console.log("[AuthStore] Session expired, clearing storage");
            await AsyncStorage.multiRemove([
              "@auth_user",
              "@auth_session",
              "@auth_location",
            ]);
            return false;
          }
        }

        console.log("[AuthStore] No stored session found");
        return false;
      } catch (error) {
        console.error("[AuthStore] Error restoring session:", error);
        return false;
      }
    },

    initializeAuth: async () => {
      console.log("[AuthStore] Initializing authentication...");
      set({ loading: true });

      try {
        // Get the current state to access restoreSession
        const state = useAuthStore.getState();
        const restored = await state.restoreSession();
        if (!restored) {
          console.log("[AuthStore] No valid session, user needs to login");
        }
      } catch (error) {
        console.error("[AuthStore] Error initializing auth:", error);
      } finally {
        set({ loading: false });
      }
    },
  })
);
