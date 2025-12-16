import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './RootStackNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: any, params?: any) {
  try {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name as never, params as never);
    }
  } catch (_e) {}
}
