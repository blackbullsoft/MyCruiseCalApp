import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from '@react-navigation/stack';
import Splash from '../../pages/auth/SplashScreen';
import Login from '../../pages/auth/Login';
import Signup from '../../pages/auth/Signup';
import ResetPassword from '../../pages/auth/ResetPassword';
import CongratsScreen from '../../pages/auth/CongratsScreen';
import DrawerNavigation from '../DrawerNavigation/DrawerNavigation';
import Itinerary from '../../pages/screens/Itinerary';
import ForgotPassword from '../../pages/auth/FogotPassword';

const Stack = createStackNavigator();

const AuthNavigation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  // Check if the user is logged in by looking for a token in AsyncStorage
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setUserToken(token);  // User is logged in
        }
      } catch (e) {
        console.error('Error reading token', e);
      } finally {
        setIsLoading(false);  // Stop showing splash screen after the check
      }
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return <Splash />;  // Show the splash screen while checking login status
  }

  return (
    <Stack.Navigator initialRouteName={userToken ? "Drawer" : "Login"} screenOptions={{ headerShown: false }}>

      {/* Authenticated User Flow */}
      <Stack.Screen name="Drawer" component={DrawerNavigation} />
      <Stack.Screen name="Itinerary" component={Itinerary} />
      {/* Unauthenticated User Flow */}
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="CongratsScreen" component={CongratsScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigation;


