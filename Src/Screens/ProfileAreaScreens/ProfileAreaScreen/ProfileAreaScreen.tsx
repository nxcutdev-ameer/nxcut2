import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { colors } from "../../../Constants/colors";
import {
  ArrowLeft,
  User,
  Image,
  Star,
  Briefcase,
  Settings,
  Gift,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react-native";
import { ProfileAreaScreenStyles } from "./ProfileAreaStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import useProfileAreaScreenVM from "./ProfileAreaScreenVM";

const ProfileAreaScreen = () => {
  const { navigation, handleLogout, session } = useProfileAreaScreenVM();

  const MenuItem = ({
    label,
    icon: IconComponent,
    isDanger,
    onPress,
  }: {
    label: string;
    icon: any;
    isDanger?: boolean;
    onPress?: () => void;
  }) => {
    return (
      <TouchableOpacity
        style={ProfileAreaScreenStyles.menuItem}
        onPress={onPress}
      >
        <View style={ProfileAreaScreenStyles.menuLeft}>
          {React.isValidElement(IconComponent) ? (
            IconComponent
          ) : (
            <IconComponent
              size={20}
              color={isDanger ? colors.danger : colors.text}
            />
          )}
          <Text
            style={[
              ProfileAreaScreenStyles.menuLabel,
              isDanger && { color: colors.danger },
            ]}
          >
            {label}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };
  return (
    <SafeAreaView style={ProfileAreaScreenStyles.mainContainer}>
      <ScrollView scrollEnabled={false} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={ProfileAreaScreenStyles.header}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Profile Info */}
        <View style={ProfileAreaScreenStyles.profileSection}>
          <Text style={ProfileAreaScreenStyles.subTitle}>Personal area</Text>
          <Text style={ProfileAreaScreenStyles.userName}>
            {session?.user.email?.split("@")[0]}
          </Text>
          <Text> {session?.user.user_metadata.location_id}</Text>
          <Text style={ProfileAreaScreenStyles.mutedText}>No reviews yet</Text>
          <View style={ProfileAreaScreenStyles.profileCircle}>
            <Text style={ProfileAreaScreenStyles.profileInitial}>
              {session?.user.email?.slice(0, 1).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Email Verification Banner */}
        <TouchableOpacity
          disabled={true}
          style={ProfileAreaScreenStyles.verifyBanner}
        >
          <Text style={ProfileAreaScreenStyles.verifyTitle}>
            Verify your email address
          </Text>
          <Text style={ProfileAreaScreenStyles.verifySubtitle}>
            Secure your account
          </Text>
        </TouchableOpacity>

        {/* Settings Group 1 */}
        <View style={ProfileAreaScreenStyles.card}>
          {/* <MenuItem label="Profile" icon={User} />
          <MenuItem label="Portfolio" icon={Image} />
          <MenuItem label="Reviews" icon={Star} />
          <MenuItem label="Workspaces" icon={Briefcase} /> */}
          <MenuItem
            label="Personal settings"
            icon={Settings}
            onPress={() => navigation.navigate("LocationScreen")}
          />
        </View>

        {/* Settings Group 2 */}
        <View style={ProfileAreaScreenStyles.card}>
          {/* <MenuItem label="Refer a friend" icon={Gift} />
          <MenuItem label="Help and support" icon={HelpCircle} />
          <MenuItem
            label="English"
            icon={() => <Text style={{ fontSize: 18 }}>🇬🇧</Text>}
          /> */}
          <MenuItem
            label="Log out"
            icon={LogOut}
            isDanger
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable Menu Item

export default ProfileAreaScreen;
