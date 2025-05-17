// Login.js
import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import colors from '../../theme/colors';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { getFontFamily } from '../../utils/fontFamily';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ForgotPassword = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  //  const [password, setPassword] = useState('');

  const handleForgetPassword = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Validation Error',
        text2: 'Email and Password are required.',
      });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        'https://cruisecal.blackbullsolution.com/api/forgot-password',
        {email},
      );
      console.log('responseforget', response);
      // Check if the login is successful
      navigation.navigate('ResetPassword', {
        email: response?.data?.email,
        otp: response?.data?.otp,
      });
      console.log('email', email);
      console.log('otp', response?.data?.otp);
      Toast.show({
        type: 'error',
        position: 'top',
        text1: response.data.message || 'An error occurred',
      });
    } catch (error) {
      console.error('Error logging in:', error);
      Toast.show({
        type: 'error',
        position: 'top',
        text2: 'An error occurred while',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            resizeMode="contain"
            source={require('../../assets/images/back.png')}
            style={{height: 30, width: 30, marginLeft: 10,marginTop:20,resizeMode:"contain"}}
          />
        </TouchableOpacity>
        <Image
          source={require('../../assets/images/appLogo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subHeading}>
          Select which contact details should we use to reset your password
        </Text>
        <CustomTextInput
          style={{marginBottom: 20}}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        {/* <CustomTextInput placeholder="Confirm Password" secureTextEntry value={password} onChangeText={setPassword} /> */}
        {/* <CustomButton onPress={()=>handleForgetPassword()} label='Next' /> */}
        <LinearGradient
          colors={['#8DC5EA', '#5879BC']}
          style={styles.gradientButton}>
          <TouchableOpacity
            onPress={() => handleForgetPassword()}
            disabled={loading}
            style={styles.loginButton}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Next</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 32,
    marginBottom: 24,
    alignSelf: 'center',
    fontWeight: '900',
    color: colors.primary,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  logo: {
    height: 150,
    width: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  forgotTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  subHeading: {
    alignSelf: 'center',
    marginBottom: 20,
    color: 'black',
    fontSize: 18,
    textAlign: 'center',
  },
  continue: {
    margin: 25,
    alignSelf: 'center',
    color: 'black',
    fontSize: 18,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  Socialbutton: {
    padding: 15,
    borderRadius: 12,
  },
  SocialbuttonCon: {
    padding: 10,
    borderRadius: 12,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  signupText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  loginButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: getFontFamily('medium'),
  },
});

export default ForgotPassword;
