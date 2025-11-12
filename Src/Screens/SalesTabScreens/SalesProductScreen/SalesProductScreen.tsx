import { Text, View } from "react-native";
import React from "react";
import useSalesLogScreenVM from "../../MoreTabScreens/SalesLogScreen/SalesLogScreenVM";

const SalesProductScreen = () => {
  const { navigation } = useSalesLogScreenVM();
  return (
    <View>
      <Text>SalesProductScreen</Text>
    </View>
  );
};

export default SalesProductScreen;
