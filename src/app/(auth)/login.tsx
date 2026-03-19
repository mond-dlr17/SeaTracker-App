import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { Screen } from '../../shared/components/Screen';
import { Card } from '../../shared/components/Card';
import { TextField } from '../../shared/components/TextField';
import { Button } from '../../shared/components/Button';
import { Colors } from '../../shared/utils/colors';
import { loginWithEmail } from '../../features/auth/authService';

export default function LoginRoute() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <Screen>
      <Card style={{ gap: 12 }}>
        <Text style={styles.title}>Sign in</Text>
        <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button
          title="Login"
          loading={loading}
          onPress={async () => {
            try {
              setLoading(true);
              await loginWithEmail(email, password);
            } catch (e) {
              const message = e instanceof Error ? e.message : 'Check your email/password and try again.';
              Alert.alert('Login failed', message);
            } finally {
              setLoading(false);
            }
          }}
        />
        <View style={styles.row}>
          <Text style={styles.muted}>New here?</Text>
          <Link href="/(auth)/register" asChild>
            <Text style={styles.link}>Create account</Text>
          </Link>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: Colors.text, fontSize: 20, fontWeight: '900' },
  muted: { color: Colors.muted, fontWeight: '700' },
  row: { gap: 10, marginTop: 4 },
  link: { color: Colors.blue, fontWeight: '900' },
});

