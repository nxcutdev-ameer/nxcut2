import {} from "react-native";
import React, { use, useEffect, useMemo, useState } from "react";
import {
  AppointmentCalanderBO,
  appointmentsRepository,
} from "../../../Repository/appointmentsRepository";
import { useAppointmentStore } from "../../../Store/useAppointmentStore";
import { useAuthStore } from "../../../Store/useAuthStore";
import { useToast } from "../../../Hooks/useToast";
interface StaffCalendar {
  staffName: string;
  staffId: string;
  staffAppointments: {
    title: string;
    start: Date;
    end: Date;
    data: AppointmentCalanderBO;
  }[];
}
const useCalanderScreenVM = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { calanderAppointmentsData, fetchCalanderAppointmentsData } =
    useAppointmentStore();
  const { isFromLogin, setIsFromLogin, user, allLocations, allTeamMembers } = useAuthStore();
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const { toast, showComingSoon, hideToast } = useToast();

  // Filter panel state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [pageFilter, setPageFilter] = useState({
    location_ids: allLocations.map((location) => location.id),
  });
  // Temporary filter state for the modal (only applied when "Apply" is pressed)
  const [tempPageFilter, setTempPageFilter] = useState({
    location_ids: allLocations.map((location) => location.id),
  });
  useEffect(() => {
    // Skip initial fetch if coming from login (data already hydrated)
    if (isFromLogin && !hasInitialLoad) {
      console.log("[CalendarVM] Coming from login flow, using preloaded data");
      setHasInitialLoad(true);
      setIsFromLogin(false); // Reset flag
      return;
    }

    // Only fetch if this is a date change or fresh load without preloaded data
    if (!isFromLogin || hasInitialLoad) {
      console.log(
        "[CalendarVM] Fetching calendar data for date:",
        currentDate.toISOString()
      );
      fetchCalanderAppointmentsData(
        currentDate.toISOString(),
        pageFilter.location_ids.length > 0 ? pageFilter.location_ids : undefined
      );
    }
  }, [currentDate, isFromLogin]);

  // Refetch data when filter changes
  useEffect(() => {
    if (hasInitialLoad || !isFromLogin) {
      console.log("[CalendarVM] Refetching data due to filter change");
      fetchCalanderAppointmentsData(
        currentDate.toISOString(),
        pageFilter.location_ids.length > 0 ? pageFilter.location_ids : undefined
      );
    }
  }, [pageFilter]);

  const calanderData = useMemo(() => {
    return transformAppointmentsToCalendar(
      calanderAppointmentsData,
      allTeamMembers,
      pageFilter.location_ids
    );
  }, [calanderAppointmentsData, allTeamMembers, pageFilter.location_ids]);

  function transformAppointmentsToCalendar(
    appointments: AppointmentCalanderBO[],
    allStaff: any[],
    filteredLocationIds: string[]
  ): StaffCalendar[] {
    const grouped: Record<string, StaffCalendar> = {};

    // First, initialize all staff members from filtered locations with empty appointment arrays
    const staffInFilteredLocations = allStaff.filter((staff) => {
      // Only show team members who are visible to clients
      if (!staff.visible_to_clients) return false;
      
      // If no locations are filtered (all selected), show all staff
      if (filteredLocationIds.length === 0) return true;
      // Otherwise, check if staff belongs to any of the filtered locations
      return filteredLocationIds.includes(staff.location_id);
    });

    staffInFilteredLocations.forEach((staff) => {
      const staffName = staff.first_name || "Unknown Staff";
      const staffId = staff.id;
      
      grouped[staffId] = {
        staffName,
        staffId,
        staffAppointments: [],
      };
    });

    // Then, add appointments to their respective staff
    appointments.forEach((appt) => {
      // Add null checks for staff and client
      if (!appt.staff || !appt.appointment || !appt.appointment.client) {
        console.warn("[CalendarVM] Skipping appointment with missing staff or client data", appt);
        return;
      }

      const staffId = appt.staff.id;

      // Only add appointment if the staff is in the filtered locations
      if (!grouped[staffId]) {
        // Staff not in filtered locations, skip this appointment
        return;
      }

      // Split date and time
      const [year, month, day] = appt.appointment.appointment_date
        .split("-")
        .map(Number); // month 1-based
      const [startHour, startMinute] = appt.start_time.split(":").map(Number);
      const [endHour, endMinute] = appt.end_time.split(":").map(Number);

      // Construct JS Dates (month is 0-based)
      const start = new Date(year, month - 1, day, startHour, startMinute);
      const end = new Date(year, month - 1, day, endHour, endMinute);

      const clientName = appt.appointment.client.first_name || "Unknown Client";
      const serviceName = appt.service?.name || "Service";

      const appointmentEvent = {
        title: `${serviceName} - ${clientName}`,
        start,
        end,
        data: appt,
        color: appt.staff.calendar_color || "#3B82F6",
      };

      grouped[staffId].staffAppointments.push(appointmentEvent);
    });

    // Convert grouped object to array and sort by staffName A → Z
    return Object.values(grouped).sort((a, b) =>
      a.staffName.localeCompare(b.staffName)
    );
  }
  const updateCurrentDate = (value?: Date | "prev" | "next") => {
    if (value instanceof Date) {
      setCurrentDate(value);
      return;
    }
    if (value === "prev") {
      setCurrentDate((prev) => new Date(prev.setDate(prev.getDate() - 1)));
      return;
    }
    if (value === "next") {
      setCurrentDate((prev) => new Date(prev.setDate(prev.getDate() + 1)));
      return;
    }
  };

  // Filter functions
  const toggleLocationFilter = (locationId: string) => {
    setTempPageFilter((prev) => {
      const newLocationIds = prev.location_ids.includes(locationId)
        ? prev.location_ids.filter((id) => id !== locationId)
        : [...prev.location_ids, locationId];

      return {
        ...prev,
        location_ids: newLocationIds,
      };
    });
  };

  const clearAllFilters = () => {
    setTempPageFilter({
      location_ids: [],
    });
  };

  const applyFilters = () => {
    // Apply the temporary filters to the actual pageFilter (this will trigger the API call)
    setPageFilter(tempPageFilter);
    setShowFilterPanel(false);
  };

  const openFilterPanel = () => {
    // Reset temp filter to current filter when opening modal
    setTempPageFilter(pageFilter);
    setShowFilterPanel(true);
  };

  const closeFilterPanel = () => {
    // Reset temp filter to current filter when closing without applying
    setTempPageFilter(pageFilter);
    setShowFilterPanel(false);
  };

  // Update appointment time after drag/resize - Optimistic UI pattern
  const updateAppointmentTime = async (
    appointmentServiceId: string,
    newStartTime: Date,
    newEndTime: Date,
    newStaffId?: string
  ) => {
    try {
      const formatTime = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}:00`;
      };

      const startTimeStr = formatTime(newStartTime);
      const endTimeStr = formatTime(newEndTime);

      console.log(`[CalendarVM] Optimistically updating appointment ${appointmentServiceId}:`);
      console.log(`  Time: ${startTimeStr} - ${endTimeStr}`);
      if (newStaffId) {
        console.log(`  New staff: ${newStaffId}`);
      }

      // Perform backend update in background without blocking UI
      const success = await appointmentsRepository.updateAppointmentServiceTime(
        appointmentServiceId,
        startTimeStr,
        endTimeStr,
        newStaffId
      );

      if (success) {
        console.log(`[CalendarVM] Backend update successful, silently refreshing data...`);
        // Silently refresh calendar data in background to sync with backend
        // This ensures any server-side changes are reflected
        await fetchCalanderAppointmentsData(
          currentDate.toISOString(),
          pageFilter.location_ids.length > 0
            ? pageFilter.location_ids
            : undefined
        );
        console.log(`[CalendarVM] Silent refresh complete`);
        return true;
      } else {
        console.error(
          `[CalendarVM] Backend update failed for appointment ${appointmentServiceId}`
        );
        // Refresh to revert to server state
        await fetchCalanderAppointmentsData(
          currentDate.toISOString(),
          pageFilter.location_ids.length > 0
            ? pageFilter.location_ids
            : undefined
        );
      }
      return false;
    } catch (error) {
      console.error("[CalendarVM] Error updating appointment time:", error);
      // Refresh to revert to server state on error
      try {
        await fetchCalanderAppointmentsData(
          currentDate.toISOString(),
          pageFilter.location_ids.length > 0
            ? pageFilter.location_ids
            : undefined
        );
      } catch (refreshError) {
        console.error("[CalendarVM] Failed to refresh after error:", refreshError);
      }
      return false;
    }
  };

  return {
    currentDate,
    updateCurrentDate,
    calanderData,
    toast,
    showComingSoon,
    hideToast,
    user,
    // Filter related
    pageFilter: tempPageFilter, // Use temp filter for the modal display
    allLocations,
    showFilterPanel,
    openFilterPanel,
    closeFilterPanel,
    toggleLocationFilter,
    clearAllFilters,
    applyFilters,
    // Appointment update
    updateAppointmentTime,
    fetchCalanderAppointmentsData,
  };
};

export default useCalanderScreenVM;
