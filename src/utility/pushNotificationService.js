// usePushNotification.js
import {useEffect, useRef} from 'react';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform, PermissionsAndroid, Alert, Linking} from 'react-native';
import {handleNotificationAction} from './calendarTrigger';

export const usePushNotification = ({
  onNotification = () => {},
  onNotificationOpened = () => {},
  onTokenRefresh = () => {},
} = {}) => {
  const messageListenerRef = useRef(null);
  const tokenRefreshListenerRef = useRef(null);

  // useEffect(() => {
  //   const initialize = async () => {
  //     const hasPermission = await requestUserPermission();
  //     if (!hasPermission) {
  //       console.log('❌ Push notification permission denied');
  //       return;
  //     }

  //     const token = await getToken();
  //     if (token) {
  //       onTokenRefresh(token);
  //     }

  //     tokenRefreshListenerRef.current = messaging().onTokenRefresh(token => {
  //       AsyncStorage.setItem('fcmToken', token);
  //       onTokenRefresh(token);
  //     });

  //     messageListenerRef.current = messaging().onMessage(
  //       async remoteMessage => {
  //         console.log('📩 Foreground message:', remoteMessage);
  //         const title = remoteMessage.notification?.title || 'New Notification';
  //         const message =
  //           remoteMessage.notification?.body || 'You have a new message';
  //         Alert.alert(
  //           title,
  //           message,
  //           [
  //             {
  //               text: 'OK',
  //               onPress: () => console.log('Notification dismissed'),
  //             },
  //           ],
  //           {cancelable: true},
  //         );
  //         onNotification(remoteMessage);
  //       },
  //     );

  //     messaging().onNotificationOpenedApp(remoteMessage => {
  //       console.log('📨 Notification opened from background:', remoteMessage);
  //       onNotificationOpened(remoteMessage);
  //     });

  //     const initialNotification = await messaging().getInitialNotification();
  //     if (initialNotification) {
  //       console.log('🚀 App opened from quit state:', initialNotification);
  //       onNotificationOpened(initialNotification);
  //     }

  //     messaging().setBackgroundMessageHandler(async remoteMessage => {
  //       console.log('🔕 Background message received:', remoteMessage);
  //       onNotification(remoteMessage);
  //       return null;
  //     });
  //   };

  //   initialize();

  //   return () => {
  //     if (messageListenerRef.current) {
  //       messageListenerRef.current();
  //     }
  //     if (tokenRefreshListenerRef.current) {
  //       tokenRefreshListenerRef.current();
  //     }
  //   };
  // }, []);

  useEffect(() => {
    const initialize = async () => {
      const hasPermission = await requestUserPermission();
      if (!hasPermission) {
        console.log('❌ Push notification permission denied');
        return;
      }

      const token = await getToken();
      if (token) {
        onTokenRefresh(token);
      }

      tokenRefreshListenerRef.current = messaging().onTokenRefresh(token => {
        AsyncStorage.setItem('fcmToken', token);
        onTokenRefresh(token);
      });

      // Foreground messages
      messageListenerRef.current = messaging().onMessage(
        async remoteMessage => {
          console.log('📩 Foreground message:', remoteMessage);
          handleFCMNotification(remoteMessage);
        },
      );

      // When app is in background and user taps notification
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('📨 Notification opened from background:', remoteMessage);
        // handleFCMNotification(remoteMessage);
      });

      // When app is opened from a quit state by tapping notification
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        console.log('🚀 App opened from quit state:', initialNotification);
        handleFCMNotification(initialNotification);
      }

      // Background handler for Android
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('🔕 Background message received:', remoteMessage);
        handleFCMNotification(remoteMessage);
        return null;
      });
    };

    initialize();

    return () => {
      if (messageListenerRef.current) {
        messageListenerRef.current();
      }
      if (tokenRefreshListenerRef.current) {
        tokenRefreshListenerRef.current();
      }
    };
  }, []);

  // Centralized handler
  const handleFCMNotification = async remoteMessage => {
    const data = remoteMessage?.data || {};

    const title = remoteMessage?.notification?.title || 'New Notification';
    const message =
      remoteMessage?.notification?.body || 'You have a new message';

    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          onPress: () => console.log('Notification dismissed'),
        },
      ],
      {cancelable: true},
    );

    if (data.tour_code) {
      try {
        await handleNotificationAction({
          cruise_name: data.cruise_name,
          tour_code: data.tour_code,
          booking_number: data.booking_number,
          cabin_number: data.cabin_number,
        });
      } catch (error) {
        console.error('❌ Error handling notification:', error);
      }
    } else {
      console.log('ℹ️ Non-calendar message, ignoring for calendar logic.');
    }
  };

  const requestUserPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          Alert.alert(
            'Enable Notifications',
            'Please allow notifications in Settings',
            [
              {
                text: 'Open Settings',
                onPress: () => Linking.openURL('app-settings:'),
              },
              {text: 'Cancel', style: 'cancel'},
            ],
          );
        }

        return enabled;
      }

      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          return permission === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true; // No permission needed for Android < 13
      }

      return false;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };

  const getToken = async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      await AsyncStorage.setItem('fcmToken', token);
      console.log('🔑 FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  };
};

// server key
// ya29.c.c0ASRK0GaZBmiLd9SropDGHDLQydHfuxuqAGe9LRB3hVMgnFwmO5NR5Iu0H014b3vkVjE92W12x2auU0NqUwR6iDNS-DO9F3NZE3XdMKhPhOaY549-W5lQTcC3YZu7AaNZazazY0_h8g5D6S68sa1LnUhIPcTWIs1-SvqQcJYrcjmUy4ijWNvMiZhODzeJG4R4ODZ1rT1DhHTfwgmCrXjvfc8JF90LAW_0Tdez78jCQX0qqHHSUEJMeac77OwYicnTfRFMxtd431cjWIo3c108OeOqDLdsoSMT_IckOLhop1JekgvUOMUS8MrdALxGkte6-OtVX8yyoiIZXd36I6bxOgRtccN38p0cktpWYqon8Y0cctDdCL4417roT385DoxaIO3IMhQsb68pOoQecIrUfX4ri7M0g791fMVgqbtyYh1a7BvWStR3Se3h3QtS2_F0jVpMw2UkBSq8RrXWnXlIu0UbY4Xl-XW1v5m_at2Xd-ynpje1y3UesQ9q_kVnm-6d7RFJRdubdzfVir9apORvZBO-_bRJmleI1dgwS6WqQsJO3oBt7vpzhaXs3SIIMgnd4-F_nhXdyR6d-y4ret3McI8MI2sUIzsF75X2eMvRjiI87yleu-scsauFBwaatIcMBoRuV3MVwmoxwwpjvc3_gwrb6dVi8vIpaUO40oxigZySYi3BWekR1I_sn68_X5mp0lY4sri0lY1nYwlq34798Vm202FFR68zQxft02hVq7dRcWQOwjW_ikbv3aoepqthuYYxBeF4J-kFMIcwnOO3OWh7r_kz174r2IwRYcw-9n7gxlkWuXtJiIhk69YojxnUFpS77IJVBsrx1fr5lSzhRzYdh1qwr7ZmxFfO5IIrd0znSxryFgloi0p-51kUB_-mSbkjgauXuye63j7fhkQxSJ3fc9Mk3fiByxSt-75wprqcukXXRoaZz0Y-epqBqba1RfRug7dldO8UX4dB5yXw95_Ihdi35o3FIw2s_yxJcJc_wWbSrpjFi7k

// fcm token
// fMLo2cywRxOCBX1gMhOkm-:APA91bHQcm3wye839gxUouV4figkXJ0WIQBlV5tgFGRz6__IMeVd0MlRE4CRBICWWnnZRNlPJ1HAxd37lTs_msnaPyQq3mL7ptQQAItdq782cHcuDpKin4I
