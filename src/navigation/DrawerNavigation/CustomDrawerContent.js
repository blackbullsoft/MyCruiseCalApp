import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { getFontFamily } from '../../utils/fontFamily';
import { useSelector } from 'react-redux';
import auth from '@react-native-firebase/auth';
import { clearUser } from '../../redux/userSlice';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';


const CustomDrawerContent = (props) => {
    const navigation = useNavigation()
    const dispatch = useDispatch()
    const [isModalVisible, setIsModalVisible] = useState(false)
    const userInfo = useSelector((state) => state.user.userInfo);
    const [name, setName] = useState('');

    useEffect(() => {
        console.log(userInfo);
        const fetchName = async () => {
            try {
                const storedName = await AsyncStorage.getItem('user_name');
                if (storedName !== null) {
                    setName(storedName);
                    console.log("name", storedName);
                } else {
                    console.log("No name found in AsyncStorage");
                }
            } catch (error) {
                console.error("Error retrieving name from AsyncStorage:", error);
            }
        };

        fetchName();
    }, []);

    const handleLogout = async () => {
        try {
            // Remove the token from AsyncStorage
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
            dispatch(clearUser())
            await AsyncStorage.removeItem('userToken');

            // Check if the token is cleared
            const token = await AsyncStorage.getItem('userToken');
            if (token === null) {
                console.log('Token successfully cleared.');
                Toast.show({
                    type: 'success',
                    position: 'top',
                    text1: 'You’ve been logged out.',
                });
            } else {
                console.log('Token not cleared:', token);
            }

        } catch (error) {
            console.error('Error logging out:', error);
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Error logging out. Please try again.',
            });
        }
    };



    return (
        <View style={{ flex: 1 }}>
            {/* Profile Section */}
            <View style={styles.profileContainer}>
                <View style={{ flexDirection: "row", }}>
                    <Image
                        source={{ uri: userInfo?.photoURL || 'https://picsum.photos/id/1/200/300' }}
                        style={styles.profileImage}
                    />
                    <TouchableOpacity onPress={() => navigation.navigate("EditProfile")} style={styles.editbtn}>
                        <Image source={require('../../assets/images/dit.png')} style={{ width: 13, height: 13 }} />
                    </TouchableOpacity>
                </View>

                <View style={{ marginLeft: 20, padding: 20, marginBottom: 15 }}>
                    <Text style={styles.profileName}>{userInfo?.displayName || name}</Text>
                    <Text style={styles.email}>{userInfo?.email || "john@gmail.com"}</Text>
                </View>
            </View>

            {/* Drawer Items */}
            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            {/* Logout Button at the Bottom */}
            <TouchableOpacity style={styles.logoutButton} onPress={() => setIsModalVisible(true)}>
                <View style={{
                    flexDirection: "row", alignItems: 'center',
                    justifyContent: "flex-start", marginLeft: 15
                }}>
                    <Image source={require('../../assets/images/logout.png')} style={{ height: 18, width: 18 }} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </View>

            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={isModalVisible}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Image source={require('../../assets/images/appLogo.png')} style={styles.logo} />
                        <Text style={styles.modalText}>Are you sure you want to log out?</Text>
                        <View style={styles.modalButtonsContainer}>
                            <LinearGradient
                                colors={['#8DC5EA', '#5879BC']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.modalButton}
                            >
                                <TouchableOpacity
                                    onPress={() => setIsModalVisible(false)}
                                >
                                    <Text style={styles.modalButtonText}>No</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                            <LinearGradient
                                colors={['#8DC5EA', '#5879BC']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.modalButton}
                            >
                                <TouchableOpacity
                                    onPress={handleLogout}
                                >
                                    <Text style={styles.modalButtonText}>Yes</Text>
                                </TouchableOpacity>

                            </LinearGradient>

                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    profileContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: "grey",
        marginBottom: 30,
        flexDirection: "row"
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 550,
        marginBottom: 10,
    },
    profileName: {
        color: 'black',
        fontSize: 22,
        color: "#5879BC",
        textAlign: "left",
        fontFamily: getFontFamily("bold"),
    },
    email: {
        color: '#666666',
        fontSize: 13,
        textAlign: "left",
        fontFamily: getFontFamily("medium")
    },
    logoutButton: {
        padding: 15,
        marginBottom: 50,
        backgroundColor: "#0000000",
    },
    logoutText: {
        color: 'black',
        fontSize: 16,
        marginLeft: 10
    },
    edit: {
        color: "#5879BC",
        fontWeight: "bold"
    },
    editbtn: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#5879BC",
        height: 30,
        width: 30,
        borderRadius: 15,
        borderColor: "#fff",
        borderWidth: 3,
        zIndex: 100,
        position: "absolute",
        top: 45,
        left: 60
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: getFontFamily("medium")
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        marginHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#5879BC',
        borderRadius: 5,
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: getFontFamily("medium")
    },
    logo: {
        height: 150,
        width: 150,
        resizeMode: "contain"
    }
});

export default CustomDrawerContent;
