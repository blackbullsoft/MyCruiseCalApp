
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import colors from '../../theme/colors';

const Splash = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
      // navigation.replace('Login');
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/appLogo.png')} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background, // Background color of splash screen
  },
  text: {
    color: '#fff',
    fontSize: 24,
  },
  logo: {
    height: 250,
    width: 250,
    resizeMode: "contain"
  }
});

export default Splash;
