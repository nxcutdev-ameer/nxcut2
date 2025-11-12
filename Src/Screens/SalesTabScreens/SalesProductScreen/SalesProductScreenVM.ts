import { NavigationProp, useNavigation } from "@react-navigation/native";

const useSalesProductScreenVM = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  return { navigation };
};

export default useSalesProductScreenVM;
