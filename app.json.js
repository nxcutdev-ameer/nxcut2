export default {
  expo: {
    name: "nxcut",
    slug: "nxcut",
    version: "1.0.9",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    userInterfaceStyle: "light",
    ios: {
      bundleIdentifier: "com.qdealsllc.nxcut",
      buildNumber: "9"
    },
    android: {
      package: "com.qdealsllc.nxcut",
      versionCode: 9,
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff"
      }
    },
    plugins: [
      "expo-splash-screen",
      "expo-system-ui"
    ],
    updates: {
      url: "https://u.expo.dev/YOUR-UPDATE-ID"
    },
    runtimeVersion: {
      policy: "sdkVersion"
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY,
      supabaseGraphqlUrl: process.env.EXPO_PUBLIC_SUPABASE_GRAPHQL_URL,
      baseUrl: process.env.BASE_URL
    }
  }
};
