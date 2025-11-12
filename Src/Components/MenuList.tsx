import React from "react";
import { View, StyleSheet } from "react-native";
import ListItem from "./ListItem";
import { colors, theme } from "../Constants/colors";

import { MenuItemBO } from "../BOs/MenuItemBO";

interface MenuListProps {
  items: MenuItemBO[];
}

const MenuList: React.FC<MenuListProps> = ({ items }) => {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <ListItem
          key={index}
          title={item.label}
          icon={<item.icon size={20} color={colors.text} />}
          showBadge={item.showBadge}
          badgeValue={item.badgeValue}
          onPress={item.onPress}
          isLast={index === items.length - 1}
        />
      ))}
    </View>
  );
};

export default MenuList;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: theme.spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
});
