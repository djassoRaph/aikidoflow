import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LogScreen from './screens/LogScreen';
import HistoryScreen from './screens/HistoryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LogScreen">
        <Stack.Screen name="LogScreen" component={LogScreen} options={{ title: 'Aikido Log' }} />
        <Stack.Screen name="HistoryScreen" component={HistoryScreen} options={{ title: 'Historique' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Set up React Navigation in this Expo React Native project using JavaScript (not TypeScript).
// Use @react-navigation/native and @react-navigation/native-stack.
// Configure a NavigationContainer with a NativeStackNavigator.
// Add two screens:
// - LogScreen (imported from './screens/LogScreen')
// - HistoryScreen (imported from './screens/HistoryScreen')

// Screen titles should be:
// - LogScreen: "Aikido Log"
// - HistoryScreen: "Historique"


// Do not use any TypeScript. This file is App.js in an Expo-managed project.
