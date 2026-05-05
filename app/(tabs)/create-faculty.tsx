import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/context/auth-context';

export default function CreateFacultyScreen() {
  const { profile, facultyStatuses, createFacultyAccount } = useAuth();

  const [facultyName, setFacultyName] = useState('');
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyPassword, setFacultyPassword] = useState('');
  const [facultyDepartment, setFacultyDepartment] = useState('');
  const [facultyCabin, setFacultyCabin] = useState('');
  const [creatingFaculty, setCreatingFaculty] = useState(false);

  const handleCreateFaculty = async () => {
    if (!facultyName.trim() || !facultyEmail.trim() || !facultyPassword.trim()) {
      Alert.alert('Missing details', 'Faculty name, email and password are required.');
      return;
    }

    try {
      setCreatingFaculty(true);
      await createFacultyAccount({
        name: facultyName,
        email: facultyEmail,
        password: facultyPassword,
        department: facultyDepartment,
        cabinNumber: facultyCabin,
      });

      setFacultyName('');
      setFacultyEmail('');
      setFacultyPassword('');
      setFacultyDepartment('');
      setFacultyCabin('');

      Alert.alert('Faculty created', 'Faculty login and password created successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create faculty account.';
      Alert.alert('Create failed', message);
    } finally {
      setCreatingFaculty(false);
    }
  };


  if (profile?.role !== 'super_admin') {
    return (
      <View style={styles.root}>
        <View style={styles.card}>
          <Text style={styles.title}>Create Faculty</Text>
          <Text style={styles.note}>Only super admin can access this page.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Create Faculty Login</Text>
          <Text style={styles.note}>Total faculty accounts: {facultyStatuses.length}</Text>

          <Text style={styles.label}>Faculty Name</Text>
          <TextInput style={styles.input} value={facultyName} onChangeText={setFacultyName} placeholder="Faculty name" />

          <Text style={styles.label}>Faculty Email</Text>
          <TextInput
            style={styles.input}
            value={facultyEmail}
            onChangeText={setFacultyEmail}
            placeholder="faculty@college.edu"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Faculty Password</Text>
          <TextInput
            style={styles.input}
            value={facultyPassword}
            onChangeText={setFacultyPassword}
            placeholder="Set password"
            secureTextEntry
          />

          <Text style={styles.label}>Department</Text>
          <TextInput style={styles.input} value={facultyDepartment} onChangeText={setFacultyDepartment} placeholder="Department" />

          <Text style={styles.label}>Cabin Number</Text>
          <TextInput style={styles.input} value={facultyCabin} onChangeText={setFacultyCabin} placeholder="Cabin" />

          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateFaculty} activeOpacity={0.85}>
            {creatingFaculty ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Create Faculty</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fbff',
    padding: 16,
  },
  content: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 14,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  note: {
    marginTop: 6,
    color: '#64748b',
    fontSize: 13,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
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
  },
  primaryButton: {
    marginTop: 14,
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
});
