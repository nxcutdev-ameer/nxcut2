import type { NotificationRouteData } from './notificationRouting';

let _pending: NotificationRouteData | null = null;

export function setPendingNotificationRoute(data: NotificationRouteData) {
  _pending = data;
}

export function consumePendingNotificationRoute(): NotificationRouteData | null {
  const d = _pending;
  _pending = null;
  return d;
}
