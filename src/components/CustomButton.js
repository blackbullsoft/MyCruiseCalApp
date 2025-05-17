// CustomButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getFontFamily } from '../utils/fontFamily';

const CustomButton = ({ label, onPress, style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <LinearGradient
        colors={['#8DC5EA', '#5879BC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 17,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily:getFontFamily("medium")
  },
});

export default CustomButton;
