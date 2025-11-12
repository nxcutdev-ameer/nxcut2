import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

console.log("[SUPABASE] Initializing with URL:", supabaseUrl);
console.log("[SUPABASE] Anon key present:", !!supabaseAnonKey);
console.log("[SUPABASE] Anon key length:", supabaseAnonKey?.length);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[SUPABASE] Missing environment variables!");
  console.error("[SUPABASE] URL:", supabaseUrl);
  console.error("[SUPABASE] KEY:", supabaseAnonKey ? "Present" : "Missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // 👈 critical for React Native
  },
});

console.log("[SUPABASE] Client created successfully:", !!supabase);
