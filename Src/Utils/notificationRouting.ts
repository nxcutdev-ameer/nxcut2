import { Alert } from 'react-native';
import { navigationRef } from '../Navigations/navigationRef';
import { supabase } from '../Utils/supabase';

export type NotificationRouteData = {
  title?: string;
  body?: string;
  appointment_id?: string;
  appointmentId?: string;
  saleId?: string;
  [key: string]: any;
};

export async function routeFromNotificationData(payload: NotificationRouteData) {
  const title = (payload?.title || '').toLowerCase();
  const body = payload?.body || '';
  const appointmentId = payload?.appointment_id || payload?.appointmentId;

  const navigateSafe = (name: string, params?: any) => {
    try {
      if (navigationRef.isReady()) navigationRef.navigate(name as any, params);
    } catch (_e) {}
  };

  // Appointments related
  if (title.includes('new appointment')) {
    if (appointmentId) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('status')
          .eq('id', appointmentId)
          .single();
        if (!error && data && typeof (data as any).status === 'string') {
          const status = ((data as any).status || '').toLowerCase();
          if (status === 'canceled' || status === 'cancelled') {
            Alert.alert('Appointment Canceled', 'This appointment was canceled.');
            return navigateSafe('NotificationScreen');
          }
        }
      } catch {}
      return navigateSafe('CreateAppointment', {
        mode: 'edit',
        appointmentId,
      });
    }
    Alert.alert('Appointment', 'No appointment id found for this notification.');
    return navigateSafe('NotificationScreen');
  }
  if (title.includes('appointment canceled') || title.includes('appointment cancelled')) {
    Alert.alert('Appointment Canceled', 'This appointment was canceled.');
    return navigateSafe('NotificationScreen');
  }

  // Tips / Discounts / Sales related
  if (
    title.includes('discounts & tips applied') ||
    title.includes('tip added') ||
    title.includes('manual discount') ||
    title.includes('voucher applied') ||
    title.includes('membership discount') ||
    title.includes('discount applied') ||
    title.includes('voucher sold') ||
    title.includes('membership sold')
  ) {
    // Special case: Voucher/Membership sold -> show an alert only (no navigation)
    if (title.includes('voucher sold') || title.includes('membership sold')) {
      Alert.alert(payload.title || 'Sale', payload.body || 'A sale item was created.');
      return navigateSafe('NotificationScreen');
    }
    let saleId = payload?.saleId as string | undefined;

    // Preferred: resolve by joining sales on appointment_id
    if (!saleId && appointmentId) {
      try {
        const { data } = await supabase
          .from('sales')
          .select('id')
          .eq('appointment_id', appointmentId)
          .order('created_at', { ascending: false })
          .limit(1);
        if (data && data.length) {
          saleId = (data[0] as any).id as string;
        }
      } catch {}
    }

    // Fallback parse from body
    if (!saleId && body) {
      const m = body.match(/sale[_\s-]*id[:#\s-]*([A-Za-z0-9_-]+)/i);
      saleId = m?.[1];
    }

    if (!saleId) {
      Alert.alert('Sale not found', 'Could not find a related sale for this notification.');
      return navigateSafe('NotificationScreen');
    }

    return navigateSafe('TransactionDetailsScreen', { saleId });
  }

  // Products / stock
  if (title.includes('product low stock')) {
    Alert.alert('Product Low stock', payload.body);
    return navigateSafe('NotificationScreen');
  }

  // Default
  return navigateSafe('NotificationScreen');
}
