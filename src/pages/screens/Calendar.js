import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosInstance = axios.create({
  baseURL: 'http://cruisecal.blackbullsolution.com/api',
  timeout: 10000,
});

const Calendar = () => {
  const [subscribCal, setSubscribCal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubscribCal();
  }, []);

  const fetchSubscribCal = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const jsonValue = await AsyncStorage.getItem('userToken');
      if (!jsonValue) {
        setError('Token not found. Please login again.');
        isRefresh ? setRefreshing(false) : setLoading(false);
        return;
      }

      const userToken = JSON.parse(jsonValue);

      const response = await axiosInstance.get('/subscribedCal', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response?.data?.data) {
        console.log('subscribcal data', response.data.data);
        setSubscribCal(response.data.data);
      } else {
        setError('No subscribed calendar data available');
      }
    } catch (err) {
      console.error('Error fetching subscribed calendar:', err);
      setError('Failed to fetch subscribed calendar. Please try again.');
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cruise Calendar Events</Text>

      {loading && !refreshing && (
        <ActivityIndicator size="large" color="#0000ff" />
      )}

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={subscribCal}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item}) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>
                Total Tours: {item.total_tours}
              </Text>
              <Text style={styles.itemText}>Tour Code: {item.tour_code}</Text>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={() => fetchSubscribCal(true)}
        />
      )}
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  itemText: {
    color: 'black',
  },
});
