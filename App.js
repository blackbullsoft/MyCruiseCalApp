import 'react-native-gesture-handler';
import React, {useEffect} from 'react';
import {Alert, Platform, StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import AuthNavigation from './src/navigation/AuthNavigation/AuthNavigation';
import Toast from 'react-native-toast-message';
import store from './src/redux/store';
import {Provider} from 'react-redux';
import {usePushNotification} from './src/utility/pushNotificationService';
import {handleNotificationAction} from './src/utility/calendarTrigger';
import {check, PERMISSIONS, request, RESULTS} from 'react-native-permissions';

const App = () => {
  const requestCalendarPermissions = async () => {
    try {
      const writePermission = await request(PERMISSIONS.ANDROID.WRITE_CALENDAR);
      const readPermission = await request(PERMISSIONS.ANDROID.READ_CALENDAR);

      return (
        writePermission === RESULTS.GRANTED &&
        readPermission === RESULTS.GRANTED
      );
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
      return false;
    }
  };
  // Android permission request
  const calendarPermission = async () => {
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
        const readStatus = await check(PERMISSIONS.ANDROID.READ_CALENDAR);
        const writeStatus = await check(PERMISSIONS.ANDROID.WRITE_CALENDAR);

        if (readStatus !== RESULTS.GRANTED || writeStatus !== RESULTS.GRANTED) {
          hasPermission = await requestCalendarPermissions();
        } else {
          hasPermission = true;
        }
      }

      if (!hasPermission) {
        Alert.alert(
          'Calendar Permission Required',
          'Please allow calendar access to view and manage cruise events.',
        );
      }

      return hasPermission;
    } catch (error) {
      console.error('Calendar permission error:', error);
      Alert.alert('Error', 'Failed to check/request calendar permissions.');
      return false;
    }
  };

  useEffect(() => {
    calendarPermission();
  }, []);
  // Setup push notifications via hook
  usePushNotification({
    onNotification: async notification => {
      console.log('notification', notification);
      try {
        const data = notification.data || {};

        if (data.tour_code) {
          await handleNotificationAction({
            cruise_name: data.cruise_name,
            tour_code: data.tour_code,
          });
        } else {
          console.log('Non-calendar message, ignoring for calendar logic.');
        }
      } catch (error) {
        console.error('Error in onNotification handler:', error);
      }
    },
    onNotificationOpened: async notification => {
      console.log('🔁 User opened notification:', notification);
      try {
        const data = notification.data || {};

        if (data.tour_code) {
          await handleNotificationAction({
            cruise_name: data.cruise_name,
            tour_code: data.tour_code,
          });
        } else {
          console.log('Non-calendar message, ignoring for calendar logic.');
        }
      } catch (error) {
        console.error('Error in onNotification handler:', error);
      }
      // You can navigate to a screen based on notification data if needed
    },
    onTokenRefresh: token => {
      console.log('🔄 New FCM token:', token);
      // Send to your backend if needed
    },
  });

  return (
    <Provider store={store}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <NavigationContainer>
        <AuthNavigation />
      </NavigationContainer>
      <Toast />
    </Provider>
  );
};

export default App;
