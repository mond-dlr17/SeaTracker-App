import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { Link } from 'expo-router';

import { Screen } from '../../shared/components/Screen';
import { Card } from '../../shared/components/Card';
import { TextField } from '../../shared/components/TextField';
import { Button } from '../../shared/components/Button';
import { Colors } from '../../shared/utils/colors';
import { registerWithEmail } from '../../features/auth/authService';

export default function RegisterRoute() {
  const [fullName, setFullName] = useState('');
  const [rank, setRank] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('0');
  const [vesselTypes, setVesselTypes] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <Screen>
      <Card style={{ gap: 12 }}>
        <Text style={styles.title}>Create your profile</Text>
        <TextField label="Full name" value={fullName} onChangeText={setFullName} />
        <TextField label="Rank" value={rank} onChangeText={setRank} placeholder="e.g. 2nd Officer" />
        <TextField
          label="Years of experience"
          value={yearsOfExperience}
          onChangeText={setYearsOfExperience}
          keyboardType="numeric"
        />
        <TextField
          label="Vessel types (comma separated)"
          value={vesselTypes}
          onChangeText={setVesselTypes}
          placeholder="e.g. Tanker, Container"
        />
        <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button
          title="Create account"
          loading={loading}
          onPress={async () => {
            const years = Number(yearsOfExperience);
            if (!fullName.trim()) return Alert.alert('Missing name', 'Please enter your full name.');
            if (!email.trim()) return Alert.alert('Missing email', 'Please enter an email address.');
            if (!password || password.length < 6) return Alert.alert('Weak password', 'Use at least 6 characters.');
            if (!Number.isFinite(years) || years < 0) return Alert.alert('Invalid years', 'Enter a valid number.');

            try {
              setLoading(true);
              await registerWithEmail({
                email,
                password,
                fullName,
                rank,
                yearsOfExperience: years,
                vesselTypes: vesselTypes
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              });
            } catch (e) {
              const message = e instanceof Error ? e.message : 'Please try again.';
              Alert.alert('Registration failed', message);
            } finally {
              setLoading(false);
            }
          }}
        />

        <Link href="/(auth)/login" asChild>
          <Text style={styles.link}>Back to login</Text>
        </Link>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: Colors.text, fontSize: 20, fontWeight: '900' },
  link: { color: Colors.blue, fontWeight: '900' },
});

