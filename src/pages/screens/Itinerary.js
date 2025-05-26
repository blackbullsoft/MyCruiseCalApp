import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  NativeModules,
} from 'react-native';
import axios from 'axios';
import RNCalendarEvents from 'react-native-calendar-events';
import {getFontFamily} from '../../utils/fontFamily';
import CustomButton from '../../components/CustomButton';
import LinearGradient from 'react-native-linear-gradient';
import {format, addDays} from 'date-fns';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create an axios instance with a timeout to avoid hanging requests
const axiosInstance = axios.create({
  baseURL: 'https://cruisecal.blackbullsolution.com/api',
  timeout: 10000, // Add timeout to prevent hanging requests
});

const Itinerary = ({navigation, route}) => {
  const {tourCode, date, heading1, duration1} = route.params;

  // State management
  const [itineraryData, setItineraryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cabinNumber, setCabinNumber] = useState('');
  const [bookingNumber, setBookingNumber] = useState('');
  const [itineraryEventData, setItineraryEventData] = useState([]);
  const [eventsSaved, setEventsSaved] = useState(false);
  const [savingEvents, setSavingEvents] = useState(false);
  const [progress, setProgress] = useState({
    total: 0,
    success: 0,
    failed: 0,
    processing: false,
  });

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchItineraryData(),
        fetchItineraryEventData(),
        checkCalendarPermission(),
      ]);
    };

    loadData();
  }, []);

  // Function to fetch itinerary data
  const fetchItineraryData = async () => {
    if (!tourCode) {
      setError('Tour code is required');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/itinary', {
        tour_code: tourCode,
      });

      if (response?.data?.data) {
        console.log('itenary data', response.data.data);
        setItineraryData(response.data.data);
      } else {
        setError('No itinerary data available');
      }
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      setError('Failed to fetch itinerary data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch event data
  const fetchItineraryEventData = async () => {
    if (!tourCode) return;

    try {
      const response = await axiosInstance.post('/itinary_details', {
        tour_code: tourCode,
      });
      console.log('itenary event data', response.data.data);
      if (response?.data?.data) {
        // Process and validate event data before setting state
        const validatedEvents = response.data.data.filter(event => {
          // Ensure startDate and endDate are valid
          const startDate = new Date(event.startDate);
          const endDate = new Date(event.endDate);
          return isValidDate(startDate) && isValidDate(endDate);
        });

        setItineraryEventData(validatedEvents);
        console.log('itenary length', validatedEvents.length);
      }
    } catch (error) {
      console.error('Error fetching itinerary events:', error);
    }
  };

  // Check calendar permissions
  const checkCalendarPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const result = await check(PERMISSIONS.ANDROID.WRITE_CALENDAR);
        return result === RESULTS.GRANTED;
      } else if (Platform.OS === 'ios') {
        const result = await check(PERMISSIONS.IOS.CALENDARS);
        return result === RESULTS.GRANTED;
      }
      return false;
    } catch (error) {
      console.error('Error checking calendar permission:', error);
      return false;
    }
  };

  // Request calendar permissions
  const requestCalendarPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const writePermission = await request(
          PERMISSIONS.ANDROID.WRITE_CALENDAR,
        );
        const readPermission = await request(PERMISSIONS.ANDROID.READ_CALENDAR);

        return (
          writePermission === RESULTS.GRANTED &&
          readPermission === RESULTS.GRANTED
        );
      } else if (Platform.OS === 'ios') {
        const permissionResult = await request(PERMISSIONS.IOS.CALENDARS);
        return permissionResult === RESULTS.GRANTED;
      }
      return false;
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
      return false;
    }
  };

  // Utility to calculate and format dates
  const calculateDateShow = useCallback((baseDate, dayOffset) => {
    if (!baseDate) return '';

    try {
      const parsedDate = new Date(baseDate);
      return format(addDays(parsedDate, dayOffset - 1), 'MMM-dd-yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }, []);

  // Check if a date is valid
  const isValidDate = date => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  // Function to force calendar refresh
  const forceCalendarRefresh = async calendarId => {
    try {
      if (Platform.OS === 'ios') {
        // On iOS, fetch events to trigger a refresh
        await RNCalendarEvents.fetchAllEvents(
          new Date().toISOString(),
          new Date(Date.now() + 86400000).toISOString(),
          [calendarId],
        );
      } else if (Platform.OS === 'android') {
        // For Android, we need a custom solution
        if (NativeModules.CalendarModule?.refreshCalendar) {
          await NativeModules.CalendarModule.refreshCalendar();
        } else {
          // Fallback - use a content provider trigger if available
          console.log('No native calendar refresh module available');
        }
      }
    } catch (error) {
      console.log('Calendar refresh error:', error);
    }
  };

  // Function to add events to calendar with improved error handling
  const addEventsToCalendar = async () => {
    let successCount = 0;
    let failCount = 0;
    const totalEvents = itineraryEventData.length;

    if (totalEvents === 0) {
      Alert.alert('No Events', 'There are no events to add to your calendar.');
      return;
    }

    setSavingEvents(true);
    setProgress({
      total: totalEvents,
      success: 0,
      failed: 0,
      processing: true,
    });

    try {
      // Get calendar permissions
      let hasPermission = false;
      if (Platform.OS === 'ios') {
        const authStatus = await RNCalendarEvents.authorizationStatus();
        hasPermission =
          authStatus === 'authorized' ||
          (await RNCalendarEvents.requestPermissions()) === 'authorized';
      } else {
        hasPermission = await requestCalendarPermissions();
      }

      if (!hasPermission) throw new Error('Calendar permission not granted');

      // Find a suitable calendar
      const calendars = await RNCalendarEvents.findCalendars();
      let defaultCalendarId =
        calendars.find(cal => cal.isPrimary && cal.allowsModifications)?.id ||
        calendars.find(cal => cal.allowsModifications)?.id ||
        calendars[0]?.id;

      if (!defaultCalendarId) {
        throw new Error('No suitable calendar found on device');
      }

      const BATCH_SIZE = 3;

      for (let i = 0; i < itineraryEventData.length; i += BATCH_SIZE) {
        const batch = itineraryEventData.slice(i, i + BATCH_SIZE);

        for (const event of batch) {
          try {
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.startDate);
            endDate.setDate(endDate.getDate() + 1);

            if (!isValidDate(startDate) || !isValidDate(endDate)) {
              console.error('Invalid date for event:', event);
              failCount++;
              continue;
            }

            const {
              port_name = 'Cruise',
              cruise_name = event.title,
              arrival_date,
              departure_date,
              link = '',
            } = event.notes || {};

            const title = `${port_name} - ${cruise_name} [${event.tour_code}]`;

            const description =
              `🚢 Cruise Itinerary Event\n\n` +
              `🛳 Tour Code: ${event.tour_code}\n` +
              `🛳 Booking Number: ${bookingNumber}\n` +
              `🛳 Cabin Number: ${cabinNumber}\n` +
              `📌 Unique ID: ${event.unique_id}\n\n` +
              `📍 Port: ${port_name}\n` +
              `📅 Arrival: ${arrival_date || 'N/A'}\n` +
              `📅 Departure: ${departure_date || 'N/A'}\n\n` +
              `🔗 More Info: ${link}`;

            const eventId = await RNCalendarEvents.saveEvent(title, {
              calendarId: defaultCalendarId,
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
              description,
              location: port_name,
              allDay: event.allDay || false,
              alarms: [{date: -60}], // 1 hour before
              notes: `Added at ${new Date().toLocaleTimeString()}`,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });

            if (eventId) {
              console.log('Successfully added event:', eventId);
              successCount++;
            } else {
              console.error('Failed to add event (no ID returned)');
              failCount++;
            }
          } catch (err) {
            console.error('Error saving event:', err);
            failCount++;
          }

          setProgress({
            total: totalEvents,
            success: successCount,
            failed: failCount,
            processing: true,
          });
        }

        await forceCalendarRefresh(defaultCalendarId);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      await forceCalendarRefresh(defaultCalendarId);

      setSavingEvents(false);
      setProgress({
        total: totalEvents,
        success: successCount,
        failed: failCount,
        processing: false,
      });

      if (successCount > 0) {
        if (
          Platform.OS === 'android' &&
          NativeModules.CalendarModule?.launchCalendarApp
        ) {
          NativeModules.CalendarModule.launchCalendarApp();
        }

        Alert.alert(
          'Success',
          `Successfully added ${successCount} events to your calendar.` +
            (failCount > 0 ? `\n${failCount} events failed.` : '') +
            '\n\nPlease check your calendar.',
          [{text: 'OK', onPress: () => setEventsSaved(true)}],
        );
      } else {
        Alert.alert('Error', 'Failed to add any events to your calendar.');
      }
    } catch (error) {
      console.error('Calendar operation error:', error);

      setSavingEvents(false);
      setProgress({
        total: totalEvents,
        success: successCount,
        failed: failCount,
        processing: false,
        error: error.message,
      });

      let errorMessage = 'Failed to add events to calendar';
      if (error.message.includes('permission')) {
        errorMessage =
          'Calendar permission denied. Please enable calendar access in your device settings.';
      } else if (error.message.includes('calendar')) {
        errorMessage =
          'No suitable calendar found. Please set up a calendar app on your device.';
      }

      Alert.alert('Error', errorMessage);
    }
  };

  // Save booking data to server
  const handleSaveData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('userId');
      if (jsonValue !== null) {
        const userid = JSON.parse(jsonValue);
        const data = {
          tour_code: tourCode,
          booking_number: bookingNumber,
          cabin_number: cabinNumber,
          user_id: userid,
        };

        const response = await axiosInstance.post('/addToCalendar', data);
        console.log('Booking info saved:', response?.data?.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving booking info:', error);
      return false;
    }
  };

  // Handle save button press
  const handleSave = async () => {
    if (!cabinNumber || !bookingNumber) {
      Alert.alert(
        'Missing Information',
        'Please enter both cabin number and booking number.',
      );
      return;
    }

    // Save booking data first
    const savedData = await handleSaveData();

    // Request appropriate permissions and add events
    try {
      let hasPermission = false;

      if (Platform.OS === 'ios') {
        const authStatus = await RNCalendarEvents.authorizationStatus();
        if (authStatus !== 'authorized') {
          const requestStatus = await RNCalendarEvents.requestPermissions();
          hasPermission = requestStatus === 'authorized';
        } else {
          hasPermission = true;
        }
      } else {
        hasPermission = await requestCalendarPermissions();
      }

      if (!hasPermission) {
        Alert.alert(
          'Calendar Permission Denied',
          'Unable to save events to calendar. Please grant calendar permissions in app settings.',
        );
        return;
      }

      // Close modal before starting calendar operations
      setIsModalVisible(false);

      // Add events to calendar with slight delay to ensure modal is closed
      setTimeout(() => {
        addEventsToCalendar();
      }, 300);
    } catch (error) {
      console.error('Error during calendar operations:', error);
      Alert.alert('Error', 'Failed to access calendar: ' + error.message);
    }
  };

  // Event saving progress component
  const EventSavingProgress = () => {
    if (!progress.processing) return null;

    return (
      <View style={styles.progressContainer}>
        <ActivityIndicator
          size="small"
          color="#5779B9"
          style={styles.progressIndicator}
        />
        <Text style={styles.progressText}>
          Saving events: {progress.success} of {progress.total} completed
          {progress.failed > 0 ? ` (${progress.failed} failed)` : ''}
        </Text>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${
                  ((progress.success + progress.failed) / progress.total) * 100
                }%`,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#5779B9" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            resizeMode="contain"
            source={require('../../assets/images/backNew.png')}
            style={{height: 30, width: 30, paddingTop: 20}}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Cruise Itinerary</Text>
      </View>

      <Text style={styles.text}>
        {heading1} ({duration1} Nights)
      </Text>

      <View style={styles.tableContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerCell}>Date</Text>
          <Text style={styles.headerCell}>Port</Text>
        </View>
        <FlatList
          data={itineraryData}
          keyExtractor={(item, index) => `${item.day || ''}-${index}`}
          renderItem={({item}) => (
            <View style={styles.row}>
              <Text style={styles.cell}>
                {calculateDateShow(date, item.day)}
              </Text>
              <Text style={styles.cell}>{item.port || '-'}</Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              {loading ? (
                <ActivityIndicator size="large" color="#5779B9" />
              ) : (
                <Text>{error || 'No itinerary data available'}</Text>
              )}
            </View>
          )}
          contentContainerStyle={styles.flatListContent}
        />
      </View>

      {/* Show progress indicator when saving events */}
      <EventSavingProgress />

      {!eventsSaved && (
        <CustomButton
          style={styles.button}
          onPress={() => setIsModalVisible(true)}
          label={'Add to Calendar'}
          disabled={savingEvents}
        />
      )}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Booking Information</Text>
            <TextInput
              style={styles.input}
              placeholder="Cabin Number"
              placeholderTextColor="#999"
              value={cabinNumber}
              onChangeText={setCabinNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Booking Number"
              placeholderTextColor="#999"
              value={bookingNumber}
              onChangeText={setBookingNumber}
            />
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} disabled={savingEvents}>
                <LinearGradient
                  colors={['#8DC5EA', '#5879BC']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>
                    {savingEvents ? 'Saving...' : 'Save'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
  header: {
    backgroundColor: '#5779B9',
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  headerText: {
    color: 'white',
    fontFamily: getFontFamily('bold'),
    fontSize: 23,
    textAlign: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginLeft: 20,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: 'black',
    fontFamily: getFontFamily('medium'),
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#2B3B59',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 1,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontFamily: getFontFamily('bold'),
  },
  tableContainer: {
    marginTop: 20,
    flex: 1,
  },
  button: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 8,
    margin: 30,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  text: {
    fontSize: 22,
    fontFamily: getFontFamily('bold'),
    marginBottom: 20,
    color: '#5779B9',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: '#5779B9',
    fontFamily: getFontFamily('bold'),
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
    marginTop: 10,
    backgroundColor: '#F8F8F8',
    fontFamily: getFontFamily('medium'),
    color: '#000',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontFamily: getFontFamily('medium'),
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontFamily: getFontFamily('medium'),
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  flatListContent: {
    paddingTop: 40, // Space for the fixed header
  },
  progressContainer: {
    marginHorizontal: 30,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  progressIndicator: {
    marginBottom: 8,
  },
  progressText: {
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: getFontFamily('medium'),
    fontSize: 14,
    color: '#333',
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#5779B9',
  },
});

export default Itinerary;
