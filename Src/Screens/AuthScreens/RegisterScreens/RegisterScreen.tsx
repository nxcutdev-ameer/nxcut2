import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Text,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import { ArrowLeft } from "lucide-react-native";
import colors from "../../../Constants/colors";
import {
  fontEq,
  getHeightEquivalent,
  getWidthEquivalent,
} from "../../../Utils/helpers";

const RegisterScreen = () => {
  const navigation: any = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    Alert.alert(
      "Connection Error",
      "Unable to load the registration page. Please check your internet connection and try again.",
      [
        {
          text: "Retry",
          onPress: () => {
            setError(false);
            setLoading(true);
          },
        },
        {
          text: "Go Back",
          onPress: () => navigation.goBack(),
          style: "cancel",
        },
      ]
    );
  };

  const handleOpenExternalWebsite = async () => {
    try {
      const supported = await Linking.canOpenURL("https://nxcut.com/");
      if (supported) {
        await Linking.openURL("https://nxcut.com/");
      } else {
        Alert.alert("Error", "Unable to open the website in your browser.");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to open the website in your browser.");
    }
  };

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      style={[styles.container, { backgroundColor: colors.colors.white }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.colors.text} />
          <Text
            style={{
              color: colors.colors.text,
              fontSize: fontEq(20),
              marginLeft: getWidthEquivalent(5),
              fontWeight: "600",
            }}
          >
            Back
          </Text>
        </TouchableOpacity>
        {/* Logo Section */}
        <View
          style={[
            styles.logoSection,
            // { backgroundColor: colors.colors.surface },
          ]}
        >
          <Image
            source={require("../../../Assets/Images/nxcut.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* WebView Section */}
      <View style={styles.webviewContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.colors.primary} />
          </View>
        )}

        {!error && (
          <WebView
            source={{ uri: "https://nxcut.com/" }}
            style={styles.webview}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            startInLoadingState={true}
            scalesPageToFit={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={true}
            allowsBackForwardNavigationGestures={false}
            domStorageEnabled={true}
            javaScriptEnabled={true}
            mixedContentMode="compatibility"
            thirdPartyCookiesEnabled={false}
            scrollEnabled={true}
            onShouldStartLoadWithRequest={(request) => {
              // Allow the initial load, block all other navigation
              return request.url === "https://nxcut.com/";
            }}
            allowsLinkPreview={false}
            allowsInlineMediaPlayback={false}
            mediaPlaybackRequiresUserAction={true}
            injectedJavaScript={`
              // Disable all form submissions and link clicks after page loads
              setTimeout(() => {
                const style = document.createElement('style');
                style.textContent = \`
                  * {
                    user-select: none !important;
                    -webkit-user-select: none !important;
                    -webkit-touch-callout: none !important;
                  }
                  a, button, input, select, textarea, form {
                    pointer-events: none !important;
                    cursor: default !important;
                  }
                  a:hover, button:hover {
                    text-decoration: none !important;
                  }
                \`;
                document.head.appendChild(style);

                // Disable all click events
                document.addEventListener('click', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }, true);

                // Disable all form submissions
                document.addEventListener('submit', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }, true);
              }, 1000);
              true;
            `}
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
          />
        )}
      </View>

      {/* External Website Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.externalButton}
          onPress={handleOpenExternalWebsite}
          activeOpacity={0.8}
        >
          <Text style={styles.externalButtonText}>Check Our Website!</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: getWidthEquivalent(20),
    // paddingVertical: getHeightEquivalent(12),
    borderBottomWidth: 1,
    // borderWidth:1,
    borderBottomColor: colors.colors.primaryDark,
  },
  backButton: {
    padding: getWidthEquivalent(8),
    marginLeft: -getWidthEquivalent(8),
    flexDirection: "row",
    alignItems: "center",
  },
  logoSection: {
    alignItems: "center",
    //paddingVertical: getHeightEquivalent(20),
    // borderBottomWidth: 1,
    borderBottomColor: colors.colors.border,
    alignSelf: "center",
  },
  logo: {
    width: getWidthEquivalent(140),
    height: getHeightEquivalent(60),
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: colors.colors.background,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.colors.background,
    zIndex: 1,
  },
  buttonContainer: {
    paddingHorizontal: getWidthEquivalent(20),
    paddingVertical: getHeightEquivalent(16),
    paddingBottom: getHeightEquivalent(32),
  },
  externalButton: {
    backgroundColor: colors.colors.primary,
    borderRadius: getWidthEquivalent(12),
    paddingVertical: getHeightEquivalent(16),
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: colors.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  externalButtonText: {
    color: colors.colors.white,
    fontSize: fontEq(16),
    fontWeight: "600",
    textAlign: "center",
  },
});

export default RegisterScreen;
