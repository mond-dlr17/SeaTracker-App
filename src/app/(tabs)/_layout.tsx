import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Colors } from '../../shared/utils/colors';
import { Ionicons } from '@expo/vector-icons';
import { FloatingTabBar } from './_FloatingTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerShown: false,
        headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          paddingTop: 0,
          paddingBottom: 0,
        },
      }}
    >
      <Tabs.Screen name="certificates" options={{ title: 'Certificates', tabBarIcon: ({ color, size }) => <Ionicons name="medal" color={color} size={size} /> }} />
      <Tabs.Screen
        name="training"
        options={{
          title: 'Training',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {focused ? <View style={{ position: 'absolute', top: 0, width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent }} /> : null}
              <Ionicons name="book" color={color} size={size} />
            </View>
          ),
        }}
      />
      <Tabs.Screen name="ai" options={{ title: 'Assistant', tabBarIcon: ({ color, size }) => <Ionicons  name="chatbubble" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons  name="person" color={color} size={size} /> }} />
    </Tabs>
  );
}
