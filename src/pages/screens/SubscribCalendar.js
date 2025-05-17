import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const SubscribCalendar = () => {
  return (
    <View>
      <Text style={styles.header}>Cruise Calendar Events</Text>
    </View>
  );
};

export default SubscribCalendar;

const styles = StyleSheet.create({
  header: {
    color: 'black',
  },
});
