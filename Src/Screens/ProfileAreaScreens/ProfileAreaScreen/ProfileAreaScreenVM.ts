import { useNavigation } from "@react-navigation/native";
import { useAuthStore } from "../../../Store/useAuthStore";

const useProfileAreaScreenVM = () => {
  const navigation: any = useNavigation();
  const { logout ,session} = useAuthStore();
  const handleLogout = async () => {
    try {
      await logout();
      console.log(
        "[ProfileAreaScreen] Logout successful, navigating to login..."
      );
      // Navigate to login screen after successful logout
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      });
    } catch (error) {
      console.error("[ProfileAreaScreen] Logout failed:", error);
      // You could show an alert here or handle the error as needed
    }
  };

  return {
    handleLogout,
    navigation,
    session,
  };
};

export default useProfileAreaScreenVM;
