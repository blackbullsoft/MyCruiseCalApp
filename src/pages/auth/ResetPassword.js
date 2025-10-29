// Login.js
import React, {useState, useEffect} from 'react';
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
import {getFontFamily} from '../../utils/fontFamily';

const ResetPassword = ({navigation, route}) => {
  const {email, otp} = route.params;
  console.log('email===', email);
  console.log('otp===', otp);
  const [confirmOtp, setConfirmOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);

  //   useEffect(() => {
  //     handleResetPassword(email, otp);
  //     console.log('==', email, otp);
  //   }, []);

  const handleResetPassword = async () => {
    console.log('emailnew==', email);

    if (!confirmOtp || !password) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Validation Error',
        text2: 'Otp and Password are required.',
      });
      return;
    }

    if (confirmOtp !== otp) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Validation Error',
        text2: 'Otp does not match.',
      });
      return;
    }

    if (confirmPass !== password) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Validation Error',
        text2: 'Password and Confirm Password does not match.',
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('token', confirmOtp); // or otp if you prefer
      formData.append('password_confirmation', confirmPass);

      const response = await axios.post(
        'http://cruisecal.blackbullsolution.com/api/reset-password',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('responsereset', response);

      if (response.data.success) {
        Toast.show({
          type: 'success',
          position: 'top',
          text1: response.data.message,
        });
        navigation.navigate('CongratsScreen');
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: response.data.message || 'Reset failed',
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      Toast.show({
        type: 'error',
        position: 'top',
        text2: 'An error occurred while resetting password.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={{padding: 20}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            resizeMode="contain"
            source={require('../../assets/images/back.png')}
            style={{
              height: 30,
              width: 30,
              marginLeft: 10,
              marginTop: 20,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
        <Image
          source={require('../../assets/images/appLogo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Reset Password?</Text>
        <Text style={styles.subHeading}>
          Select which contact details should we use to reset your password
        </Text>
        <CustomTextInput
          style={{marginBottom: 20}}
          placeholder="Enter Otp "
          value={confirmOtp}
          onChangeText={setConfirmOtp}
        />
        <CustomTextInput
          placeholder="Password (minimum enter 8character)"
          value={password}
          onChangeText={setPassword}
        />
        <CustomTextInput
          placeholder="Confirm Password"
          value={confirmPass}
          onChangeText={setConfirmPass}
        />
        {/* <CustomButton onPress={() => handleResetPassword()} label="Next" /> */}
        <LinearGradient
          colors={['#8DC5EA', '#5879BC']}
          style={styles.gradientButton}>
          <TouchableOpacity
            onPress={() => handleResetPassword()}
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
    // padding: 20,
    // margin: 20,
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

export default ResetPassword;
