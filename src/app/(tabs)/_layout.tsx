import { IconProps, Tabs } from 'expo-router';
import { Colors } from '../../shared/utils/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerShown: false,
        headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.muted,
      }}
    >
      <Tabs.Screen name="certificates" options={{ title: 'Certificates', tabBarIcon: ({ color, size }) => <Ionicons name="medal" color={color} size={size} /> }} />
      <Tabs.Screen name="training" options={{ title: 'Training', tabBarIcon: ({ color, size }) => <Ionicons name="book" color={color} size={size} /> }} />
      <Tabs.Screen name="ai" options={{ title: 'Assistant', tabBarIcon: ({ color, size }) => <Ionicons  name="chatbubble" color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons  name="person" color={color} size={size} /> }} />
    </Tabs>
  );
}
