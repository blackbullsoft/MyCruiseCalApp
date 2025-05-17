import './gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigation from './src/navigation/AuthNavigation/AuthNavigation';
import Toast from 'react-native-toast-message';
import { StatusBar } from 'react-native';  // Import StatusBar
import store, { persistor } from './src/redux/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

const App = () => {
  return (
    <Provider store={store}>
      {/* Transparent StatusBar */}
      <StatusBar
        barStyle="light-content" // You can also set 'dark-content' if you prefer
        backgroundColor="transparent"
        translucent={true}
      />
      <NavigationContainer>
        <AuthNavigation />
      </NavigationContainer>
      <Toast />
    </Provider>
  );
};

export default App;
