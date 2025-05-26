import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {PERMISSIONS, check, request, RESULTS} from 'react-native-permissions';
import RNCalendarEvents from 'react-native-calendar-events';

const SubscribCalendar = () => {
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

      const now = new Date();
      const startDate = new Date(now.getFullYear(), 0, 1);
      const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

      const events = await RNCalendarEvents.fetchAllEvents(
        startDate.toISOString(),
        endDate.toISOString(),
      );

      const filteredEvents = events.filter(
        event =>
          event.description &&
          event.description.includes('Cruise Itinerary Event'),
      );

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

  const extractCruiseName = title => {
    if (!title) return 'Cruise';

    // Remove tour code in brackets at the end
    const cleaned = title.replace(/\s*\[.*?\]\s*$/, '').trim();

    // Remove origin prefix if present (like "Miami - ")
    const parts = cleaned.split(' - ');
    if (parts.length > 1) {
      return parts.slice(1).join(' - ').trim();
    }

    return cleaned;
  };

  const groupEventsByCruiseName = events => {
    const grouped = events.reduce((acc, event) => {
      const cruiseName = extractCruiseName(event.title);
      if (!acc[cruiseName]) acc[cruiseName] = [];
      acc[cruiseName].push(event);
      return acc;
    }, {});

    Object.keys(grouped).forEach(cruiseName => {
      grouped[cruiseName].sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate),
      );
    });

    return Object.entries(grouped).map(([key, value]) => ({
      group: key,
      events: value,
    }));
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', {month: 'short'});
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const renderGroup = ({item, index}) => {
    const sortedEvents = item.events;
    const firstEvent = sortedEvents[0];
    const lastEvent = sortedEvents[sortedEvents.length - 1];

    const startDate = new Date(firstEvent.startDate);
    const endDate = new Date(lastEvent.endDate);
    endDate.setDate(endDate.getDate() - 1); // Adjust for all-day event ending next day

    const tourCodeMatch = firstEvent.title.match(/\[(.*?)\]/);
    const tourCode = tourCodeMatch ? tourCodeMatch[1] : 'Unknown';
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {index + 1}. {item.group}
        </Text>
        <Text style={styles.cardText}>🛳 Tour Code: {tourCode}</Text>
        <Text style={styles.cardText}>
          📅 {formatDate(startDate)} - {formatDate(endDate)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Subscribed Calendar</Text>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
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

export default SubscribCalendar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginVertical: 16,
  },
  card: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    marginVertical: 10,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 15,
    color: '#333',
    marginVertical: 2,
  },
  noEvents: {
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
    color: '#999',
  },
});
