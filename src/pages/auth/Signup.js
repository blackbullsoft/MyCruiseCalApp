import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import colors from '../../theme/colors';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Signup = ({navigation}) => {
  // State for form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  // Handle the signup process
  const handleSignup = async () => {
    console.log('button clicked');
    // Basic form validation
    if (!name || !email || !password || !confirmPassword || !mobile) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: 'All fields are required',
      });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: 'Passwords do not match',
      });
      return;
    }
    try {
      setLoading(true); // Start loading spinner
      // Create the data object to pass to the API
      const data = {
        name: name,
        email: email,
        password: password,
        c_password: confirmPassword, // Assuming this is the correct key for the API
        mobile: mobile,
      };
      console.log('Data object:', data); // Log the data object for debugging
      // API call to the signup endpoint
      const response = await axios.post(
        'http://cruisecal.blackbullsolution.com/api/register',
        data,
      );
      console.log('Response:', response?.data?.data); // Log the response for debugging
      if (response?.data?.success) {
        const {token, name, id} = response?.data?.data; // Extract the token and name from the response
        // Show a success message
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Login Successful',
          text2: `Welcome back, ${name}!`,
        });

        // Save the token to persist login state (Optional: You can store this in AsyncStorage)
        await AsyncStorage.setItem('userToken', JSON.stringify(token));
        await AsyncStorage.setItem('user_name', name);
        await AsyncStorage.setItem('userId', JSON.stringify(id));
      }
      setLoading(false); // Stop the loading spinner

      // Check the API response for success or failure
      if (response.data.success) {
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Signup Successful',
          text2: 'Your account has been created!',
        });
        navigation.navigate('Login'); // Navigate to the login page on successful signup
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Error',
          text2: response.data.message || 'Something went wrong',
        });
      }
    } catch (error) {
      setLoading(false); // Stop the loading spinner in case of an error
      console.error(
        'Error during signup:',
        error.response ? error.response.data : error.message,
      );
      // Show an error message using Toast
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2:
          error.response?.data?.message ||
          'Failed to create account. Please try again.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            resizeMode="contain"
            source={require('../../assets/images/back.png')}
            style={{height: 30, width: 30, marginLeft: 10}}
          />
        </TouchableOpacity>

        {/* App logo */}
        <Image
          source={require('../../assets/images/appLogo.png')}
          style={styles.logo}
        />

        {/* Signup Form Title */}
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subHeading}>
          Create an account so you can explore all the my cruise call
        </Text>

        {/* Form Inputs */}
        <CustomTextInput
          placeholder="First Name"
          value={name}
          onChangeText={text => setName(text)}
        />
        <CustomTextInput
          placeholder="Email"
          value={email}
          onChangeText={text => setEmail(text)}
        />
        <CustomTextInput
          placeholder="Password"
          value={password}
          secureTextEntry
          onChangeText={text => setPassword(text)}
        />
        <CustomTextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          secureTextEntry
          onChangeText={text => setConfirmPassword(text)}
        />
        <CustomTextInput
          placeholder="Mobile"
          value={mobile}
          onChangeText={text => setMobile(text)}
        />

        {/* Signup Button */}
        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <CustomButton
              label="Sign Up"
              onPress={handleSignup}
              loading={loading} // Show loading spinner while API is in progress
            />
          )}
        </View>

        {/* Redirect to Login */}
        <View style={styles.signupContainer}>
          <Text style={{fontSize: 18}}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signupText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  logo: {
    height: 150,
    width: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  subHeading: {
    alignSelf: 'center',
    marginBottom: 20,
    color: 'black',
    fontSize: 18,
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: 20,
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
});

export default Signup;
