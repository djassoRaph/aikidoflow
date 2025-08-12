import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';

import HistoryScreen from './screens/HistoryScreen';
import LogScreen from './screens/LogScreen';
import { getDb } from './src/db';

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    (async () => {
      await getDb();
    })();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Ajouter"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Ajouter') {
              iconName = 'add-circle-outline';            
            } else if (route.name === 'Historique') {
              iconName = 'list-circle-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        
        <Tab.Screen name="Ajouter" component={LogScreen} />
        <Tab.Screen name="Historique" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
