import { Redirect } from 'expo-router';

export default function Index() {
  // Root layout AuthGate will redirect to (tabs)/certificates if logged in
  return <Redirect href="/(auth)/login" />;
}
