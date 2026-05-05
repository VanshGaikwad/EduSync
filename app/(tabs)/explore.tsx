import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/context/auth-context';

export default function ProfileScreen() {
  const { profile, signOutUser, updateMyProfile } = useAuth();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [cabinNumber, setCabinNumber] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!profile) return;

    setName(profile.name || '');
    setDepartment(profile.department || '');
    setCabinNumber(profile.cabinNumber || '');
    setPhotoUrl(profile.photoUrl || '');
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter your name.');
      return;
    }

    try {
      setSavingProfile(true);
      await updateMyProfile({ name, department, cabinNumber, photoUrl });
      Alert.alert('Saved', 'Profile updated.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update profile.';
      Alert.alert('Update failed', message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>{profile?.role === 'super_admin' ? 'Admin Profile' : 'My Profile'}</Text>
          <Text style={styles.meta}>Role: {profile?.role?.replace('_', ' ') || '-'}</Text>
          <Text style={styles.meta}>Email: {profile?.email || '-'}</Text>

          {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.avatar} /> : <View style={styles.avatarPlaceholder} />}

          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" />

          <Text style={styles.label}>Department</Text>
          <TextInput style={styles.input} value={department} onChangeText={setDepartment} placeholder="Department" />

          <Text style={styles.label}>Cabin Number</Text>
          <TextInput style={styles.input} value={cabinNumber} onChangeText={setCabinNumber} placeholder="Cabin" />

          <Text style={styles.label}>Photo URL</Text>
          <TextInput
            style={styles.input}
            value={photoUrl}
            onChangeText={setPhotoUrl}
            placeholder="https://..."
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleSaveProfile} activeOpacity={0.85}>
            {savingProfile ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Save Profile</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut} activeOpacity={0.85}>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
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
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
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
  meta: {
    marginTop: 6,
    color: '#64748b',
    fontSize: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginTop: 12,
    backgroundColor: '#dbeafe',
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginTop: 12,
    backgroundColor: '#dbeafe',
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
  logoutButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#b91c1c',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fee2e2',
  },
  logoutButtonText: {
    color: '#b91c1c',
    fontWeight: '700',
    fontSize: 14,
  },
});
