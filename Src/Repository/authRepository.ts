import { LocationBO, LoginResponseBO, SessionBO, UserBO } from "../BOs/AuthBO";
import { supabase } from "../Utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const authRepository = {
  async login(email: string, password: string): Promise<LoginResponseBO> {
    try {
      console.log(
        "[AUTH-REPO]Starting login process with email:",
        email,
        "and password:",
        password
      );

      // Add timeout and more detailed logging
      console.log(
        "[AUTH-REPO] Supabase URL:",
        process.env.EXPO_PUBLIC_SUPABASE_URL
      );
      console.log("[AUTH-REPO] Supabase client initialized:", !!supabase);

      // Test basic network connectivity first
      console.log("[AUTH-REPO] Testing network connectivity...");
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const testResponse = await fetch("https://httpbin.org/status/200", {
          method: "GET",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log("[AUTH-REPO] Network test successful:", testResponse.ok);
      } catch (networkError) {
        console.error("[AUTH-REPO] Network test failed:", networkError);
        throw new Error(
          "No internet connection. Please check your network and try again."
        );
      }

      // Test Supabase URL accessibility
      console.log("[AUTH-REPO] Testing Supabase URL accessibility...");
      try {
        const supabaseController = new AbortController();
        const supabaseTimeoutId = setTimeout(
          () => supabaseController.abort(),
          10000
        ); // 10 second timeout

        const supabaseTestResponse = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/`,
          {
            method: "HEAD",
            signal: supabaseController.signal,
            headers: {
              apikey: process.env.EXPO_PUBLIC_SUPABASE_KEY!,
            },
          }
        );

        clearTimeout(supabaseTimeoutId);
        console.log(
          "[AUTH-REPO] Supabase URL test:",
          supabaseTestResponse.status
        );
      } catch (supabaseError) {
        console.error("[AUTH-REPO] Supabase URL test failed:", supabaseError);
        console.log("[AUTH-REPO] Continuing with login attempt anyway...");
      }

      console.log("[AUTH-REPO] Calling supabase.auth.signInWithPassword...");

      // Create a timeout promise to avoid infinite hanging (increased to 30 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error(
                "Login timeout after 30 seconds - Check network connection and Supabase project status"
              )
            ),
          30000
        );
      });

      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("[AUTH-REPO] Waiting for Supabase response...");
      const {
        data,
        error,
      }: {
        data: { user: UserBO | null; session: SessionBO | null };
        error: any;
      } = (await Promise.race([loginPromise, timeoutPromise])) as any;


      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user && data.session) {
        console.log("[AUTH-REPO] Login successful!");
        
        // Store session in AsyncStorage for persistence
        try {
          await AsyncStorage.multiSet([
            ['@auth_user', JSON.stringify(data.user)],
            ['@auth_session', JSON.stringify(data.session)],
            ['@auth_location', data.user.user_metadata?.location_id || '']
          ]);
          console.log("[AUTH-REPO] Session saved to AsyncStorage");
        } catch (storageError) {
          console.error("[AUTH-REPO] Error saving to AsyncStorage:", storageError);
        }
        
        return {
          success: true,
          user: data.user as UserBO,
          session: data.session as SessionBO,
        };
      } else {
        return { success: false, error: "Invalid credentials" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Unexpected error" };
    }
  },

  async logout() {
    try {
      console.log("[AUTH-REPO] Starting logout process...");
      // Clear AsyncStorage
      await AsyncStorage.multiRemove(['@auth_user', '@auth_session', '@auth_location']);
      let response = await supabase.auth.signOut();

      console.log("[AUTH-REPO] Logout response received:", response);
      console.log("[AUTH-REPO] Logout successful");
      return { success: true };
    } catch (err: any) {
      console.error("[AUTH-REPO] Logout error caught:", err);
      console.error("[AUTH-REPO] Error message:", err.message);
      console.error("[AUTH-REPO] Error stack:", err.stack);
      return { success: false, error: err.message || "Unexpected error" };
    }
  },

  async getSession() {
    try {
      return await supabase.auth.getSession();
    } catch (error) {
      console.error("[AUTH-REPO] Error getting session:", error);
      return { data: { session: null }, error };
    }
  },

  async getLocationsByIds(): Promise<LocationBO[]> {
    try {
      const { data, error } = await supabase
        .from("locations") // table name
        .select("*") // or specific cols e.g. "id, name, address"
        // .in("id", locationIds); // `in` lets you query multiple IDs
      console.log("locationrepo", data);
      if (error) {
        console.error("[getLocationsByIds] Error:", error.message);
        throw new Error(error.message);
      }

      return data; // array of location rows
    } catch (err) {
      console.error("[getLocationsByIds] Unexpected error:", err);
      throw err;
    }
  },
};

// {
//   "success": true,
//   "user": {
//     "id": "5c4a4fdc-46d3-441f-8d1a-65c8555899c4",
//     "aud": "authenticated",
//     "role": "authenticated",
//     "email": "abbassays514@gmail.com",
//     "email_confirmed_at": "2025-06-17T13:43:46.435623Z",
//     "phone": "",
//     "confirmed_at": "2025-06-17T13:43:46.435623Z",
//     "last_sign_in_at": "2025-09-12T05:30:42.99616643Z",
//     "app_metadata": {
//       "provider": "email",
//       "providers": [
//         "email"
//       ]
//     },
//     "user_metadata": {
//       "email_verified": true,
//       "is_admin": true,
//       "location_id": "51f127d0-8993-4b19-a60e-b515a8e50fa7",
//       "locations": [
//         "51f127d0-8993-4b19-a60e-b515a8e50fa7"
//       ]
//     },
//     "identities": [
//       {
//         "identity_id": "8f9f391f-2c1e-4401-a22f-dee6e0dbdfe1",
//         "id": "5c4a4fdc-46d3-441f-8d1a-65c8555899c4",
//         "user_id": "5c4a4fdc-46d3-441f-8d1a-65c8555899c4",
//         "identity_data": {
//           "email": "abbassays514@gmail.com",
//           "email_verified": false,
//           "phone_verified": false,
//           "sub": "5c4a4fdc-46d3-441f-8d1a-65c8555899c4"
//         },
//         "provider": "email",
//         "last_sign_in_at": "2025-06-17T13:43:46.428695Z",
//         "created_at": "2025-06-17T13:43:46.428756Z",
//         "updated_at": "2025-06-17T13:43:46.428756Z",
//         "email": "abbassays514@gmail.com"
//       }
//     ],
//     "created_at": "2025-06-17T13:43:46.417487Z",
//     "updated_at": "2025-09-12T05:30:43.044495Z",
//     "is_anonymous": false
//   },
//   "session": {
//     "access_token": "eyJhbGciOiJIUzI1NiIsImtpZCI6IkoyVnBQQWVVMVhMeFRyUmgiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2RkaG50bGphYW11ZGtxdWFyeXJqLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI1YzRhNGZkYy00NmQzLTQ0MWYtOGQxYS02NWM4NTU1ODk5YzQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU3NjU4NjQzLCJpYXQiOjE3NTc2NTUwNDMsImVtYWlsIjoiYWJiYXNzYXlzNTE0QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzX2FkbWluIjp0cnVlLCJsb2NhdGlvbl9pZCI6IjUxZjEyN2QwLTg5OTMtNGIxOS1hNjBlLWI1MTVhOGU1MGZhNyIsImxvY2F0aW9ucyI6WyI1MWYxMjdkMC04OTkzLTRiMTktYTYwZS1iNTE1YThlNTBmYTciXX0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTc2NTUwNDN9XSwic2Vzc2lvbl9pZCI6ImMyMzUxZmI5LTE0MjItNGY5Ny05ZGI2LWRlOGU4MzY3MTc2NCIsImlzX2Fub255bW91cyI6ZmFsc2V9.T17Z1Mkf3ZJ8AK3v6y3d3q2pYNwsPrWc6gqVpYbVYlQ",
//     "token_type": "bearer",
//     "expires_in": 3600,
//     "expires_at": 1757658643,
//     "refresh_token": "td4d7uf3zqg2",
//     "user": {
//       "id": "5c4a4fdc-46d3-441f-8d1a-65c8555899c4",
//       "aud": "authenticated",
//       "role": "authenticated",
//       "email": "abbassays514@gmail.com",
//       "email_confirmed_at": "2025-06-17T13:43:46.435623Z",
//       "phone": "",
//       "confirmed_at": "2025-06-17T13:43:46.435623Z",
//       "last_sign_in_at": "2025-09-12T05:30:42.99616643Z",
//       "app_metadata": {
//         "provider": "email",
//         "providers": [
//           "email"
//         ]
//       },
//       "user_metadata": {
//         "email_verified": true,
//         "is_admin": true,
//         "location_id": "51f127d0-8993-4b19-a60e-b515a8e50fa7",
//         "locations": [
//           "51f127d0-8993-4b19-a60e-b515a8e50fa7"
//         ]
//       },
//       "identities": [
//         {
//           "identity_id": "8f9f391f-2c1e-4401-a22f-dee6e0dbdfe1",
//           "id": "5c4a4fdc-46d3-441f-8d1a-65c8555899c4",
//           "user_id": "5c4a4fdc-46d3-441f-8d1a-65c8555899c4",
//           "identity_data": {
//             "email": "abbassays514@gmail.com",
//             "email_verified": false,
//             "phone_verified": false,
//             "sub": "5c4a4fdc-46d3-441f-8d1a-65c8555899c4"
//           },
//           "provider": "email",
//           "last_sign_in_at": "2025-06-17T13:43:46.428695Z",
//           "created_at": "2025-06-17T13:43:46.428756Z",
//           "updated_at": "2025-06-17T13:43:46.428756Z",
//           "email": "abbassays514@gmail.com"
//         }
//       ],
//       "created_at": "2025-06-17T13:43:46.417487Z",
//       "updated_at": "2025-09-12T05:30:43.044495Z",
//       "is_anonymous": false
//     },
//     "weak_password": null
//   }
// }
