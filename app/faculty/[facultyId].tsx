import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { onValue, ref } from 'firebase/database';

import { db } from '@/lib/firebase';

type FacultyUserProfile = {
  uid: string;
  email: string;
  name: string;
  role: 'student' | 'faculty' | 'super_admin';
  department?: string;
  cabinNumber?: string;
  photoUrl?: string;
};

type FacultyStatus = {
  facultyId: string;
  name: string;
  department?: string;
  cabinNumber?: string;
  status: 'Available' | 'Busy' | 'Leave';
  message?: string;
  updatedAt?: unknown;
};

const STATUS_COLORS: Record<FacultyStatus['status'], string> = {
  Available: '#15803d',
  Busy: '#b91c1c',
  Leave: '#ca8a04',
};

export default function FacultyDetailScreen() {
  const { facultyId } = useLocalSearchParams<{ facultyId?: string }>();

  const [loading, setLoading] = useState(true);
  const [facultyProfile, setFacultyProfile] = useState<FacultyUserProfile | null>(null);
  const [facultyStatus, setFacultyStatus] = useState<FacultyStatus | null>(null);

  useEffect(() => {
    if (!facultyId) {
      setLoading(false);
      return;
    }

    const userRef = ref(db, `users/${facultyId}`);
    const statusRef = ref(db, `facultyStatus/${facultyId}`);

    const unsubscribeUser = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as Omit<FacultyUserProfile, 'uid'>;
        setFacultyProfile({ uid: facultyId, ...data });
      } else {
        setFacultyProfile(null);
      }
      setLoading(false);
    });

    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as Omit<FacultyStatus, 'facultyId'>;
        setFacultyStatus({ facultyId, ...data });
      } else {
        setFacultyStatus(null);
      }
    });

    return () => {
      unsubscribeUser();
      unsubscribeStatus();
    };
  }, [facultyId]);

  const badgeColor = useMemo(() => {
    if (!facultyStatus) return '#64748b';
    return STATUS_COLORS[facultyStatus.status];
  }, [facultyStatus]);

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  if (!facultyId || (!facultyProfile && !facultyStatus)) {
    return (
      <View style={styles.root}>
        <View style={styles.card}>
          <Text style={styles.title}>Faculty Not Found</Text>
          <Text style={styles.meta}>This faculty profile is not available.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>{facultyProfile?.name || facultyStatus?.name || 'Faculty'}</Text>
          <Text style={styles.meta}>Role: Faculty</Text>

          {facultyProfile?.photoUrl ? (
            <Image source={{ uri: facultyProfile.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}

          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{facultyProfile?.email || '-'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Department</Text>
            <Text style={styles.value}>{facultyProfile?.department || facultyStatus?.department || '-'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Cabin</Text>
            <Text style={styles.value}>{facultyProfile?.cabinNumber || facultyStatus?.cabinNumber || '-'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          {facultyStatus ? (
            <>
              <View style={[styles.badge, { backgroundColor: `${badgeColor}22` }]}> 
                <Text style={[styles.badgeText, { color: badgeColor }]}>{facultyStatus.status}</Text>
              </View>
              <Text style={styles.messageLabel}>Message</Text>
              <Text style={styles.messageValue}>{facultyStatus.message || 'No message'}</Text>
            </>
          ) : (
            <Text style={styles.meta}>No live status available.</Text>
          )}
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
  loaderWrap: {
    flex: 1,
    backgroundColor: '#f8fbff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 14,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  meta: {
    marginTop: 6,
    color: '#64748b',
    fontSize: 13,
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
  row: {
    marginTop: 12,
  },
  label: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    marginTop: 4,
    color: '#0f172a',
    fontSize: 14,
  },
  badge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  messageLabel: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  messageValue: {
    marginTop: 4,
    color: '#334155',
    fontSize: 14,
  },
});
