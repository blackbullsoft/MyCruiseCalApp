import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Image, TouchableOpacity } from 'react-native';
import Profile from '../../pages/screens/Profile';
import Calendar from '../../pages/screens/Calendar';
import SubscribCalendar from '../../pages/screens/SubscribCalendar';
import CustomDrawerContent from './CustomDrawerContent'; // Import the custom drawer
import { getFontFamily } from '../../utils/fontFamily';
import { useNavigation } from '@react-navigation/native';
import EditProfile from '../../pages/auth/EditProfile';
import { createStackNavigator } from '@react-navigation/stack';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const CustomHamburgerIcon = () => {
  const navigation = useNavigation(); // Hook to access the navigation object

  return (
    <TouchableOpacity onPress={() => navigation.openDrawer()}>
      <Image
        source={require('../../assets/images/hamburger.png')} // Path to your custom PNG icon
        style={{ width: 24, height: 24, marginLeft: 24, resizeMode: "contain" }} // Adjust size and margin as needed
      />
    </TouchableOpacity>
  );
};



const DrawerNavigation = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />} // Custom drawer content
      screenOptions={{
        headerTitle: 'My Cruise Cal',
        headerStyle: {
          backgroundColor: '#5779B8',
        },
        headerTitleStyle: {
          fontSize: 21,       // Change this to your preferred font size
          fontFamily: getFontFamily("bold"),  // Use your custom font family function
          color: '#ffffff',
        },
        headerTintColor: '#fff',
        drawerLabelStyle: {  // Apply the global text style for all drawer items
          fontSize: 13,
          fontFamily: getFontFamily("medium"),
          color: '#000000',  // Custom text color for the drawer items
        },
        headerLeft: () => <CustomHamburgerIcon />
      }}
    >
      {/* Profile Screen with Icon */}
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{
          drawerIcon: ({ focused, size }) => (
            <Image
              source={require('../../assets/images/profile.png')} // Path to your profile icon
              style={{ width: size, height: size, tintColor: focused ? '#5779B8' : 'black', resizeMode: "cover" }}
            />
          ),
        }}
      />

      {/* Calendar Screen with Icon */}
      <Drawer.Screen
        name="My Calendar"
        component={Calendar}
        options={{
          drawerIcon: ({ focused, size }) => (
            <Image
              source={require('../../assets/images/calendar.png')}
              style={{
                width: size, height: size, tintColor: focused ? '#5779B8' : 'black', resizeMode: "contain"
              }}
            />
          ),
        }}
      />

      {/* Subscrib Calendar Screen with Icon */}
      <Drawer.Screen
        name="My Subscribe Calendar"
        component={SubscribCalendar}
        options={{
          drawerIcon: ({ focused, size }) => (
            <Image
              source={require('../../assets/images/subscribe.png')} // Path to your subscription icon
              style={{ width: size, height: size, tintColor: focused ? '#5779B8' : 'black', resizeMode: "cover" }}
              resizeMode='cover'
            />
          ),
        }}
      />

      <Drawer.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          drawerItemStyle: { display: 'none' }, // Hide this item from the drawer
        }}
      />

    </Drawer.Navigator>
  );
};

export default DrawerNavigation;
