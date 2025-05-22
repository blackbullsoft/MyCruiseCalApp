// firebaseSetup.js
import messaging from '@react-native-firebase/messaging';
import {Platform, Alert} from 'react-native';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    getFcmToken();
  } else {
    console.log('❌ Notification permission denied. Asking again...');

    // Show a manual alert to re-ask, but cannot trigger system dialog again
    Alert.alert(
      'Permission Needed',
      'Push notifications permission is required. Please enable it manually.',
      [
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
        {text: 'Cancel', style: 'cancel'},
      ],
    );
  }
}

export async function getFcmToken() {
  const fcmToken = await messaging().getToken();
  if (fcmToken) {
    console.log('FCM Token:', fcmToken);
    // Save to backend if needed
  } else {
    console.log('Failed to get FCM token');
  }
}
