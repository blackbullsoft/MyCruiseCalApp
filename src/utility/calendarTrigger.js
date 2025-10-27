import RNCalendarEvents from 'react-native-calendar-events';
import axiosInstance from '../api/axiosInstance';
import {formatTime} from '../pages/screens/Itinerary';

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

export async function handleNotificationAction(data) {
  try {
    console.log('📩 FCM Data Received:', data);
    const {cruise_name, tour_code, booking_number, cabin_number} = data;

    if (!tour_code) {
      console.warn('⚠️ Missing tour_code. Aborting...');
      return;
    }

    // Step 1: Find a writable calendar
    const calendars = await RNCalendarEvents.findCalendars();
    const modifiableCalendar = calendars.find(cal => cal.allowsModifications);
    const defaultCalendarId = modifiableCalendar?.id;

    if (!defaultCalendarId) {
      console.error('❌ No modifiable calendar found.');
      return;
    }

    // Step 2: Remove existing events with matching tour_code
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1).toISOString();
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59).toISOString();

    const existingEvents = await RNCalendarEvents.fetchAllEvents(
      startDate,
      endDate,
    );
    const eventsToDelete = existingEvents.filter(event =>
      event?.title?.includes(`[${tour_code}]`),
    );
    console.log('events to Delete', eventsToDelete);
    for (const event of eventsToDelete) {
      try {
        await RNCalendarEvents.removeEvent(event.id);
        console.log(`🗑️ Deleted event ID: ${event.id}`);
      } catch (err) {
        console.warn(`⚠️ Failed to delete event ID: ${event.id}`, err);
      }
    }
    // return;
    // Step 3: Fetch updated itinerary data
    let itineraryEvents = [];
    try {
      const response = await axiosInstance.post('/itinary_details', {
        tour_code: tour_code,
      });

      itineraryEvents = (response?.data?.data || []).filter(event =>
        isValidDate(new Date(event.startDate)),
      );

      console.log(
        `🗂️ ${itineraryEvents.length} valid itinerary events fetched`,
      );
    } catch (error) {
      console.error('❌ Failed to fetch itinerary data:', error);
      return;
    }

    // Step 4: Add new events
    for (const event of itineraryEvents) {
      const start = new Date(event.startDate);
      const end = new Date(event.startDate); // Align with addEventsToCalendar
      end.setDate(end.getDate() + 1); // Add 1 day

      const {
        port_name = 'Cruise',
        port_country,
        port_description,
        arrival_date,
        departure_date,
        link = '',
      } = event.notes || {};

      // const title = `${port_name} - ${
      //   cruise_name || event.title || ''
      // } [${tour_code}]`;

      const title = `${port_name}, ${port_country} ${formatTime(
        event.arrival,
      )} - ${formatTime(event.departure)}`;

      // const description =
      //   `🛳 Cruise Itinerary Event\n\n` +
      //   `📌 Tour Code: ${tour_code}\n` +
      //   `🛳 Booking Number: ${booking_number}\n` +
      //   `🛳 Cabin Number: ${cabin_number}\n` +
      //   `🆔 Unique ID: ${event.unique_id || 'N/A'}\n\n` +
      //   `📍 Port: ${port_name}\n` +
      //   `📅 Arrival: ${arrival_date || 'N/A'}\n` +
      //   `📅 Departure: ${departure_date || 'N/A'}\n\n` +
      //   `🔗 Info: ${link}`;
      const description =
        `🚢 Cruise Itinerary Event\n\n` +
        `${port_name}, ${port_country || ''} ${formatTime(
          event.arrival,
        )} - ${formatTime(event.departure)}\n\n` +
        `${port_description || ''}\n` +
        `🛳 Tour Code: ${tour_code}\n` +
        `🛳 Booking Number: ${booking_number}\n` +
        `🛳 Cabin Number: ${cabin_number}\n` +
        `📌 Unique ID: ${event.unique_id}\n\n` +
        `📍 Port: ${port_name}\n` +
        `📅 Arrival: ${arrival_date || 'N/A'}\n` +
        `📅 Departure: ${departure_date || 'N/A'}\n\n` +
        `🔗 Available excursions here: ${link}`;
      // const description =
      //   `🛳 Tour Code: ${event.tour_code}\n\n` +
      //   `${port_description || ''}\n` +
      //   `Available excursions here: ${link}`;

      try {
        const createdId = await RNCalendarEvents.saveEvent(title, {
          calendarId: defaultCalendarId,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          description,
          location: port_name,
          allDay: event.allDay || false,
          alarms: [{date: -60}], // 1 hour before
          notes: `Synced on ${new Date().toLocaleString()}`,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

        console.log(`➕ Created event ID: ${createdId} - ${title}`);
      } catch (saveErr) {
        console.warn(`❌ Failed to create event: ${title}`, saveErr);
      }
    }

    console.log(`✅ Calendar successfully updated for tour_code: ${tour_code}`);
  } catch (error) {
    console.error('❌ General error in handleNotificationAction:', error);
  }
}
