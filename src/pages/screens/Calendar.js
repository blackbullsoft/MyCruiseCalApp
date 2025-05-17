import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  FlatList,
  Button,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {PERMISSIONS, check, request, RESULTS} from 'react-native-permissions';
import RNCalendarEvents from 'react-native-calendar-events'; // Ensure you have this installed for calendar access

const Calendar = () => {
  const [cruiseEvents, setCruiseEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAndShowCalendarEvents();
  }, []);

  const fetchAndShowCalendarEvents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      let hasPermission = false;

      if (Platform.OS === 'ios') {
        const authStatus = await RNCalendarEvents.authorizationStatus();
        hasPermission = authStatus === 'authorized';
        if (!hasPermission) {
          const requestStatus = await RNCalendarEvents.requestPermissions();
          hasPermission = requestStatus === 'authorized';
        }
      } else {
        const androidPermission = await check(
          PERMISSIONS.ANDROID.READ_CALENDAR,
        );
        hasPermission = androidPermission === RESULTS.GRANTED;

        if (!hasPermission) {
          const androidReadPermission = await request(
            PERMISSIONS.ANDROID.READ_CALENDAR,
          );
          hasPermission = androidReadPermission === RESULTS.GRANTED;
        }
      }

      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Calendar permission is required to view events.',
        );
        return;
      }

      // Set date range for current year
      const now = new Date();
      const startDate = new Date(now.getFullYear(), 0, 1); // Jan 1
      const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // Dec 31, 11:59 PM

      const events = await RNCalendarEvents.fetchAllEvents(
        startDate.toISOString(),
        endDate.toISOString(),
      );

      const filteredEvents = events.filter(
        event =>
          event.description &&
          event.description.includes('Cruise Event Details:'),
      );

      // Group events by cruise_name and sort by date
      const groupedEvents = groupEventsByCruiseName(filteredEvents);

      setCruiseEvents(groupedEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      Alert.alert('Error', 'Failed to retrieve calendar events.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const extractCruiseName = eventTitle => {
    const regex = /(?<= - ).*?(?= \[\d+\])/;
    const match = eventTitle.match(regex);
    return match ? match[0].trim() : 'Unknown Cruise';
  };

  const groupEventsByCruiseName = events => {
    const grouped = events.reduce((acc, event) => {
      const cruiseName = extractCruiseName(event.title);
      if (!acc[cruiseName]) acc[cruiseName] = [];
      acc[cruiseName].push(event);
      return acc;
    }, {});

    // Sort events by start date in ascending order
    Object.keys(grouped).forEach(cruiseName => {
      grouped[cruiseName].sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate),
      );
    });

    // Convert grouped events to an array for rendering
    return Object.entries(grouped).map(([key, value]) => ({
      group: key,
      events: value,
    }));
  };

  // Format date as dd-mmm-yyyy
  const formatDate = dateString => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', {month: 'short'});
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const deleteEvent = eventId => {
    // Show confirmation before deleting
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this event?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Deletion canceled'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              await RNCalendarEvents.removeEvent(eventId);
              Alert.alert(
                'Event Deleted',
                'The event has been removed from the calendar.',
              );
              fetchAndShowCalendarEvents(true); // Refresh the event list
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event.');
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  const renderItem = ({item, index}) => (
    <View style={styles.eventItem}>
      <Text style={styles.title}>
        {index + 1}. {item.title}
      </Text>
      <Text style={styles.date}>Date: {formatDate(item.startDate)}</Text>
      <Button
        title="Delete"
        color="red"
        onPress={() => deleteEvent(item.id)} // Passing the event ID for deletion
      />
    </View>
  );

  const renderGroup = ({item}) => (
    <View style={styles.groupContainer}>
      <Text style={styles.groupHeader}>{item.group}</Text>
      <FlatList
        data={item.events}
        keyExtractor={event => event.id}
        renderItem={renderItem}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cruise Calendar Events</Text>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{marginTop: 20}}
        />
      ) : cruiseEvents.length > 0 ? (
        <FlatList
          data={cruiseEvents}
          keyExtractor={item => item.group}
          renderItem={renderGroup}
          refreshing={refreshing}
          onRefresh={() => fetchAndShowCalendarEvents(true)}
        />
      ) : (
        <Text style={styles.noEvents}>No cruise events found.</Text>
      )}
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'black',
  },
  groupContainer: {
    marginBottom: 20,
  },
  groupHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  eventItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  date: {
    fontSize: 14,
    marginTop: 4,
    color: 'black',
  },
  noEvents: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    color: 'black',
  },
});
