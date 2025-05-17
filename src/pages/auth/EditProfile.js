import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  PermissionsAndroid,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import {getFontFamily} from '../../utils/fontFamily';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfile() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [userTokens, setUserTokens] = useState('');

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('userToken');
        if (jsonValue !== null) {
          const userToken = JSON.parse(jsonValue);
          setUserTokens(userToken);
          console.log('user_Token==:', userToken);
        }
      } catch (e) {
        console.error('Failed to load userId:', e);
      }
    };
    fetchUserId();
  }, []);

  // const handleUpdateProfile = async () => {
  //   if (password !== confirmPassword) {
  //     Toast.show({
  //       type: 'error',
  //       position: 'top',
  //       text1: 'Validation Error',
  //       text2: 'Please enter Same Password and Confirm password',
  //     });
  //     return;
  //   }
  //   const formData = new FormData();
  //   // Add the name, phone number, and email to the form data
  //   formData.append('name', name);
  //   formData.append('mobile', phoneNumber);
  //   formData.append('email', email);
  //   formData.append('password', password);
  //   formData.append('c_password', confirmPassword);
  //   try {
  //     const response = await axios.post(
  //       'https://cruisecal.blackbullsolution.com/api/update-full-profile',
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //            Authorization: `Bearer ${userTokens}`,
  //         },
  //       },
  //     );
  //     console.log('response====', response);
  //     if (response?.data?.success) {
  //       // Show a success message
  //       Toast.show({
  //         type: 'success',
  //         position: 'top',
  //         text1: 'Update Successful',
  //       });
  //     } else {
  //       Toast.show({
  //         type: 'error',
  //         position: 'top',
  //         text1: 'Login Failed',
  //         text2: response.data.message || 'An error occurred',
  //       });
  //     }
  //     console.log('Response:', response.data);
  //   } catch (error) {
  //     console.error('Error uploading data:', error);
  //   }
  // };

  // const uploadProfilePic = async () => {
  //   if (!imageUri) return; // Don't proceed if no image selected

  //   const formData = new FormData();
  //   // Correct way to append image in React Native
  //   formData.append('image', {
  //     uri: imageUri,
  //     name: imageUri.split('/').pop(), // extracts filename from URI
  //     type: 'image/jpeg', // or get this dynamically if needed
  //   });

  //   try {
  //     const response = await fetch(
  //       'https://cruisecal.blackbullsolution.com/api/profilePicUpdate',
  //       {
  //         method: 'POST',
  //         body: formData,
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //           Authorization: `Bearer ${userTokens}`, // Don't forget authorization
  //         },
  //       },
  //     );

  //     const result = await response.json();
  //     console.log('Upload success:', result);
  //     return result; // Return the result if you need to use it
  //   } catch (error) {
  //     console.error('Upload failed:', error);
  //     throw error; // Re-throw if you want to handle it elsewhere
  //   }
  // };

  const handleUpdateProfile = async () => {
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Validation Error',
        text2: 'Please enter Same Password and Confirm password',
      });
      return;
    }

    try {
      // First upload the profile picture if there's one
      // if (imageUri) {
      //   await uploadProfilePic();
      // }

      // Then update the profile info
      const formData = new FormData();
      formData.append('name', name);
      formData.append('mobile', phoneNumber);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('c_password', confirmPassword);

      const response = await axios.post(
        'https://cruisecal.blackbullsolution.com/api/update-full-profile',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${userTokens}`,
          },
        },
      );

      console.log('response====', response);
      if (response?.data?.success) {
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Update Successful',
        });
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Update Failed',
          text2: response.data.message || 'An error occurred',
        });
      }
    } catch (error) {
      console.error('Error uploading data:', error);
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Update Failed',
        text2: error.message || 'An error occurred',
      });
    }
  };
  // Camera Function
  const openCamera = async () => {
    setModalVisible(false);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Camera permission denied');
          return;
        }
      }
      const image = await ImagePicker.openCamera({
        mediaType: 'photo',
        cameraType: 'back',
        cropping: true,
        width: 300,
        height: 300,
      });
      console.log('Cropped Image URI:', image.path);
      setImageUri(image.path);
    } catch (error) {
      if (error.message) {
        console.log('Camera Error:', error.message);
      } else {
        console.log('User cancelled camera');
      }
    }
  };

  const pickDocument = async () => {
    setModalVisible(false);
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };
    // Open image picker
    ImagePicker.openPicker(options)
      .then(image => {
        console.log('Selected Image URI:', image.path);
        // Crop the selected image
        ImagePicker.openCropper({
          path: image.path,
          width: 300,
          height: 300,
          cropping: true,
        })
          .then(croppedImage => {
            console.log('Cropped Image URI:', croppedImage.path);
            setImageUri(croppedImage.path);
          })
          .catch(error => {
            console.log('Error while cropping image:', error);
          });
      })
      .catch(error => {
        if (error.message) {
          console.log('ImagePicker Error: ', error.message);
        } else {
          console.log('User cancelled image picker');
        }
      });
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.imageContainer}>
          <View style={{flexDirection: 'row'}}>
            <Image
              source={
                imageUri
                  ? {uri: imageUri}
                  : {uri: 'https://picsum.photos/id/1/200/300'}
              }
              style={styles.profileImage}
            />
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.editbtn}>
              <Image
                source={require('../../assets/images/dit.png')}
                style={{width: 13, height: 13, resizeMode: 'contain'}}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <CustomTextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />

          <CustomTextInput
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          <CustomTextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <CustomTextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
          />

          <CustomTextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <CustomButton
          style={styles.updateButton}
          onPress={() => handleUpdateProfile()}
          label="Update Profile"
        />
      </ScrollView>
      <View style={styles.containers}>
        {/* <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity> */}

        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Choose an option</Text>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => openCamera()}>
                <Text style={styles.optionText}>Open Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => pickDocument()}>
                <Text style={styles.optionText}>Select Image</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionButton, {backgroundColor: '#ccc'}]}
                onPress={() => setModalVisible(false)}>
                <Text style={[styles.optionText, {color: '#333'}]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'space-around',
    backgroundColor: '#f9f9f9',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changeImageButton: {
    backgroundColor: '#5879BC',
    padding: 10,
    borderRadius: 5,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  updateButton: {
    padding: 15,
    borderRadius: 5,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: getFontFamily('bold'),
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 550,
    marginBottom: 10,
  },
  profileName: {
    color: 'black',
    fontSize: 22,
    color: '#5879BC',
    textAlign: 'left',
    fontFamily: getFontFamily('bold'),
  },
  editbtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5879BC',
    height: 30,
    width: 30,
    borderRadius: 15,
    borderColor: '#fff',
    borderWidth: 3,
    zIndex: 100,
    position: 'absolute',
    top: 55,
    left: 80,
  },
  containers: {
    // flex: 1,
    justifyContent: 'center',
    // paddingHorizontal: 20,
  },
  editButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  optionButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
});
