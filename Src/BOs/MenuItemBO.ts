import { LucideIcon } from "lucide-react-native";

export interface MenuItemBO {
  label: string;
  icon: LucideIcon; // Any Lucide icon component
  onPress: () => void;
  showBadge?: boolean;
  badgeValue?: number | string;
}
