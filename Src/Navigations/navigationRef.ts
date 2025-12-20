import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './RootStackNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

type NavigateArgs<RouteName extends keyof RootStackParamList> =
  undefined extends RootStackParamList[RouteName]
    ? [screen: RouteName] | [screen: RouteName, params: RootStackParamList[RouteName]]
    : [screen: RouteName, params: RootStackParamList[RouteName]];

export function navigate<RouteName extends keyof RootStackParamList>(
  ...args: NavigateArgs<RouteName>
) {
  try {
    if (navigationRef.isReady()) {
      navigationRef.navigate(...(args as any));
    }
  } catch (_e) {}
}
