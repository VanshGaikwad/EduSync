import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Link, Redirect } from 'expo-router';

import { useAuth } from '@/context/auth-context';

export default function SignInScreen() {
  const { user, loading, signIn, signInFacultyAdmin } = useAuth();

  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyPassword, setFacultyPassword] = useState('');

  const [studentSignInLoading, setStudentSignInLoading] = useState(false);
  const [facultyLoading, setFacultyLoading] = useState(false);

  if (!loading && user) {
    return <Redirect href="/(tabs)" />;
  }

  const handleStudentSignIn = async () => {
    if (!studentEmail.trim() || !studentPassword.trim()) {
      Alert.alert('Missing details', 'Student email and password required.');
      return;
    }

    try {
      setStudentSignInLoading(true);
      await signIn(studentEmail.trim(), studentPassword);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Student login failed.';
      Alert.alert('Login failed', message);
    } finally {
      setStudentSignInLoading(false);
    }
  };

  const handleFacultyAdminLogin = async () => {
    if (!facultyEmail.trim() || !facultyPassword.trim()) {
      Alert.alert('Missing details', 'Faculty/Admin email and password required.');
      return;
    }

    try {
      setFacultyLoading(true);
      await signInFacultyAdmin(facultyEmail.trim(), facultyPassword);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Faculty/Admin login failed.';
      Alert.alert('Login failed', message);
    } finally {
      setFacultyLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>EduSync</Text>
        <Text style={styles.subtitle}>Student: Email/Password | Faculty/Admin: Email/Password</Text>

        <Text style={styles.sectionTitle}>Student</Text>
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
          placeholder="student password"
          secureTextEntry
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleStudentSignIn} activeOpacity={0.85}>
          {studentSignInLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Student Sign In</Text>}
        </TouchableOpacity>

        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85}>
            <Text style={styles.secondaryButtonText}>New student? Create account</Text>
          </TouchableOpacity>
        </Link>

        <Text style={styles.sectionTitle}>Faculty / Admin</Text>
        <TextInput
          style={styles.input}
          value={facultyEmail}
          onChangeText={setFacultyEmail}
          placeholder="faculty/admin email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          style={styles.input}
          value={facultyPassword}
          onChangeText={setFacultyPassword}
          placeholder="password"
          secureTextEntry
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity style={styles.primaryButton} onPress={handleFacultyAdminLogin} activeOpacity={0.85}>
          {facultyLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Faculty/Admin Login</Text>}
        </TouchableOpacity>

        <Text style={styles.adminHint}>Faculty account sirf super admin create kar sakta hai.</Text>
        <Text style={styles.adminHint}>Default super admin: admin@college.edu / 12345678</Text>
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
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    color: '#334155',
    fontWeight: '700',
    fontSize: 13,
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
    marginTop: 6,
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
  adminHint: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 12,
  },
});
