import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link, Redirect } from 'expo-router';

import { useAuth } from '@/context/auth-context';

export default function SignUpScreen() {
  const { user, loading, createStudentAccount } = useAuth();

  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [creating, setCreating] = useState(false);

  if (!loading && user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleStudentCreate = async () => {
    if (!studentName.trim() || !studentEmail.trim() || !studentPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing details', 'Name, email, password and confirm password required.');
      return;
    }

    if (studentPassword !== confirmPassword) {
      Alert.alert('Password mismatch', 'Password and confirm password should match.');
      return;
    }

    try {
      setCreating(true);
      await createStudentAccount({
        name: studentName,
        email: studentEmail,
        password: studentPassword,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Student account creation failed.';
      Alert.alert('Create failed', message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Student Sign Up</Text>
        <Text style={styles.subtitle}>Create student account with email/password</Text>

        <TextInput
          style={styles.input}
          value={studentName}
          onChangeText={setStudentName}
          placeholder="student name"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          style={styles.input}
          value={studentEmail}
          onChangeText={setStudentEmail}
          placeholder="student email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          style={styles.input}
          value={studentPassword}
          onChangeText={setStudentPassword}
          placeholder="password"
          secureTextEntry
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="confirm password"
          secureTextEntry
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleStudentCreate} activeOpacity={0.85}>
          {creating ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
        </TouchableOpacity>

        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85}>
            <Text style={styles.secondaryButtonText}>Already have account? Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fbff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 14,
    color: '#64748b',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#f8fbff',
    marginBottom: 8,
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1d4ed8',
    fontWeight: '700',
    fontSize: 14,
  },
});
